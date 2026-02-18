import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withApiHandler, 
  successResponse, 
  errorResponse, 
  ErrorCodes 
} from '@/lib/api-utils';
import { cacheGet, cacheSet, getRedisClient, CACHE_KEYS, CACHE_TTL } from '@/lib/services/cache';
import { logger } from '@/lib/services/logger';

// GET /api/places - Get all places
export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const townId = searchParams.get('townId');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);
  const offset = parseInt(searchParams.get('offset') || '0');

  const cacheKey = CACHE_KEYS.places(townId || 'all') + `:${type || 'all'}:${offset}:${limit}`;
  
  try {
    // Try cache
    const cached = await cacheGet(cacheKey);
    if (cached && !searchParams.has('nocache')) {
      return successResponse(cached, { 
        page: Math.floor(offset / limit) + 1,
        limit,
      });
    }

    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where: {
          ...(type && { placeType: type.toUpperCase() as any }),
          ...(townId && { townId }),
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.place.count({
        where: {
          ...(type && { placeType: type.toUpperCase() as any }),
          ...(townId && { townId }),
        },
      }),
    ]);

    const result = { places, total, limit, offset };

    // Cache for 1 hour
    await cacheSet(cacheKey, result, CACHE_TTL.places);

    return successResponse(result, {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
    });
  } catch (error) {
    logger.error('Failed to fetch places', error as Error);
    throw error;
  }
});

// POST /api/places - Create a new place
export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();

  // Validate required fields
  if (!body.name || !body.lat || !body.lng) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Missing required fields: name, lat, lng',
      422
    );
  }

  // Validate coordinates
  if (typeof body.lat !== 'number' || body.lat < -90 || body.lat > 90) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid latitude. Must be between -90 and 90.',
      422
    );
  }

  if (typeof body.lng !== 'number' || body.lng < -180 || body.lng > 180) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid longitude. Must be between -180 and 180.',
      422
    );
  }

  // Validate place type
  const validPlaceTypes = [
    'HOME', 'CAFE', 'RESTAURANT', 'SHOP', 'PARK', 
    'LIBRARY', 'WORK', 'TRANSPORT', 'ENTERTAINMENT', 
    'GYM', 'HOSPITAL', 'SCHOOL', 'OTHER'
  ];
  
  if (body.placeType && !validPlaceTypes.includes(body.placeType.toUpperCase())) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      `Invalid place type. Must be one of: ${validPlaceTypes.join(', ')}`,
      422
    );
  }

  try {
    const place = await prisma.place.create({
      data: {
        townId: body.townId,
        googlePlaceId: body.googlePlaceId,
        name: body.name.trim(),
        address: body.address?.trim(),
        lat: body.lat,
        lng: body.lng,
        types: body.types || [],
        placeType: body.placeType?.toUpperCase() || 'OTHER',
        icon: body.icon,
        description: body.description?.trim(),
        rating: body.rating ? Math.max(0, Math.min(5, body.rating)) : null,
        userRatingsTotal: body.userRatingsTotal,
        openingHours: body.openingHours,
        phoneNumber: body.phoneNumber,
        website: body.website,
        photoUrls: body.photoUrls || [],
      },
    });

    // Invalidate places cache
    const redis = getRedisClient();
    if (redis) {
      const keys = await redis.keys('places:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    logger.info('Place created', { placeId: place.id, name: place.name });

    return successResponse(place, undefined, 201);
  } catch (error) {
    logger.error('Failed to create place', error as Error, { body });
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return errorResponse(
        ErrorCodes.CONFLICT,
        'A place with this Google Place ID already exists',
        409
      );
    }
    
    throw error;
  }
});

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
