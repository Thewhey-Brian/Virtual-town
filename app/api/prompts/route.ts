import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseNaturalLanguageCommand } from '@/lib/services/command-parser';
import { executeCommand } from '@/lib/services/command-executor';

// GET /api/prompts - Get command history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get('characterId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const prompts = await prisma.userPrompt.findMany({
      where: {
        ...(characterId && { characterId }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Submit a new command
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promptText, characterId, skipConfirmation } = body;

    if (!promptText) {
      return NextResponse.json(
        { error: 'Prompt text is required' },
        { status: 400 }
      );
    }

    // Get available characters and places for context
    const characters = await prisma.character.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        currentLocationId: true,
        currentStatus: true,
      },
    });

    const places = await prisma.place.findMany({
      select: {
        id: true,
        name: true,
        placeType: true,
      },
    });

    // Get current location names for characters
    const charactersWithLocations = await Promise.all(
      characters.map(async (c) => {
        const location = c.currentLocationId 
          ? await prisma.place.findUnique({ where: { id: c.currentLocationId } })
          : null;
        return {
          id: c.id,
          name: c.name,
          currentLocation: location?.name || 'Unknown',
          currentStatus: c.currentStatus,
        };
      })
    );

    // Parse the command
    const parsedCommand = await parseNaturalLanguageCommand({
      promptText,
      availableCharacters: charactersWithLocations,
      availablePlaces: places,
    });

    // Create prompt record
    const prompt = await prisma.userPrompt.create({
      data: {
        characterId: parsedCommand.entities.characterId || characterId,
        promptText,
        promptType: mapIntentToPromptType(parsedCommand.intent) as any,
        parsedIntent: parsedCommand.intent,
        parsedEntities: parsedCommand.entities as any,
        confidence: parsedCommand.confidence,
        aiResponse: parsedCommand.explanation,
        executionPlan: parsedCommand.executionPlan as any,
        status: skipConfirmation ? 'EXECUTING' : 'PENDING',
        affectedRoutines: [],
      },
    });

    // If high confidence and auto-execute requested, execute immediately
    let executionResult = null;
    if (skipConfirmation && parsedCommand.confidence > 0.7) {
      executionResult = await executeCommand(parsedCommand);
      
      await prisma.userPrompt.update({
        where: { id: prompt.id },
        data: {
          status: executionResult.success ? 'COMPLETED' : 'FAILED',
          executedAt: new Date(),
          executionResult: executionResult as any,
          affectedRoutines: executionResult.affectedRoutines,
        },
      });
    }

    return NextResponse.json({
      prompt,
      parsedCommand,
      executionResult,
    }, { status: 201 });
  } catch (error) {
    console.error('Error processing prompt:', error);
    return NextResponse.json(
      { error: 'Failed to process prompt' },
      { status: 500 }
    );
  }
}

// PATCH /api/prompts/[id] - Confirm or cancel a pending prompt
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { promptId, action } = body;

    const prompt = await prisma.userPrompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    if (action === 'confirm') {
      // Execute the command
      const executionResult = await executeCommand({
        intent: prompt.parsedIntent,
        entities: prompt.parsedEntities as any,
        executionPlan: prompt.executionPlan as any,
      });

      const updated = await prisma.userPrompt.update({
        where: { id: promptId },
        data: {
          status: executionResult.success ? 'COMPLETED' : 'FAILED',
          executedAt: new Date(),
          executionResult: executionResult as any,
          affectedRoutines: executionResult.affectedRoutines,
        },
      });

      return NextResponse.json({
        prompt: updated,
        executionResult,
      });
    }

    if (action === 'cancel') {
      const updated = await prisma.userPrompt.update({
        where: { id: promptId },
        data: {
          status: 'REJECTED',
        },
      });

      return NextResponse.json({ prompt: updated });
    }

    if (action === 'undo') {
      // Undo logic would go here
      return NextResponse.json({
        message: 'Undo not yet implemented',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

function mapIntentToPromptType(intent: string): string {
  const mapping: Record<string, string> = {
    'move_character': 'TRAVEL',
    'change_schedule': 'SCHEDULE_CHANGE',
    'change_mood': 'EMOTIONAL',
    'social_action': 'SOCIAL',
  };
  return mapping[intent] || 'OTHER';
}
