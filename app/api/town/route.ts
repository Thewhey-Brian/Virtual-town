import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withApiHandler, 
  successResponse, 
  errorResponse, 
  ErrorCodes,
  validateBody 
} from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/services/rate-limiter';

// GET /api/town - Get current town state
export const GET = withApiHandler(async () => {
  try {
    const town = await prisma.town.findFirst({
      include: {
        places: {
          select: {
            id: true,
            name: true,
            lat: true,
            lng: true,
            placeType: true,
          },
          take: 100,
        },
        events: {
          where: {
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          select: {
            id: true,
            name: true,
            eventType: true,
            description: true,
          },
        },
        _count: {
          select: {
            characters: true,
            places: true,
          },
        },
      },
    });

    if (!town) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Town not found. Please seed the database first.',
        404
      );
    }

    return successResponse(town);
  } catch (error) {
    console.error('Failed to fetch town:', error);
    throw error;
  }
});

// POST /api/town - Create a new town
export const POST = withApiHandler(async (req: NextRequest) => {
  // Rate limiting
  const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await checkRateLimit(identifier, 5, 60);
  
  if (!rateLimit.allowed) {
    return errorResponse(
      ErrorCodes.RATE_LIMITED,
      'Too many requests. Please try again later.',
      429,
      { retryAfter: rateLimit.retryAfter }
    );
  }

  const body = await req.json();
  
  // Validate required fields
  validateBody<{ name: string }>(body, ['name']);

  const town = await prisma.town.create({
    data: {
      name: body.name,
      region: body.region || 'CA',
      country: body.country || 'USA',
      currentDate: body.currentDate ? new Date(body.currentDate) : new Date(),
      currentTime: body.currentTime || '08:00',
      timeSpeed: body.timeSpeed || 1,
      weather: body.weather || 'SUNNY',
      temperature: body.temperature || 72,
      season: body.season || 'SPRING',
      isHoliday: body.isHoliday || false,
      holidayName: body.holidayName,
    },
  });

  return successResponse(town, undefined, 201);
});

// PATCH /api/town - Update town state
export const PATCH = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  
  const existingTown = await prisma.town.findFirst();
  
  if (!existingTown) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      'Town not found',
      404
    );
  }

  // Validate time format if provided
  if (body.currentTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(body.currentTime)) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid time format. Use HH:MM format.',
      422
    );
  }

  // Validate weather value
  const validWeather = ['SUNNY', 'CLOUDY', 'RAINY', 'SNOWY', 'FOGGY', 'WINDY'];
  if (body.weather && !validWeather.includes(body.weather)) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      `Invalid weather. Must be one of: ${validWeather.join(', ')}`,
      422
    );
  }

  // Validate season value
  const validSeasons = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];
  if (body.season && !validSeasons.includes(body.season)) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      `Invalid season. Must be one of: ${validSeasons.join(', ')}`,
      422
    );
  }

  const updated = await prisma.town.update({
    where: { id: existingTown.id },
    data: {
      currentDate: body.currentDate ? new Date(body.currentDate) : undefined,
      currentTime: body.currentTime,
      timeSpeed: typeof body.timeSpeed === 'number' ? body.timeSpeed : undefined,
      weather: body.weather,
      temperature: typeof body.temperature === 'number' ? body.temperature : undefined,
      season: body.season,
      isHoliday: typeof body.isHoliday === 'boolean' ? body.isHoliday : undefined,
      holidayName: body.holidayName,
      currentLat: typeof body.currentLat === 'number' ? body.currentLat : undefined,
      currentLng: typeof body.currentLng === 'number' ? body.currentLng : undefined,
    },
  });

  return successResponse(updated);
});

// DELETE /api/town - Delete town (admin only)
export const DELETE = withApiHandler(async (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Unauthorized',
        401
      );
    }
  }

  const town = await prisma.town.findFirst();
  
  if (!town) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      'Town not found',
      404
    );
  }

  await prisma.town.delete({
    where: { id: town.id },
  });

  return successResponse({ success: true });
});

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
