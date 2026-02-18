import OpenAI from 'openai';

// AI Model Configuration
const AI_MODEL = process.env.AI_MODEL || 'kimi';

// Configure API based on selected model
function getAIConfig() {
  switch (AI_MODEL) {
    case 'kimi':
      return {
        apiKey: process.env.OPENAI_API_KEY || '',
        baseURL: 'https://api.moonshot.cn/v1',
        model: 'kimi-k2.5',
      };
    case 'deepseek':
      return {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseURL: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat',
      };
    case 'openai':
    default:
      return {
        apiKey: process.env.OPENAI_API_KEY || '',
        baseURL: undefined,
        model: 'gpt-4o-mini',
      };
  }
}

const config = getAIConfig();
const openai = new OpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseURL,
});

export interface CommandParseInput {
  promptText: string;
  availableCharacters: Array<{
    id: string;
    name: string;
    currentLocation: string;
    currentStatus: string;
  }>;
  availablePlaces: Array<{
    id: string;
    name: string;
    placeType: string;
  }>;
}

export interface ParsedCommand {
  intent: string;
  confidence: number;
  entities: {
    characterId?: string;
    characterName?: string;
    targetLocationId?: string;
    targetLocationName?: string;
    action?: string;
    time?: string;
    reason?: string;
  };
  executionPlan: Array<{
    action: string;
    params: Record<string, any>;
    description: string;
  }>;
  affectedRoutines: string[];
  requiresConfirmation: boolean;
  explanation: string;
}

export async function parseNaturalLanguageCommand(
  input: CommandParseInput
): Promise<ParsedCommand> {
  const charactersList = input.availableCharacters
    .map(c => `- ${c.name} (id: ${c.id}, currently at: ${c.currentLocation}, status: ${c.currentStatus})`)
    .join('\n');

  const placesList = input.availablePlaces
    .map(p => `- ${p.name} (id: ${p.id}, type: ${p.placeType})`)
    .join('\n');

  const prompt = `Parse a natural language command for a virtual town simulation.

Available Characters:
${charactersList}

Available Places:
${placesList}

User Command: "${input.promptText}"

Parse this command and respond in JSON format:
{
  "intent": "The main intent (move_character|change_schedule|change_mood|social_action|unknown)",
  "confidence": 0.0-1.0,
  "entities": {
    "characterId": "ID of affected character (if found)",
    "characterName": "Name of affected character (if found)",
    "targetLocationId": "ID of target location (if applicable)",
    "targetLocationName": "Name of target location (if applicable)",
    "action": "Specific action type",
    "time": "Time mentioned (if any)",
    "reason": "Reason for action (if mentioned)"
  },
  "executionPlan": [
    {
      "action": "Action to take",
      "params": { "key": "value" },
      "description": "Human-readable description"
    }
  ],
  "affectedRoutines": ["routine_ids_that_will_be_modified"],
  "requiresConfirmation": true/false,
  "explanation": "Explanation of what will happen"
}

Common intents:
- "Move [character] to [place]" → move_character
- "Make [character] go to [place]" → move_character  
- "Have [character] meet [character]" → social_action
- "Change [character]'s schedule" → change_schedule
- "Make [character] happy/sad" → change_mood

Be smart about partial matches - if user says "John" and there's "John Smith", use that character.`;

  try {
    const response = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a command parser for a virtual town simulation. Parse natural language into structured commands.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content');
    }

    return JSON.parse(content) as ParsedCommand;
  } catch (error) {
    console.error('Error parsing command:', error);
    
    // Fallback: simple keyword matching
    return fallbackParseCommand(input);
  }
}

function fallbackParseCommand(input: CommandParseInput): ParsedCommand {
  const text = input.promptText.toLowerCase();
  
  // Try to find character
  let character = input.availableCharacters.find(c => 
    text.includes(c.name.toLowerCase())
  );
  
  // Try to find location
  let location = input.availablePlaces.find(p => 
    text.includes(p.name.toLowerCase())
  );
  
  // Determine intent
  let intent = 'unknown';
  if ((text.includes('move') || text.includes('go') || text.includes('to')) && location) {
    intent = 'move_character';
  } else if (text.includes('meet') || text.includes('talk')) {
    intent = 'social_action';
  } else if (text.includes('schedule')) {
    intent = 'change_schedule';
  } else if (text.includes('happy') || text.includes('sad') || text.includes('mood')) {
    intent = 'change_mood';
  }
  
  return {
    intent,
    confidence: character && location ? 0.7 : 0.3,
    entities: {
      characterId: character?.id,
      characterName: character?.name,
      targetLocationId: location?.id,
      targetLocationName: location?.name,
      action: intent,
    },
    executionPlan: character && location ? [
      {
        action: 'move_character',
        params: { characterId: character.id, locationId: location.id },
        description: `Move ${character.name} to ${location.name}`,
      },
    ] : [],
    affectedRoutines: [],
    requiresConfirmation: true,
    explanation: character && location 
      ? `Will move ${character.name} to ${location.name}`
      : 'Could not understand command clearly',
  };
}

// Generate explanation for command execution
export async function generateCommandExplanation(
  command: ParsedCommand,
  characterName: string
): Promise<string> {
  const prompt = `Explain this command in a friendly, conversational way:

Intent: ${command.intent}
Character: ${characterName}
Target: ${command.entities.targetLocationName || 'N/A'}
Action: ${command.entities.action || 'N/A'}

Respond with a brief, friendly explanation (1-2 sentences) of what will happen.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || command.explanation;
  } catch (error) {
    return command.explanation;
  }
}
