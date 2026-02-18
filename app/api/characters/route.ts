import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withApiHandler, 
  successResponse, 
  errorResponse, 
  ErrorCodes,
  validateBody 
} from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/services/rate-limiter';
import { cacheGet, cacheSet, getRedisClient, CACHE_KEYS } from '@/lib/services/cache';
import { logger } from '@/lib/services/logger';

// GET /api/characters - Get all characters
export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const townId = searchParams.get('townId');
  const isUserCreated = searchParams.get('isUserCreated');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  const cacheKey = CACHE_KEYS.characters(townId || 'all') + `:${offset}:${limit}`;
  
  try {
    // Try cache
    const cached = await cacheGet(cacheKey);
    if (cached && !searchParams.has('nocache')) {
      return successResponse(cached, { 
        page: Math.floor(offset / limit) + 1,
        limit,
      });
    }

    const [characters, total] = await Promise.all([
      prisma.character.findMany({
        where: {
          ...(townId && { townId }),
          ...(isUserCreated !== null && { isUserCreated: isUserCreated === 'true' }),
          isActive: true,
        },
        include: {
          homeLocation: {
            select: { id: true, name: true, lat: true, lng: true },
          },
          workLocation: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.character.count({
        where: {
          ...(townId && { townId }),
          ...(isUserCreated !== null && { isUserCreated: isUserCreated === 'true' }),
          isActive: true,
        },
      }),
    ]);

    const result = { characters, total, limit, offset };

    // Cache for 5 minutes
    await cacheSet(cacheKey, result, CACHE_TTL.characters);

    return successResponse(result, {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
    });
  } catch (error) {
    logger.error('Failed to fetch characters', error as Error);
    throw error;
  }
});

// POST /api/characters - Create a new character
export const POST = withApiHandler(async (req: NextRequest) => {
  // Rate limiting for character creation
  const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await checkRateLimit(identifier, 10, 60);
  
  if (!rateLimit.allowed) {
    return errorResponse(
      ErrorCodes.RATE_LIMITED,
      'Too many character creations. Please try again later.',
      429,
      { retryAfter: rateLimit.retryAfter }
    );
  }

  const body = await req.json();

  // Validate required fields
  validateBody<{
    name: string;
    age: number;
    townId: string;
    homeLocationId: string;
  }>(body, ['name', 'age', 'townId', 'homeLocationId'], {
    age: (v) => typeof v === 'number' && v > 0 && v < 150,
  });

  // Verify town exists
  const town = await prisma.town.findUnique({
    where: { id: body.townId },
  });

  if (!town) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      'Town not found',
      404
    );
  }

  // Verify home location exists
  const homeLocation = await prisma.place.findUnique({
    where: { id: body.homeLocationId },
  });

  if (!homeLocation) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      'Home location not found',
      404
    );
  }

  // Validate work location if provided
  if (body.workLocationId) {
    const workLocation = await prisma.place.findUnique({
      where: { id: body.workLocationId },
    });

    if (!workLocation) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Work location not found',
        404
      );
    }
  }

  try {
    const character = await prisma.character.create({
      data: {
        townId: body.townId,
        name: body.name.trim(),
        avatar: body.avatar,
        age: body.age,
        gender: body.gender,
        bio: body.bio?.trim(),
        personality: body.personality || {},
        occupation: body.occupation || 'Resident',
        homeLocationId: body.homeLocationId,
        workLocationId: body.workLocationId,
        wealth: body.wealth || 50000,
        income: body.income || 5000,
        lifestyle: body.lifestyle || {},
        goals: body.goals || [],
        habits: body.habits || {},
        preferences: body.preferences || {},
        isUserCreated: body.isUserCreated || false,
        currentStatus: 'IDLE',
        currentMood: 'neutral',
      },
      include: {
        homeLocation: {
          select: { id: true, name: true, lat: true, lng: true },
        },
        workLocation: {
          select: { id: true, name: true },
        },
      },
    });

    // Invalidate character cache
    const redis = getRedisClient();
    if (redis) {
      const keys = await redis.keys('characters:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    logger.info('Character created', { 
      characterId: character.id, 
      name: character.name,
      townId: character.townId 
    });

    return successResponse(character, undefined, 201);
  } catch (error) {
    logger.error('Failed to create character', error as Error, { body });
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return errorResponse(
        ErrorCodes.CONFLICT,
        'A character with this name already exists in this town',
        409
      );
    }
    
    throw error;
  }
});

// Cache TTLs
const CACHE_TTL = {
  characters: 300, // 5 minutes
};

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
