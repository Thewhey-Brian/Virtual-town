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

// GET /api/conversations - Get conversations
export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  
  const characterId = searchParams.get('characterId');
  const locationId = searchParams.get('locationId');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  const cacheKey = `conversations:${characterId || 'all'}:${locationId || 'all'}:${offset}:${limit}`;

  try {
    // Try cache
    const cached = await cacheGet(cacheKey);
    if (cached && !searchParams.has('nocache')) {
      return successResponse(cached, {
        page: Math.floor(offset / limit) + 1,
        limit,
      });
    }

    const where: any = {};
    
    if (characterId) {
      where.characterIds = { has: characterId };
    }
    
    if (locationId) {
      where.locationId = locationId;
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.conversation.count({ where }),
    ]);

    // Enrich with character names
    const characterIds = [...new Set(conversations.flatMap(c => c.characterIds))];
    const characters = await prisma.character.findMany({
      where: { id: { in: characterIds } },
      select: { id: true, name: true, avatar: true },
    });

    const enrichedConversations = conversations.map(conv => ({
      ...conv,
      participants: conv.characterIds.map(id => 
        characters.find(c => c.id === id) || { id, name: 'Unknown' }
      ),
    }));

    const result = { 
      conversations: enrichedConversations, 
      total, 
      limit, 
      offset 
    };

    // Cache for 10 minutes
    await cacheSet(cacheKey, result, CACHE_TTL.conversations);

    return successResponse(result, {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
    });
  } catch (error) {
    logger.error('Failed to fetch conversations', error as Error);
    throw error;
  }
});

// POST /api/conversations - Create a conversation manually
export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();

  // Validate required fields
  if (!body.characterIds || !Array.isArray(body.characterIds) || body.characterIds.length < 2) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'At least 2 characters are required for a conversation',
      422
    );
  }

  // Verify all characters exist
  const characters = await prisma.character.findMany({
    where: { id: { in: body.characterIds } },
    select: { id: true, name: true },
  });

  if (characters.length !== body.characterIds.length) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'One or more characters not found',
      422
    );
  }

  try {
    const conversation = await prisma.conversation.create({
      data: {
        characterIds: body.characterIds,
        locationId: body.locationId,
        startedAt: new Date(),
        topic: body.topic?.trim(),
        context: body.context?.trim(),
        messages: body.messages || [],
        isAiGenerated: false,
      },
    });

    // Invalidate cache
    const redis = getRedisClient();
    if (redis) {
      const keys = await redis.keys('conversations:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    logger.info('Conversation created', { 
      conversationId: conversation.id,
      characterCount: body.characterIds.length 
    });

    return successResponse(conversation, undefined, 201);
  } catch (error) {
    logger.error('Failed to create conversation', error as Error, { body });
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
