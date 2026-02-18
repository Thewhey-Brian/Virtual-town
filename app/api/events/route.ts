import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withApiHandler, 
  successResponse, 
  errorResponse, 
  ErrorCodes 
} from '@/lib/api-utils';
import { generateSpecialEvents } from '@/lib/services/event-generator';
import { cacheGet, cacheSet, getRedisClient, CACHE_TTL } from '@/lib/services/cache';
import { logger } from '@/lib/services/logger';

// GET /api/events - Get events
export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  
  const townId = searchParams.get('townId');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const eventType = searchParams.get('type');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  const cacheKey = `events:${townId || 'all'}:${eventType || 'all'}:${fromDate || 'all'}:${offset}:${limit}`;

  try {
    // Try cache
    const cached = await cacheGet(cacheKey);
    if (cached && !searchParams.has('nocache')) {
      return successResponse(cached, { 
        page: Math.floor(offset / limit) + 1,
        limit,
      });
    }

    const [events, total] = await Promise.all([
      prisma.townEvent.findMany({
        where: {
          ...(townId && { townId }),
          ...(eventType && { eventType: eventType.toUpperCase() as any }),
          ...(fromDate && toDate && {
            startDate: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            },
          }),
        },
        include: {
          town: {
            select: { name: true },
          },
        },
        orderBy: { startDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.townEvent.count({
        where: {
          ...(townId && { townId }),
          ...(eventType && { eventType: eventType.toUpperCase() as any }),
          ...(fromDate && toDate && {
            startDate: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            },
          }),
        },
      }),
    ]);

    const result = { events, total, limit, offset };

    // Cache for 30 minutes
    await cacheSet(cacheKey, result, CACHE_TTL.events);

    return successResponse(result, {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
    });
  } catch (error) {
    logger.error('Failed to fetch events', error as Error);
    throw error;
  }
});

// POST /api/events - Create a new event or generate events
export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();

  // Generate events mode
  if (body.generate) {
    const town = await prisma.town.findFirst();
    
    if (!town) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'No town found',
        404
      );
    }

    const targetDate = body.date ? new Date(body.date) : new Date();
    
    try {
      const generatedEvents = await generateSpecialEvents({
        townId: town.id,
        date: targetDate,
        weather: town.weather,
        season: town.season,
        isHoliday: town.isHoliday,
        holidayName: town.holidayName || undefined,
      });

      // Save generated events
      const savedEvents = await Promise.all(
        generatedEvents.map(event =>
          prisma.townEvent.create({
            data: {
              townId: town.id,
              name: event.name,
              description: event.description,
              eventType: event.eventType as any,
              startDate: event.startDate,
              endDate: event.endDate,
              startTime: event.startTime,
              endTime: event.endTime,
              isAllDay: event.isAllDay,
              affectedAreas: event.affectedAreas,
              crowdLevel: event.crowdLevel,
              specialActivities: event.specialActivities,
              weatherEffect: event.weatherEffect as any,
              storyLine: event.storyline,
              involvedCharacters: event.involvedCharacters || [],
              isAiGenerated: true,
            },
          })
        )
      );

      // Invalidate cache
      const redis = getRedisClient();
      if (redis) {
        const keys = await redis.keys('events:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }

      logger.info('Events generated', { count: savedEvents.length });

      return successResponse({
        success: true,
        count: savedEvents.length,
        events: savedEvents,
      }, undefined, 201);
    } catch (error) {
      logger.error('Failed to generate events', error as Error);
      throw error;
    }
  }

  // Create manual event
  if (!body.name || !body.eventType || !body.startDate || !body.endDate) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Missing required fields: name, eventType, startDate, endDate',
      422
    );
  }

  // Validate event type
  const validEventTypes = [
    'HOLIDAY', 'FESTIVAL', 'WEATHER', 'SOCIAL', 
    'MARKET', 'CONCERT', 'SPORTS', 'COMMUNITY', 'EMERGENCY', 'STORY'
  ];
  
  if (!validEventTypes.includes(body.eventType.toUpperCase())) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      `Invalid event type. Must be one of: ${validEventTypes.join(', ')}`,
      422
    );
  }

  try {
    const event = await prisma.townEvent.create({
      data: {
        townId: body.townId,
        name: body.name.trim(),
        description: body.description?.trim(),
        eventType: body.eventType.toUpperCase(),
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        startTime: body.startTime,
        endTime: body.endTime,
        isAllDay: body.isAllDay ?? true,
        locationId: body.locationId,
        affectedAreas: body.affectedAreas || [],
        crowdLevel: body.crowdLevel ? Math.max(1, Math.min(10, body.crowdLevel)) : null,
        specialActivities: body.specialActivities || [],
        weatherEffect: body.weatherEffect,
        storyLine: body.storyLine,
        involvedCharacters: body.involvedCharacters || [],
        isRecurring: body.isRecurring || false,
        recurrencePattern: body.recurrencePattern,
        isAiGenerated: false,
      },
    });

    // Invalidate cache
    const redis = getRedisClient();
    if (redis) {
      const keys = await redis.keys('events:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    logger.info('Event created', { eventId: event.id, name: event.name });

    return successResponse(event, undefined, 201);
  } catch (error) {
    logger.error('Failed to create event', error as Error, { body });
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
