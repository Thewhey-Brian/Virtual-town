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

// GET /api/characters/[id] - Get character details
export const GET = withApiHandler(async (req, context) => {
  const params = await context?.params;
  const id = params?.id;

  if (!id) {
    return errorResponse(
      ErrorCodes.BAD_REQUEST,
      'Character ID is required',
      400
    );
  }

  const cacheKey = `character:${id}`;

  try {
    // Try cache
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return successResponse(cached);
    }

    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        homeLocation: true,
        workLocation: true,
        town: {
          select: {
            id: true,
            name: true,
            currentTime: true,
          },
        },
        _count: {
          select: {
            memories: true,
            routines: true,
            relationshipsAsA: true,
            relationshipsAsB: true,
          },
        },
      },
    });

    if (!character) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Character not found',
        404
      );
    }

    // Cache for 5 minutes
    await cacheSet(cacheKey, character, CACHE_TTL.characters);

    return successResponse(character);
  } catch (error) {
    logger.error('Failed to fetch character', error as Error, { characterId: id });
    throw error;
  }
});

// PATCH /api/characters/[id] - Update character
export const PATCH = withApiHandler(async (req, context) => {
  const params = await context?.params;
  const id = params?.id;

  if (!id) {
    return errorResponse(
      ErrorCodes.BAD_REQUEST,
      'Character ID is required',
      400
    );
  }

  const body = await req.json();

  // Verify character exists
  const existing = await prisma.character.findUnique({
    where: { id },
  });

  if (!existing) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      'Character not found',
      404
    );
  }

  // Validate age if provided
  if (body.age !== undefined && (body.age < 0 || body.age > 150)) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Age must be between 0 and 150',
      422
    );
  }

  // Validate wealth/income if provided
  if (body.wealth !== undefined && body.wealth < 0) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Wealth cannot be negative',
      422
    );
  }

  if (body.income !== undefined && body.income < 0) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Income cannot be negative',
      422
    );
  }

  // Validate status if provided
  const validStatuses = [
    'SLEEPING', 'IDLE', 'WORKING', 'EATING', 
    'TRAVELING', 'SOCIALIZING', 'EXERCISING', 'SHOPPING'
  ];
  
  if (body.currentStatus && !validStatuses.includes(body.currentStatus.toUpperCase())) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      422
    );
  }

  try {
    const character = await prisma.character.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        age: body.age,
        gender: body.gender,
        bio: body.bio?.trim(),
        occupation: body.occupation?.trim(),
        homeLocationId: body.homeLocationId,
        workLocationId: body.workLocationId,
        personality: body.personality,
        lifestyle: body.lifestyle,
        habits: body.habits,
        preferences: body.preferences,
        goals: body.goals,
        wealth: body.wealth,
        income: body.income,
        currentStatus: body.currentStatus?.toUpperCase(),
        currentMood: body.currentMood,
        avatar: body.avatar,
      },
      include: {
        homeLocation: true,
        workLocation: true,
      },
    });

    // Invalidate caches
    const redis = getRedisClient();
    if (redis) {
      await redis.del(`character:${id}`);
      const keys = await redis.keys('characters:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    logger.info('Character updated', { characterId: id });

    return successResponse(character);
  } catch (error) {
    logger.error('Failed to update character', error as Error, { characterId: id, body });
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return errorResponse(
        ErrorCodes.CONFLICT,
        'A character with this name already exists',
        409
      );
    }
    
    throw error;
  }
});

// DELETE /api/characters/[id] - Delete character
export const DELETE = withApiHandler(async (req, context) => {
  const params = await context?.params;
  const id = params?.id;

  if (!id) {
    return errorResponse(
      ErrorCodes.BAD_REQUEST,
      'Character ID is required',
      400
    );
  }

  // Verify character exists
  const existing = await prisma.character.findUnique({
    where: { id },
  });

  if (!existing) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      'Character not found',
      404
    );
  }

  try {
    await prisma.character.delete({
      where: { id },
    });

    // Invalidate caches
    const redis = getRedisClient();
    if (redis) {
      await redis.del(`character:${id}`);
      const keys = await redis.keys('characters:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    logger.info('Character deleted', { characterId: id });

    return successResponse({ success: true });
  } catch (error) {
    logger.error('Failed to delete character', error as Error, { characterId: id });
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
