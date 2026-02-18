import { prisma } from '@/lib/prisma';
import { generateConversation, generateGroupConversation } from './conversation-generator';

interface EncounterResult {
  encounterId: string;
  characters: string[];
  locationId: string;
  conversationId: string | null;
  isGroup: boolean;
}

// Check for encounters and generate conversations
export async function detectAndProcessEncounters(date: Date = new Date()): Promise<EncounterResult[]> {
  const results: EncounterResult[] = [];
  
  // Get current routines for all characters
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  
  const currentTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  
  // Find all characters at the same location at the same time
  const activeRoutines = await prisma.characterRoutine.findMany({
    where: {
      date: today,
      startTime: {
        lte: currentTime,
      },
      endTime: {
        gt: currentTime,
      },
      actionType: {
        not: 'TRAVEL', // Only when they're actually at a location
      },
    },
    include: {
      character: {
        select: {
          id: true,
          name: true,
          avatar: true,
          personality: true,
          currentMood: true,
        },
      },
      toLocation: true,
    },
  });
  
  // Group by location
  const locationGroups = new Map<string, typeof activeRoutines>();
  
  for (const routine of activeRoutines) {
    const locationId = routine.toLocationId;
    if (!locationGroups.has(locationId)) {
      locationGroups.set(locationId, []);
    }
    locationGroups.get(locationId)!.push(routine);
  }
  
  // Process each location
  for (const [locationId, routines] of locationGroups) {
    if (routines.length < 2) continue; // No encounter with just one person
    
    const location = routines[0].toLocation;
    const characters = routines.map(r => r.character);
    
    // Check if these characters have already had an encounter recently (within last 2 hours)
    const recentEncounter = await prisma.conversation.findFirst({
      where: {
        characterIds: {
          hasEvery: characters.map(c => c.id),
        },
        startedAt: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
      },
    });
    
    if (recentEncounter) {
      console.log(`Skipping encounter - recent conversation exists at ${location.name}`);
      continue;
    }
    
    try {
      let conversation;
      const isGroup = characters.length >= 3;
      
      if (isGroup) {
        // Generate group conversation
        conversation = await generateGroupConversation({
          characters: characters.map(c => ({
            id: c.id,
            name: c.name,
            personality: c.personality as any,
            currentMood: c.currentMood,
          })),
          location: location.name,
          context: `Group gathering at ${location.name}`,
        });
      } else {
        // Generate 1-on-1 conversation
        const [charA, charB] = characters;
        
        // Get existing relationship
        const existingRelationship = await prisma.characterRelationship.findFirst({
          where: {
            OR: [
              { characterAId: charA.id, characterBId: charB.id },
              { characterAId: charB.id, characterBId: charA.id },
            ],
          },
        });
        
        conversation = await generateConversation({
          characterA: {
            id: charA.id,
            name: charA.name,
            personality: charA.personality as any,
            currentMood: charA.currentMood,
          },
          characterB: {
            id: charB.id,
            name: charB.name,
            personality: charB.personality as any,
            currentMood: charB.currentMood,
          },
          location: location.name,
          context: `Encounter at ${location.name}`,
          previousInteractions: existingRelationship?.interactionCount || 0,
          relationshipType: existingRelationship?.relationshipType || 'STRANGER',
        });
        
        // Update relationship
        await updateRelationship(charA.id, charB.id, conversation.relationshipChange, locationId);
      }
      
      // Save conversation
      const savedConversation = await prisma.conversation.create({
        data: {
          characterIds: characters.map(c => c.id),
          locationId,
          startedAt: new Date(),
          topic: conversation.topic,
          context: `Encounter at ${location.name}`,
          messages: conversation.messages as any,
          isAiGenerated: true,
          relationshipChanges: {
            sentiment: conversation.sentiment,
            change: conversation.relationshipChange,
          } as any,
        },
      });
      
      // Create memories for each character
      for (const character of characters) {
        const otherNames = characters.filter(c => c.id !== character.id).map(c => c.name).join(' and ');
        
        await prisma.characterMemory.create({
          data: {
            characterId: character.id,
            category: isGroup ? 'EVENTS' : 'RELATIONSHIP',
            content: `${isGroup ? 'Group conversation' : 'Conversation'} with ${otherNames} at ${location.name}. ${conversation.summary}`,
            date: new Date(),
            locationId,
            involvedCharacters: characters.filter(c => c.id !== character.id).map(c => c.id),
            importance: Math.abs(conversation.relationshipChange) > 5 ? 7 : 5,
            sentiment: conversation.sentiment,
            emotions: [conversation.messages.find(m => m.senderId === character.id)?.emotion || 'neutral'],
            keywords: [location.name, conversation.topic],
          },
        });
      }
      
      results.push({
        encounterId: `${locationId}-${Date.now()}`,
        characters: characters.map(c => c.id),
        locationId,
        conversationId: savedConversation.id,
        isGroup,
      });
      
      console.log(`Created ${isGroup ? 'group' : '1-on-1'} conversation at ${location.name} with ${characters.length} characters`);
    } catch (error) {
      console.error(`Error processing encounter at ${location.name}:`, error);
    }
  }
  
  return results;
}

// Update relationship between two characters
async function updateRelationship(
  charAId: string,
  charBId: string,
  change: number,
  locationId: string
): Promise<void> {
  // Find or create relationship
  let relationship = await prisma.characterRelationship.findFirst({
    where: {
      OR: [
        { characterAId: charAId, characterBId: charBId },
        { characterAId: charBId, characterBId: charAId },
      ],
    },
  });
  
  if (!relationship) {
    // Create new relationship
    relationship = await prisma.characterRelationship.create({
      data: {
        characterAId: charAId,
        characterBId: charBId,
        relationshipType: 'ACQUAINTANCE',
        intimacy: 0,
        trust: 50,
        firstMetAt: new Date(),
        firstMetLocation: locationId,
        lastInteractionAt: new Date(),
        interactionCount: 1,
      },
    });
  } else {
    // Update existing relationship
    const newIntimacy = Math.max(0, Math.min(100, relationship.intimacy + change));
    const newTrust = Math.max(0, Math.min(100, relationship.trust + change * 0.5));
    
    // Determine new status based on intimacy
    let newStatus = relationship.status;
    if (newIntimacy >= 80) newStatus = 'INTIMATE';
    else if (newIntimacy >= 60) newStatus = 'CLOSE';
    else if (newIntimacy >= 40) newStatus = 'FRIENDLY';
    else if (newIntimacy >= 20) newStatus = 'NEUTRAL';
    else if (newIntimacy >= 10) newStatus = 'COLD';
    else newStatus = 'HOSTILE';
    
    await prisma.characterRelationship.update({
      where: { id: relationship.id },
      data: {
        intimacy: newIntimacy,
        trust: newTrust,
        status: newStatus,
        lastInteractionAt: new Date(),
        interactionCount: relationship.interactionCount + 1,
      },
    });
  }
}

// Get encounters for a specific time range
export async function getEncounters(
  fromDate: Date,
  toDate: Date,
  locationId?: string
) {
  return prisma.conversation.findMany({
    where: {
      startedAt: {
        gte: fromDate,
        lte: toDate,
      },
      ...(locationId && { locationId }),
    },
    orderBy: { startedAt: 'desc' },
  });
}
