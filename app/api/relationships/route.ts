import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withApiHandler, 
  successResponse, 
  errorResponse, 
  ErrorCodes 
} from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/services/rate-limiter';
import { logger } from '@/lib/services/logger';

// GET /api/relationships - Get relationships
export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  
  const characterAId = searchParams.get('characterAId');
  const characterBId = searchParams.get('characterBId');
  const relationshipType = searchParams.get('type');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const where: any = {};
    
    if (characterAId) {
      where.characterAId = characterAId;
    }
    
    if (characterBId) {
      where.characterBId = characterBId;
    }
    
    if (relationshipType) {
      where.relationshipType = relationshipType.toUpperCase();
    }

    const [relationships, total] = await Promise.all([
      prisma.characterRelationship.findMany({
        where,
        include: {
          characterA: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          characterB: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.characterRelationship.count({ where }),
    ]);

    return successResponse({ relationships, total, limit, offset }, {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
    });
  } catch (error) {
    logger.error('Failed to fetch relationships', error as Error);
    throw error;
  }
});

// POST /api/relationships - Create a relationship
export const POST = withApiHandler(async (req: NextRequest) => {
  // Rate limiting
  const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await checkRateLimit(identifier, 20, 60);
  
  if (!rateLimit.allowed) {
    return errorResponse(
      ErrorCodes.RATE_LIMITED,
      'Too many requests',
      429,
      { retryAfter: rateLimit.retryAfter }
    );
  }

  const body = await req.json();

  // Validate required fields
  if (!body.characterAId || !body.characterBId || !body.relationshipType) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Missing required fields: characterAId, characterBId, relationshipType',
      422
    );
  }

  // Prevent self-relationships
  if (body.characterAId === body.characterBId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Characters cannot have a relationship with themselves',
      422
    );
  }

  // Validate relationship type
  const validTypes = [
    'FRIEND', 'COWORKER', 'FAMILY', 'ROMANTIC', 
    'NEIGHBOR', 'ACQUAINTANCE', 'RIVAL', 'STRANGER'
  ];
  
  if (!validTypes.includes(body.relationshipType.toUpperCase())) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      `Invalid relationship type. Must be one of: ${validTypes.join(', ')}`,
      422
    );
  }

  // Verify both characters exist
  const [charA, charB] = await Promise.all([
    prisma.character.findUnique({ where: { id: body.characterAId } }),
    prisma.character.findUnique({ where: { id: body.characterBId } }),
  ]);

  if (!charA) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      'Character A not found',
      404
    );
  }

  if (!charB) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      'Character B not found',
      404
    );
  }

  try {
    const relationship = await prisma.characterRelationship.create({
      data: {
        characterAId: body.characterAId,
        characterBId: body.characterBId,
        relationshipType: body.relationshipType.toUpperCase(),
        intimacy: body.intimacy ? Math.max(0, Math.min(100, body.intimacy)) : 0,
        trust: body.trust ? Math.max(0, Math.min(100, body.trust)) : 50,
        firstMetAt: body.firstMetAt ? new Date(body.firstMetAt) : new Date(),
        firstMetLocation: body.firstMetLocation,
      },
      include: {
        characterA: {
          select: { id: true, name: true, avatar: true },
        },
        characterB: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    logger.info('Relationship created', { 
      relationshipId: relationship.id,
      characterA: relationship.characterAId,
      characterB: relationship.characterBId
    });

    return successResponse(relationship, undefined, 201);
  } catch (error) {
    logger.error('Failed to create relationship', error as Error, { body });
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return errorResponse(
        ErrorCodes.CONFLICT,
        'Relationship already exists between these characters',
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
