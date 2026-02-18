import { NextRequest, NextResponse } from 'next/server';
import { generateAllRoutines, generateDailyRoutine } from '@/lib/services/routine-generator';
import { prisma } from '@/lib/prisma';

// POST /api/routines/generate - Generate routines for all characters or specific character
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { characterId, date } = body;
    
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    if (characterId) {
      // Generate routine for specific character
      const places = await prisma.place.findMany();
      const routines = await generateDailyRoutine(characterId, targetDate, places);
      
      // Delete existing routines for this date
      await prisma.characterRoutine.deleteMany({
        where: {
          characterId,
          date: targetDate,
        },
      });
      
      // Save new routines
      await prisma.characterRoutine.createMany({
        data: routines.map(routine => ({
          characterId,
          date: targetDate,
          startTime: routine.startTime,
          endTime: routine.endTime,
          fromLocationId: routine.fromLocationId,
          toLocationId: routine.toLocationId,
          actionType: routine.actionType as any,
          description: routine.description,
          purpose: routine.purpose,
          mood: routine.mood,
          isAiGenerated: true,
        })),
      });

      return NextResponse.json({ 
        success: true, 
        count: routines.length,
        characterId,
        date: targetDate,
      });
    } else {
      // Generate routines for all characters
      await generateAllRoutines(targetDate);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Routines generated for all characters',
        date: targetDate,
      });
    }
  } catch (error) {
    console.error('Error generating routines:', error);
    return NextResponse.json(
      { error: 'Failed to generate routines' },
      { status: 500 }
    );
  }
}
