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

// GET /api/characters/[id]/memories - Get character memories
export const GET = withApiHandler(async (req, context) => {
  const params = await context?.params;
  const id = params?.id;
  const { searchParams } = new URL(req.url);
  
  if (!id) {
    return errorResponse(
      ErrorCodes.BAD_REQUEST,
      'Character ID is required',
      400
    );
  }

  const category = searchParams.get('category');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  const cacheKey = `character:${id}:memories:${category || 'all'}:${offset}:${limit}`;

  try {
    // Verify character exists
    const character = await prisma.character.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!character) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Character not found',
        404
      );
    }

    // Try cache
    const cached = await cacheGet(cacheKey);
    if (cached && !searchParams.has('nocache')) {
      return successResponse(cached, { 
        page: Math.floor(offset / limit) + 1,
        limit,
      });
    }

    const [memories, total] = await Promise.all([
      prisma.characterMemory.findMany({
        where: {
          characterId: id,
          ...(category && { category: category as any }),
        },
        orderBy: [
          { importance: 'desc' },
          { date: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.characterMemory.count({
        where: {
          characterId: id,
          ...(category && { category: category as any }),
        },
      }),
    ]);

    const result = { memories, total, limit, offset };

    // Cache for 10 minutes
    await cacheSet(cacheKey, result, CACHE_TTL.conversations);

    return successResponse(result, {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
    });
  } catch (error) {
    logger.error('Failed to fetch memories', error as Error, { characterId: id });
    throw error;
  }
});

// POST /api/characters/[id]/memories - Create a memory
export const POST = withApiHandler(async (req, context) => {
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

  // Validate required fields
  if (!body.content || !body.category) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Missing required fields: content, category',
      422
    );
  }

  // Validate category
  const validCategories = [
    'PEOPLE', 'PLACES', 'EVENTS', 'PREFERENCES', 
    'DAILY', 'MILESTONE', 'RELATIONSHIP', 'WORK', 'LEISURE'
  ];
  
  if (!validCategories.includes(body.category.toUpperCase())) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      422
    );
  }

  // Verify character exists
  const character = await prisma.character.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!character) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      'Character not found',
      404
    );
  }

  try {
    const memory = await prisma.characterMemory.create({
      data: {
        characterId: id,
        category: body.category.toUpperCase(),
        content: body.content.trim(),
        date: body.date ? new Date(body.date) : new Date(),
        locationId: body.locationId,
        involvedCharacters: body.involvedCharacters || [],
        importance: Math.max(1, Math.min(10, body.importance || 5)),
        sentiment: body.sentiment ? Math.max(-1, Math.min(1, body.sentiment)) : null,
        emotions: body.emotions || [],
        keywords: body.keywords || [],
      },
    });

    // Invalidate cache
    const redis = getRedisClient();
    if (redis) {
      const keys = await redis.keys(`character:${id}:memories:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    logger.info('Memory created', { 
      memoryId: memory.id, 
      characterId: id,
      category: memory.category 
    });

    return successResponse(memory, undefined, 201);
  } catch (error) {
    logger.error('Failed to create memory', error as Error, { characterId: id, body });
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
