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

export interface CharacterGenerationInput {
  name: string;
  age: number;
  gender?: string;
  occupation?: string;
  personalityHint?: string;
}

export interface GeneratedCharacter {
  bio: string;
  personality: {
    traits: string[];
    mbti: string;
    bigFive: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
  };
  lifestyle: {
    sleepSchedule: {
      weekday: { wake: string; sleep: string };
      weekend: { wake: string; sleep: string };
    };
    dietary: string[];
    hobbies: string[];
  };
  habits: {
    morning: string[];
    evening: string[];
    weekend: string[];
  };
  preferences: {
    food: string[];
    activities: string[];
    music: string[];
    social: string;
  };
  goals: string[];
}

export async function generateCharacterProfile(
  input: CharacterGenerationInput
): Promise<GeneratedCharacter> {
  const prompt = `Create a detailed character profile for a virtual town simulation.

Character Info:
- Name: ${input.name}
- Age: ${input.age}
- Gender: ${input.gender || 'Not specified'}
- Occupation: ${input.occupation || 'Not specified'}
- Personality Hint: ${input.personalityHint || 'None provided'}

Generate a complete personality profile in JSON format with the following structure:
{
  "bio": "A 2-3 sentence character description",
  "personality": {
    "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
    "mbti": "One of: INTJ, INTP, ENTJ, ENTP, INFJ, INFP, ENFJ, ENFP, ISTJ, ISFJ, ESTJ, ESFJ, ISTP, ISFP, ESTP, ESFP",
    "bigFive": {
      "openness": 0-100,
      "conscientiousness": 0-100,
      "extraversion": 0-100,
      "agreeableness": 0-100,
      "neuroticism": 0-100
    }
  },
  "lifestyle": {
    "sleepSchedule": {
      "weekday": { "wake": "HH:MM", "sleep": "HH:MM" },
      "weekend": { "wake": "HH:MM", "sleep": "HH:MM" }
    },
    "dietary": ["preference1", "preference2"],
    "hobbies": ["hobby1", "hobby2", "hobby3"]
  },
  "habits": {
    "morning": ["habit1", "habit2"],
    "evening": ["habit1", "habit2"],
    "weekend": ["activity1", "activity2"]
  },
  "preferences": {
    "food": ["cuisine1", "cuisine2", "cuisine3"],
    "activities": ["activity1", "activity2", "activity3"],
    "music": ["genre1", "genre2"],
    "social": "introvert|extrovert|ambivert"
  },
  "goals": ["short-term goal", "medium-term goal", "long-term goal"]
}

Make the character feel realistic and consistent. Consider their age and occupation when determining habits and goals. Be creative but grounded in reality.`;

  try {
    const response = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a character generation expert for life simulation games. Generate detailed, consistent, and realistic character profiles.',
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

    return JSON.parse(content) as GeneratedCharacter;
  } catch (error) {
    console.error('Error generating character profile:', error);
    
    // Return a fallback profile
    return generateFallbackProfile(input);
  }
}

function generateFallbackProfile(input: CharacterGenerationInput): GeneratedCharacter {
  return {
    bio: `${input.name} is a ${input.age}-year-old ${input.occupation || 'professional'} living in Glendale. They're known for their ${input.personalityHint || 'friendly'} personality and active lifestyle.`,
    personality: {
      traits: ['Friendly', 'Organized', 'Creative', 'Reliable', 'Curious'],
      mbti: 'ENFJ',
      bigFive: {
        openness: 70,
        conscientiousness: 75,
        extraversion: 65,
        agreeableness: 80,
        neuroticism: 40,
      },
    },
    lifestyle: {
      sleepSchedule: {
        weekday: { wake: '07:00', sleep: '23:00' },
        weekend: { wake: '08:30', sleep: '00:00' },
      },
      dietary: ['Balanced diet', 'Coffee lover'],
      hobbies: ['Reading', 'Walking', 'Photography'],
    },
    habits: {
      morning: ['Morning coffee', 'Light stretching'],
      evening: ['Read before bed', 'Plan next day'],
      weekend: ['Brunch with friends', 'Outdoor activities'],
    },
    preferences: {
      food: ['Italian', 'Asian cuisine', 'Coffee shops'],
      activities: ['Hiking', 'Movies', 'Museums'],
      music: ['Pop', 'Indie'],
      social: 'ambivert',
    },
    goals: ['Advance in career', 'Travel more', 'Learn a new skill'],
  };
}

export async function generateRoutineDescription(
  characterName: string,
  fromLocation: string,
  toLocation: string,
  actionType: string,
  timeOfDay: string
): Promise<{ description: string; purpose: string; mood: string }> {
  const prompt = `Generate a brief routine activity description for a character.

Character: ${characterName}
From: ${fromLocation}
To: ${toLocation}
Action: ${actionType}
Time: ${timeOfDay}

Respond in JSON format:
{
  "description": "Brief 5-10 word description of the activity",
  "purpose": "Short reason why they're doing this (10-15 words)",
  "mood": "One word mood like: happy, focused, relaxed, tired, excited"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content');
    }

    return JSON.parse(content);
  } catch (error) {
    return {
      description: `Traveling from ${fromLocation} to ${toLocation}`,
      purpose: 'Regular daily activity',
      mood: 'neutral',
    };
  }
}
