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

// GET /api/routines - Get routines
export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  
  const characterId = searchParams.get('characterId');
  const date = searchParams.get('date');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  // Build cache key
  const cacheKey = `routines:${characterId || 'all'}:${date || fromDate || 'all'}:${offset}:${limit}`;

  try {
    // Try cache
    const cached = await cacheGet(cacheKey);
    if (cached && !searchParams.has('nocache')) {
      return successResponse(cached, { 
        page: Math.floor(offset / limit) + 1,
        limit,
      });
    }

    const [routines, total] = await Promise.all([
      prisma.characterRoutine.findMany({
        where: {
          ...(characterId && { characterId }),
          ...(date && { date: new Date(date) }),
          ...(fromDate && toDate && {
            date: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            },
          }),
        },
        include: {
          character: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          fromLocation: {
            select: {
              id: true,
              name: true,
              lat: true,
              lng: true,
            },
          },
          toLocation: {
            select: {
              id: true,
              name: true,
              lat: true,
              lng: true,
            },
          },
        },
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        take: limit,
        skip: offset,
      }),
      prisma.characterRoutine.count({
        where: {
          ...(characterId && { characterId }),
          ...(date && { date: new Date(date) }),
          ...(fromDate && toDate && {
            date: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            },
          }),
        },
      }),
    ]);

    const result = { routines, total, limit, offset };

    // Cache for 5 minutes
    await cacheSet(cacheKey, result, CACHE_TTL.characterRoutines);

    return successResponse(result, {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
    });
  } catch (error) {
    logger.error('Failed to fetch routines', error as Error);
    throw error;
  }
});

// POST /api/routines - Create routine segments
export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { routines } = body;

  if (!Array.isArray(routines)) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Routines must be an array',
      422
    );
  }

  if (routines.length === 0) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'At least one routine is required',
      422
    );
  }

  if (routines.length > 100) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Maximum 100 routines per request',
      422
    );
  }

  // Validate each routine
  for (let i = 0; i < routines.length; i++) {
    const routine = routines[i];
    
    if (!routine.characterId || !routine.fromLocationId || !routine.toLocationId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Routine ${i + 1}: Missing required fields (characterId, fromLocationId, toLocationId)`,
        422
      );
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(routine.startTime) || !timeRegex.test(routine.endTime)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Routine ${i + 1}: Invalid time format. Use HH:MM`,
        422
      );
    }

    // Validate action type
    const validActionTypes = [
      'WAKE', 'SLEEP', 'HOME', 'TRAVEL', 'WORK', 
      'MEAL', 'SHOPPING', 'SOCIAL', 'EXERCISE', 'LEISURE', 'STUDY', 'ERRAND'
    ];
    
    if (!validActionTypes.includes(routine.actionType?.toUpperCase())) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Routine ${i + 1}: Invalid action type`,
        422
      );
    }
  }

  try {
    const created = await prisma.$transaction(
      routines.map((routine: any) =>
        prisma.characterRoutine.create({
          data: {
            characterId: routine.characterId,
            date: new Date(routine.date),
            startTime: routine.startTime,
            endTime: routine.endTime,
            fromLocationId: routine.fromLocationId,
            toLocationId: routine.toLocationId,
            actionType: routine.actionType.toUpperCase(),
            description: routine.description?.trim() || '',
            purpose: routine.purpose?.trim() || '',
            mood: routine.mood || 'neutral',
            companionIds: routine.companionIds || [],
            details: routine.details || {},
            isAiGenerated: routine.isAiGenerated ?? true,
          },
        })
      )
    );

    // Invalidate caches
    const redis = getRedisClient();
    if (redis) {
      const characterIds = [...new Set(routines.map((r: any) => r.characterId))];
      for (const charId of characterIds) {
        const keys = await redis.keys(`routines:${charId}:*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
    }

    logger.info('Routines created', { count: created.length });

    return successResponse(created, undefined, 201);
  } catch (error) {
    logger.error('Failed to create routines', error as Error);
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
