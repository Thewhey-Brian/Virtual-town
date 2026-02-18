import { prisma } from '@/lib/prisma';
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

export interface EventGenerationInput {
  townId: string;
  date: Date;
  weather: string;
  season: string;
  isHoliday: boolean;
  holidayName?: string;
}

export interface GeneratedEvent {
  name: string;
  description: string;
  eventType: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  affectedAreas: string[];
  crowdLevel: number;
  specialActivities: string[];
  weatherEffect?: string;
  storyline?: string;
  involvedCharacters?: string[];
}

// Generate special events for a date
export async function generateSpecialEvents(input: EventGenerationInput): Promise<GeneratedEvent[]> {
  const events: GeneratedEvent[] = [];
  const date = new Date(input.date);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Check for known holidays
  const holidayEvent = await checkHoliday(date, input);
  if (holidayEvent) {
    events.push(holidayEvent);
  }
  
  // Generate weather-based events
  const weatherEvent = generateWeatherEvent(input);
  if (weatherEvent) {
    events.push(weatherEvent);
  }
  
  // Generate random community events (20% chance)
  if (Math.random() < 0.2) {
    const communityEvent = await generateCommunityEvent(input);
    if (communityEvent) {
      events.push(communityEvent);
    }
  }
  
  // Generate random character life events (10% chance per character)
  const characterEvents = await generateCharacterLifeEvents(input);
  events.push(...characterEvents);
  
  return events;
}

// Check for known holidays
async function checkHoliday(date: Date, input: EventGenerationInput): Promise<GeneratedEvent | null> {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = date.getDay();
  
  // Fixed holidays
  const fixedHolidays: Record<string, { name: string; type: string }> = {
    '1-1': { name: 'New Year\'s Day', type: 'HOLIDAY' },
    '7-4': { name: 'Independence Day', type: 'HOLIDAY' },
    '12-25': { name: 'Christmas Day', type: 'HOLIDAY' },
    '12-31': { name: 'New Year\'s Eve', type: 'FESTIVAL' },
    '2-14': { name: 'Valentine\'s Day', type: 'SOCIAL' },
    '10-31': { name: 'Halloween', type: 'FESTIVAL' },
  };
  
  const key = `${month}-${day}`;
  const holiday = fixedHolidays[key];
  
  if (holiday) {
    return {
      name: holiday.name,
      description: `${holiday.name} celebration in Glendale`,
      eventType: holiday.type,
      startDate: date,
      endDate: date,
      isAllDay: true,
      affectedAreas: ['all'],
      crowdLevel: holiday.type === 'FESTIVAL' ? 8 : 6,
      specialActivities: getHolidayActivities(holiday.name),
    };
  }
  
  // Thanksgiving (4th Thursday of November)
  if (month === 11 && dayOfWeek === 4 && day >= 22 && day <= 28) {
    return {
      name: 'Thanksgiving',
      description: 'Thanksgiving celebration with family gatherings',
      eventType: 'HOLIDAY',
      startDate: date,
      endDate: date,
      isAllDay: true,
      affectedAreas: ['all'],
      crowdLevel: 9,
      specialActivities: ['family_dinner', 'parade', 'gratitude'],
    };
  }
  
  return null;
}

function getHolidayActivities(holidayName: string): string[] {
  const activities: Record<string, string[]> = {
    'New Year\'s Day': ['fireworks', 'brunch', 'resolutions'],
    'Independence Day': ['fireworks', 'bbq', 'parade', 'picnic'],
    'Christmas Day': ['gift_exchange', 'family_dinner', 'caroling'],
    'New Year\'s Eve': ['countdown', 'party', 'fireworks'],
    'Valentine\'s Day': ['date_night', 'flowers', 'romantic_dinner'],
    'Halloween': ['trick_or_treat', 'costume_party', 'haunted_house'],
    'Thanksgiving': ['family_dinner', 'parade', 'gratitude', 'football'],
  };
  
  return activities[holidayName] || ['celebration'];
}

// Generate weather-based events
function generateWeatherEvent(input: EventGenerationInput): GeneratedEvent | null {
  const weather = input.weather;
  
  if (weather === 'RAINY' && Math.random() < 0.3) {
    return {
      name: 'Rainy Day',
      description: 'Heavy rain affecting outdoor activities',
      eventType: 'WEATHER',
      startDate: input.date,
      endDate: input.date,
      isAllDay: false,
      startTime: '08:00',
      endTime: '20:00',
      affectedAreas: ['outdoor'],
      crowdLevel: 3,
      specialActivities: ['indoor_activities', 'coffee_shops', 'museums'],
      weatherEffect: 'RAINY',
    };
  }
  
  if (weather === 'SUNNY' && input.season === 'SUMMER' && Math.random() < 0.2) {
    return {
      name: 'Heat Wave',
      description: 'Unusually hot weather, residents seeking cool places',
      eventType: 'WEATHER',
      startDate: input.date,
      endDate: input.date,
      isAllDay: true,
      affectedAreas: ['all'],
      crowdLevel: 7,
      specialActivities: ['beach', 'ice_cream', 'pools', 'ac_spaces'],
      weatherEffect: 'SUNNY',
    };
  }
  
  if (weather === 'SNOWY') {
    return {
      name: 'Snow Day',
      description: 'Snow affecting travel and activities',
      eventType: 'WEATHER',
      startDate: input.date,
      endDate: input.date,
      isAllDay: true,
      affectedAreas: ['all'],
      crowdLevel: 4,
      specialActivities: ['snowball_fights', 'hot_chocolate', 'staying_in'],
      weatherEffect: 'SNOWY',
    };
  }
  
  return null;
}

