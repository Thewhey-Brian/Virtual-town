import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/characters/positions - Get current positions of all characters
export async function GET(req: NextRequest) {
  try {
    // Get town info for the map center
    const town = await prisma.town.findFirst();
    
    if (!town) {
      return NextResponse.json([]);
    }

    // Get all characters with their current locations
    const characters = await prisma.character.findMany({
      where: {
        isActive: true,
      },
      include: {
        homeLocation: true,
      },
    });

    // Get current routines to determine positions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentRoutines = await prisma.characterRoutine.findMany({
      where: {
        date: today,
      },
      include: {
        fromLocation: true,
        toLocation: true,
      },
    });

    // Map characters to their current positions
    const positions = characters.map((character) => {
      // Find current routine for this character
      const currentRoutine = currentRoutines.find(r => r.characterId === character.id);
      
      // Get current time
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      let lat = character.homeLocation?.lat || town.currentLat || 34.1469;
      let lng = character.homeLocation?.lng || town.currentLng || -118.2551;
      
      // If there's an active routine, interpolate position
      if (currentRoutine) {
        const startTime = currentRoutine.startTime;
        const endTime = currentRoutine.endTime;
        
        if (currentTime >= startTime && currentTime <= endTime) {
          // Character is traveling or at destination
          if (currentRoutine.actionType === 'TRAVEL') {
            // Interpolate position between from and to
            const progress = calculateProgress(currentTime, startTime, endTime);
            lat = interpolate(currentRoutine.fromLocation.lat, currentRoutine.toLocation.lat, progress);
            lng = interpolate(currentRoutine.fromLocation.lng, currentRoutine.toLocation.lng, progress);
          } else {
            // Character is at the destination
            lat = currentRoutine.toLocation.lat;
            lng = currentRoutine.toLocation.lng;
          }
        }
      }
      
      return {
        id: character.id,
        name: character.name,
        avatar: character.avatar,
        lat,
        lng,
        currentStatus: character.currentStatus,
        currentMood: character.currentMood,
      };
    });

    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error fetching character positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character positions' },
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
