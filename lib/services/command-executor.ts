import { prisma } from '@/lib/prisma';
import { parseNaturalLanguageCommand, generateCommandExplanation } from './command-parser';
import { calculateTravelTime } from './routine-generator';

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  affectedRoutines: string[];
  undoAvailable: boolean;
  changes: Array<{
    type: string;
    description: string;
  }>;
}

// Execute a parsed command
export async function executeCommand(
  command: any,
  userId?: string
): Promise<CommandExecutionResult> {
  const changes: Array<{ type: string; description: string }> = [];
  const affectedRoutines: string[] = [];

  try {
    switch (command.intent) {
      case 'move_character':
        return await executeMoveCharacter(command, changes, affectedRoutines);
      
      case 'change_schedule':
        return await executeChangeSchedule(command, changes, affectedRoutines);
      
      case 'change_mood':
        return await executeChangeMood(command, changes);
      
      case 'social_action':
        return await executeSocialAction(command, changes);
      
      default:
        return {
          success: false,
          message: 'Unknown command intent',
          affectedRoutines,
          undoAvailable: false,
          changes,
        };
    }
  } catch (error) {
    console.error('Error executing command:', error);
    return {
      success: false,
      message: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      affectedRoutines,
      undoAvailable: false,
      changes,
    };
  }
}

// Execute move character command
async function executeMoveCharacter(
  command: any,
  changes: Array<{ type: string; description: string }>,
  affectedRoutines: string[]
): Promise<CommandExecutionResult> {
  const { characterId, targetLocationId } = command.entities;

  if (!characterId || !targetLocationId) {
    return {
      success: false,
      message: 'Missing character or location information',
      affectedRoutines,
      undoAvailable: false,
      changes,
    };
  }

  // Get character and location details
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: { homeLocation: true },
  });

  const targetLocation = await prisma.place.findUnique({
    where: { id: targetLocationId },
  });

  if (!character || !targetLocation) {
    return {
      success: false,
      message: 'Character or location not found',
      affectedRoutines,
      undoAvailable: false,
      changes,
    };
  }

  // Get current time
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Find or create today's routines
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Get current routine
  const currentRoutine = await prisma.characterRoutine.findFirst({
    where: {
      characterId,
      date: today,
      startTime: { lte: currentTime },
      endTime: { gt: currentTime },
    },
    include: {
      toLocation: true,
    },
  });

  // Calculate travel time
  let fromLocation = currentRoutine?.toLocation || character.homeLocation;
  const travelMinutes = calculateTravelTime(
    { id: fromLocation.id, name: fromLocation.name, lat: fromLocation.lat, lng: fromLocation.lng, placeType: fromLocation.placeType },
    { id: targetLocation.id, name: targetLocation.name, lat: targetLocation.lat, lng: targetLocation.lng, placeType: targetLocation.placeType }
  );

  // Create travel routine
  const travelEndTime = addMinutes(currentTime, travelMinutes);
  const travelRoutine = await prisma.characterRoutine.create({
    data: {
      characterId,
      date: today,
      startTime: currentTime,
      endTime: travelEndTime,
      fromLocationId: fromLocation.id,
      toLocationId: targetLocationId,
      actionType: 'TRAVEL',
      description: `Travel to ${targetLocation.name} (user command)`,
      purpose: 'User-directed movement',
      mood: 'neutral',
      isAiGenerated: false,
    },
  });
  affectedRoutines.push(travelRoutine.id);

  // Create destination routine (stay for 1 hour)
  const stayEndTime = addMinutes(travelEndTime, 60);
  const stayRoutine = await prisma.characterRoutine.create({
    data: {
      characterId,
      date: today,
      startTime: travelEndTime,
      endTime: stayEndTime,
      fromLocationId: targetLocationId,
      toLocationId: targetLocationId,
      actionType: 'LEISURE',
      description: `At ${targetLocation.name} (user command)`,
      purpose: 'User-directed activity',
      mood: 'neutral',
      isAiGenerated: false,
    },
  });
  affectedRoutines.push(stayRoutine.id);

  // Update character's current location
  await prisma.character.update({
    where: { id: characterId },
    data: {
      currentLocationId: targetLocationId,
      currentStatus: 'TRAVELING',
    },
  });

  changes.push({
    type: 'routine_created',
    description: `Created travel routine: ${fromLocation.name} → ${targetLocation.name}`,
  });
  changes.push({
    type: 'character_updated',
    description: `Updated ${character.name}'s location to ${targetLocation.name}`,
  });

  // Create memory
  await prisma.characterMemory.create({
    data: {
      characterId,
      category: 'DAILY',
      content: `Went to ${targetLocation.name} (user intervention)`,
      date: now,
      locationId: targetLocationId,
      importance: 6,
    },
  });

  return {
    success: true,
    message: `${character.name} is now traveling to ${targetLocation.name}. Arrival: ${travelEndTime}`,
    affectedRoutines,
    undoAvailable: true,
    changes,
  };
}

// Execute change schedule command
async function executeChangeSchedule(
  command: any,
  changes: Array<{ type: string; description: string }>,
  affectedRoutines: string[]
): Promise<CommandExecutionResult> {
  // Implementation for schedule changes
  return {
    success: false,
    message: 'Schedule changes not yet implemented',
    affectedRoutines,
    undoAvailable: false,
    changes,
  };
}

// Execute change mood command
async function executeChangeMood(
  command: any,
  changes: Array<{ type: string; description: string }>
): Promise<CommandExecutionResult> {
  const { characterId } = command.entities;
  const mood = command.entities.action || 'neutral';

  if (!characterId) {
    return {
      success: false,
      message: 'Missing character information',
      affectedRoutines: [],
      undoAvailable: false,
      changes,
    };
  }

  const character = await prisma.character.update({
    where: { id: characterId },
    data: { currentMood: mood },
  });

  changes.push({
    type: 'character_updated',
    description: `Changed ${character.name}'s mood to ${mood}`,
  });

  return {
    success: true,
    message: `${character.name} is now feeling ${mood}`,
    affectedRoutines: [],
    undoAvailable: true,
    changes,
  };
}

// Execute social action command
async function executeSocialAction(
  command: any,
  changes: Array<{ type: string; description: string }>
): Promise<CommandExecutionResult> {
  // Implementation for social actions
  return {
    success: false,
    message: 'Social actions not yet implemented',
    affectedRoutines: [],
    undoAvailable: false,
    changes,
  };
}

// Helper function
function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}