// Generate community events
async function generateCommunityEvent(input: EventGenerationInput): Promise<GeneratedEvent | null> {
  const eventTypes = [
    { type: 'MARKET', name: 'Farmers Market', crowdLevel: 6 },
    { type: 'CONCERT', name: 'Live Music Night', crowdLevel: 7 },
    { type: 'SPORTS', name: 'Community Game', crowdLevel: 5 },
    { type: 'COMMUNITY', name: 'Neighborhood Gathering', crowdLevel: 4 },
  ];
  
  const selected = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  
  try {
    // Use AI to generate event details
    const prompt = `Generate a community event for a virtual town on ${input.date.toDateString()}.
Event Type: ${selected.name}
Season: ${input.season}
Weather: ${input.weather}

Respond in JSON format:
{
  "name": "Event name",
  "description": "Brief description",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "specialActivities": ["activity1", "activity2"],
  "storyline": "Brief narrative context"
}`;

    const response = await openai.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const details = JSON.parse(content);
    
    return {
      name: details.name || selected.name,
      description: details.description,
      eventType: selected.type,
      startDate: input.date,
      endDate: input.date,
      startTime: details.startTime || '10:00',
      endTime: details.endTime || '16:00',
      isAllDay: false,
      affectedAreas: ['downtown', 'community_center'],
      crowdLevel: selected.crowdLevel,
      specialActivities: details.specialActivities || ['gathering'],
      storyline: details.storyline,
    };
  } catch (error) {
    // Fallback
    return {
      name: selected.name,
      description: `Community ${selected.name.toLowerCase()} in Glendale`,
      eventType: selected.type,
      startDate: input.date,
      endDate: input.date,
      startTime: '10:00',
      endTime: '16:00',
      isAllDay: false,
      affectedAreas: ['downtown'],
      crowdLevel: selected.crowdLevel,
      specialActivities: ['gathering', 'socializing'],
    };
  }
}

// Generate character life events
async function generateCharacterLifeEvents(input: EventGenerationInput): Promise<GeneratedEvent[]> {
  const events: GeneratedEvent[] = [];
  
  // Get active characters
  const characters = await prisma.character.findMany({
    where: { isActive: true },
  });
  
  // 10% chance per character for a life event
  for (const character of characters) {
    if (Math.random() >= 0.1) continue;
    
    const eventTypes = [
      { type: 'new_job', weight: 0.3, name: 'New Job' },
      { type: 'promotion', weight: 0.2, name: 'Promotion' },
      { type: 'moving', weight: 0.15, name: 'Moving' },
      { type: 'breakup', weight: 0.1, name: 'Relationship Ended' },
      { type: 'new_hobby', weight: 0.15, name: 'New Hobby' },
      { type: 'achievement', weight: 0.1, name: 'Personal Achievement' },
    ];
    
    // Weighted random selection
    const totalWeight = eventTypes.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    let selected = eventTypes[0];
    
    for (const event of eventTypes) {
      random -= event.weight;
      if (random <= 0) {
        selected = event;
        break;
      }
    }
    
    events.push({
      name: `${character.name}: ${selected.name}`,
      description: `${selected.name} for ${character.name}`,
      eventType: 'STORY',
      startDate: input.date,
      endDate: input.date,
      isAllDay: true,
      affectedAreas: ['personal'],
      crowdLevel: 2,
      specialActivities: [selected.type],
      storyline: `${character.name} experienced ${selected.name.toLowerCase()}`,
      involvedCharacters: [character.id],
    });
    
    // Create memory for the character
    await prisma.characterMemory.create({
      data: {
        characterId: character.id,
        category: 'MILESTONE',
        content: `Experienced ${selected.name.toLowerCase()} today`,
        date: input.date,
        importance: 8,
      },
    });
  }
  
  return events;
}

// Apply events to character routines
export async function applyEventsToRoutines(date: Date, townId: string): Promise<void> {
  const town = await prisma.town.findUnique({
    where: { id: townId },
  });
  
  if (!town) return;
  
  const events = await prisma.townEvent.findMany({
    where: {
      townId,
      startDate: {
        lte: date,
      },
      endDate: {
        gte: date,
      },
    },
  });
  
  for (const event of events) {
    // Modify routines based on event type
    switch (event.eventType) {
      case 'HOLIDAY':
        await modifyRoutinesForHoliday(date, event as any);
        break;
      case 'WEATHER':
        await modifyRoutinesForWeather(date, event as any);
        break;
      case 'FESTIVAL':
        await modifyRoutinesForFestival(date, event as any);
        break;
    }
  }
}

async function modifyRoutinesForHoliday(date: Date, event: any): Promise<void> {
  // Characters might visit family or attend celebrations
  // This would modify their routines to include holiday activities
}

async function modifyRoutinesForWeather(date: Date, event: any): Promise<void> {
  // Characters might stay indoors or visit weather-appropriate venues
  // This would modify their routines based on weather conditions
}

async function modifyRoutinesForFestival(date: Date, event: any): Promise<void> {
  // Characters might attend the festival during event hours
  // This would add festival visits to their routines
}
