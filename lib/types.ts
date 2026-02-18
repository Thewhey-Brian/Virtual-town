export interface Agent {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  personality: string;
  occupation: string;
  homeLocation: string;
  stats: {
    clothing: number; // 衣
    food: number;     // 食
    housing: number;  // 住
    transport: number; // 行
  };
  currentLocation: string;
  status: 'active' | 'idle' | 'sleeping';
  routine: DailyRoutine;
}

export interface DailyRoutine {
  wakeUp: string;
  sleep: string;
  workHours: string;
  preferences: string[];
}

export interface Location {
  id: string;
  name: string;
  type: 'home' | 'cafe' | 'restaurant' | 'shop' | 'park' | 'library' | 'work' | 'transport';
  x: number;
  y: number;
  icon: string;
  description: string;
  realPlaceId?: string;
  hours?: string;
  rating?: number;
}

export interface Activity {
  id: string;
  agentId: string;
  type: 'move' | 'talk' | 'eat' | 'shop' | 'work' | 'sleep' | 'leisure';
  location: string;
  timestamp: Date;
  description: string;
  relatedAgents?: string[];
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
  location: string;
  startedAt: Date;
  endedAt?: Date;
  topic?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface Memory {
  id: string;
  agentId: string;
  category: 'people' | 'places' | 'events' | 'preferences' | 'daily';
  content: string;
  date: Date;
  importance: number;
}

export interface JournalEntry {
  id: string;
  agentId: string;
  date: Date;
  content: string;
  mood: string;
  highlights: string[];
}

// New detailed schedule types
export interface ScheduleAction {
  id: string;
  time: string; // HH:MM format
  type: 'wake' | 'sleep' | 'home' | 'travel' | 'work' | 'meal' | 'shopping' | 'social' | 'exercise' | 'leisure';
  fromLocation: string;
  toLocation: string;
  description: string;
  involvedAgents: string[];
  details: {
    activity?: string;
    food?: string;
    drink?: string;
    transport?: string;
    duration?: string;
    cost?: string;
    workType?: string;
    topic?: string;
    [key: string]: any;
  };
}

export interface DailySchedule {
  agentId: string;
  date: string;
  actions: ScheduleAction[];
}
