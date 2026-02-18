import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withApiHandler, 
  successResponse, 
  errorResponse, 
  ErrorCodes 
} from '@/lib/api-utils';
import { cacheGet, cacheSet, getRedisClient, CACHE_TTL } from '@/lib/services/cache';
import { logger } from '@/lib/services/logger';

// GET /api/places/[id] - Get place details
export const GET = withApiHandler(async (req, context) => {
  const params = await context?.params;
  const id = params?.id;

  if (!id) {
    return errorResponse(
      ErrorCodes.BAD_REQUEST,
      'Place ID is required',
      400
    );
  }

  const cacheKey = `place:${id}`;

  try {
    // Try cache
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return successResponse(cached);
    }

    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        homeCharacters: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        workCharacters: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            homeCharacters: true,
            workCharacters: true,
          },
        },
      },
    });

    if (!place) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Place not found',
        404
      );
    }

    // Cache for 1 hour
    await cacheSet(cacheKey, place, CACHE_TTL.places);

    return successResponse(place);
  } catch (error) {
    logger.error('Failed to fetch place', error as Error, { placeId: id });
    throw error;
  }
});

// PATCH /api/places/[id] - Update place
export const PATCH = withApiHandler(async (req, context) => {
  const params = await context?.params;
  const id = params?.id;

  if (!id) {
    return errorResponse(
      ErrorCodes.BAD_REQUEST,
      'Place ID is required',
      400
    );
  }

  // Verify place exists
  const existing = await prisma.place.findUnique({
    where: { id },
  });

  if (!existing) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      'Place not found',
      404
    );
  }

  const body = await req.json();

  // Validate rating if provided
  if (body.rating !== undefined && (body.rating < 0 || body.rating > 5)) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Rating must be between 0 and 5',
      422
    );
  }

  // Validate place type if provided
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
    const place = await prisma.place.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        address: body.address?.trim(),
        description: body.description?.trim(),
        placeType: body.placeType?.toUpperCase(),
        rating: body.rating,
        openingHours: body.openingHours,
        phoneNumber: body.phoneNumber,
        website: body.website,
        photoUrls: body.photoUrls,
      },
    });

    // Invalidate caches
    const redis = getRedisClient();
    if (redis) {
      await redis.del(`place:${id}`);
      const keys = await redis.keys('places:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    logger.info('Place updated', { placeId: id });

    return successResponse(place);
  } catch (error) {
    logger.error('Failed to update place', error as Error, { placeId: id, body });
    throw error;
  }
});

// DELETE /api/places/[id] - Delete place
export const DELETE = withApiHandler(async (req, context) => {
  const params = await context?.params;
  const id = params?.id;

  if (!id) {
    return errorResponse(
      ErrorCodes.BAD_REQUEST,
      'Place ID is required',
      400
    );
  }

  // Verify place exists
  const existing = await prisma.place.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          homeCharacters: true,
          workCharacters: true,
        },
      },
    },
  });

  if (!existing) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      'Place not found',
      404
    );
  }

  // Check for associated characters
  if (existing._count.homeCharacters > 0 || existing._count.workCharacters > 0) {
    return errorResponse(
      ErrorCodes.CONFLICT,
      'Cannot delete place with associated characters. Please reassign characters first.',
      409
    );
  }

  try {
    await prisma.place.delete({
      where: { id },
    });

    // Invalidate caches
    const redis = getRedisClient();
    if (redis) {
      await redis.del(`place:${id}`);
      const keys = await redis.keys('places:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    logger.info('Place deleted', { placeId: id });

    return successResponse({ success: true });
  } catch (error) {
    logger.error('Failed to delete place', error as Error, { placeId: id });
    throw error;
  }
});

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
