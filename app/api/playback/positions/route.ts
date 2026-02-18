import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/playback/positions - Get character positions for a specific time
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const time = searchParams.get('time') || '12:00';

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Get all active characters
    const characters = await prisma.character.findMany({
      where: { isActive: true },
      include: {
        homeLocation: true,
      },
    });

    // Get routines for the target date
    const routines = await prisma.characterRoutine.findMany({
      where: {
        date: targetDate,
        startTime: { lte: time },
        endTime: { gt: time },
      },
      include: {
        fromLocation: true,
        toLocation: true,
        character: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Calculate positions for each character
    const positions = characters.map((character) => {
      const routine = routines.find(r => r.characterId === character.id);
      
      let lat = character.homeLocation?.lat || 34.1469;
      let lng = character.homeLocation?.lng || -118.2551;
      let status: string = character.currentStatus;
      let location = character.homeLocation?.name || 'Home';

      if (routine) {
        if (routine.actionType === 'TRAVEL') {
          // Interpolate position
          const progress = calculateProgress(time, routine.startTime, routine.endTime);
          lat = interpolate(routine.fromLocation.lat, routine.toLocation.lat, progress);
          lng = interpolate(routine.fromLocation.lng, routine.toLocation.lng, progress);
          status = 'TRAVELING';
          location = `→ ${routine.toLocation.name}`;
        } else {
          // At destination - map action type to status
          lat = routine.toLocation.lat;
          lng = routine.toLocation.lng;
          status = mapActionTypeToStatus(routine.actionType);
          location = routine.toLocation.name;
        }
      }

      return {
        id: character.id,
        name: character.name,
        avatar: character.avatar,
        lat,
        lng,
        status,
        location,
      };
    });

    // Get active travel routes
    const activeRoutes = routines
      .filter(r => r.actionType === 'TRAVEL')
      .map(r => ({
        characterId: r.characterId,
        from: {
          lat: r.fromLocation.lat,
          lng: r.fromLocation.lng,
        },
        to: {
          lat: r.toLocation.lat,
          lng: r.toLocation.lng,
        },
        startTime: r.startTime,
        endTime: r.endTime,
        actionType: r.actionType,
      }));

    return NextResponse.json({
      time,
      date,
      positions,
      routes: activeRoutes,
    });
  } catch (error) {
    console.error('Error fetching playback positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

function calculateProgress(current: string, start: string, end: string): number {
  const currentMinutes = timeToMinutes(current);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  
  if (endMinutes <= startMinutes) return 0;
  
  const progress = (currentMinutes - startMinutes) / (endMinutes - startMinutes);
  return Math.max(0, Math.min(1, progress));
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

// Map RoutineActionType to CharacterStatus
function mapActionTypeToStatus(actionType: string): string {
  const mapping: Record<string, string> = {
    'WAKE': 'IDLE',
    'SLEEP': 'SLEEPING',
    'HOME': 'IDLE',
    'TRAVEL': 'TRAVELING',
    'WORK': 'WORKING',
    'MEAL': 'EATING',
    'SHOPPING': 'SHOPPING',
    'SOCIAL': 'SOCIALIZING',
    'EXERCISE': 'EXERCISING',
    'LEISURE': 'IDLE',
    'STUDY': 'WORKING',
    'ERRAND': 'TRAVELING',
  };
  return mapping[actionType] || 'IDLE';
}
