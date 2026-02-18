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

export interface ConversationInput {
  characterA: {
    id: string;
    name: string;
    personality: any;
    currentMood: string;
  };
  characterB: {
    id: string;
    name: string;
    personality: any;
    currentMood: string;
  };
  location: string;
  context?: string;
  previousInteractions?: number;
  relationshipType?: string;
}

export interface GeneratedConversation {
  messages: Array<{
    senderId: string;
    content: string;
    emotion: string;
    timestamp: string;
  }>;
  topic: string;
  sentiment: number; // -1 to 1
  relationshipChange: number; // -10 to 10
  summary: string;
}

export async function generateConversation(
  input: ConversationInput
): Promise<GeneratedConversation> {
  const prompt = `Generate a realistic conversation between two characters in a virtual town simulation.

Character A: ${input.characterA.name}
- Personality: ${JSON.stringify(input.characterA.personality?.traits || [])}
- Current Mood: ${input.characterA.currentMood}
- MBTI: ${input.characterA.personality?.mbti || 'Unknown'}

Character B: ${input.characterB.name}
- Personality: ${JSON.stringify(input.characterB.personality?.traits || [])}
- Current Mood: ${input.characterB.currentMood}
- MBTI: ${input.characterB.personality?.mbti || 'Unknown'}

Location: ${input.location}
Context: ${input.context || 'Casual encounter'}
Previous Interactions: ${input.previousInteractions || 0}
Relationship: ${input.relationshipType || 'Strangers'}

Generate a conversation in JSON format:
{
  "messages": [
    { "senderId": "${input.characterA.id}", "content": "...", "emotion": "happy|excited|neutral|concerned|amused", "timestamp": "HH:MM" },
    { "senderId": "${input.characterB.id}", "content": "...", "emotion": "...", "timestamp": "HH:MM" }
  ],
  "topic": "Brief topic of conversation",
  "sentiment": 0.0, // Overall sentiment from -1.0 (negative) to 1.0 (positive)
  "relationshipChange": 0, // Impact on relationship from -10 to +10
  "summary": "2-3 sentence summary of the conversation"
}

Guidelines:
- Create 4-8 messages back and forth
- Make dialogue natural and context-appropriate
- Reflect each character's personality and current mood
- Include some personality-typical expressions
- End with a natural conclusion
- Keep messages conversational length (1-2 sentences each)`;

  try {
    const response = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a dialogue writer for a life simulation game. Create realistic, engaging conversations between characters.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    return JSON.parse(content) as GeneratedConversation;
  } catch (error) {
    console.error('Error generating conversation:', error);
    
    // Return a fallback conversation
    return generateFallbackConversation(input);
  }
}

function generateFallbackConversation(input: ConversationInput): GeneratedConversation {
  return {
    messages: [
      {
        senderId: input.characterA.id,
        content: `Hey ${input.characterB.name}! How's it going?`,
        emotion: 'friendly',
        timestamp: '14:30',
      },
      {
        senderId: input.characterB.id,
        content: `Hi ${input.characterA.name}! I'm doing well, thanks. Just ${input.context || 'hanging out'}. How about you?`,
        emotion: 'happy',
        timestamp: '14:31',
      },
      {
        senderId: input.characterA.id,
        content: "Same here! It's a nice day today.",
        emotion: 'content',
        timestamp: '14:31',
      },
      {
        senderId: input.characterB.id,
        content: "Definitely! Well, I should get going. See you around!",
        emotion: 'neutral',
        timestamp: '14:32',
      },
      {
        senderId: input.characterA.id,
        content: "See you! Take care!",
        emotion: 'friendly',
        timestamp: '14:32',
      },
    ],
    topic: 'Casual greeting',
    sentiment: 0.3,
    relationshipChange: 1,
    summary: `${input.characterA.name} and ${input.characterB.name} had a brief, friendly encounter at ${input.location}. They exchanged pleasantries and went their separate ways.`,
  };
}

// Generate group conversation for 3+ characters
export interface GroupConversationInput {
  characters: Array<{
    id: string;
    name: string;
    personality: any;
    currentMood: string;
  }>;
  location: string;
  context?: string;
}

export async function generateGroupConversation(
  input: GroupConversationInput
): Promise<GeneratedConversation> {
  const characterDescriptions = input.characters.map(c => 
    `- ${c.name} (${c.personality?.mbti || 'Unknown'}): ${c.currentMood} mood, traits: ${JSON.stringify(c.personality?.traits || [])}`
  ).join('\n');

  const prompt = `Generate a group conversation between ${input.characters.length} characters in a virtual town simulation.

Characters:
${characterDescriptions}

Location: ${input.location}
Context: ${input.context || 'Group gathering'}

Generate a conversation in JSON format:
{
  "messages": [
    { "senderId": "character_id", "content": "...", "emotion": "...", "timestamp": "HH:MM" }
  ],
  "topic": "Topic of group discussion",
  "sentiment": 0.0,
  "relationshipChange": 0,
  "summary": "Summary of the group interaction"
}

Guidelines:
- Create 6-10 messages with natural turn-taking
- Include group dynamics and reactions
- Make it feel like a real social gathering
- End with the group dispersing or continuing their activities`;

  try {
    const response = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a dialogue writer for group scenes in a life simulation game.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating group conversation:', error);
    return generateFallbackConversation({
      characterA: input.characters[0],
      characterB: input.characters[1] || input.characters[0],
      location: input.location,
      context: input.context,
    });
  }
}
