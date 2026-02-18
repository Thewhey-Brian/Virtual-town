import { useTown, TownProvider } from './town-context';
import type { TimeOfDay, WeatherType } from './town-context';

export const useSimulation = useTown;
export const SimulationProvider = TownProvider;
export { TimeOfDay, WeatherType };

export const getAgentState = (agentId: string) => undefined;
export const getCurrentTimeString = () => '';
export const getTimeOfDayLabel = () => '';

export type { TimeOfDay as TimeOfDayType, WeatherType as WeatherTypeType } from './town-context';

export type Agent = {
  id: string;
  name: string;
  avatar: string;
  age?: number;
  occupation?: string;
  bio?: string;
  currentLocation?: string;
  homeLocation?: string;
  workLocation?: string;
  currentStatus?: string;
  currentMood?: string;
  personality?: string;
  routine?: {
    wakeUp?: string;
    sleep?: string;
    workStart?: string;
    workEnd?: string;
    workHours?: string;
    preferences?: string[];
  };
  stats?: {
    clothing?: number;
    food?: number;
    housing?: number;
    transport?: number;
  };
  lat?: number;
  lng?: number;
};

export interface AgentState {
  agent: any;
  currentAction: any;
  currentLocation: any;
  isTraveling: boolean;
  journeyProgress: number;
  journeyFrom: any;
  journeyTo: any;
}

export type ScheduleAction = {
  id: string;
  type: string;
  description: string;
  fromLocation?: string;
  toLocation?: string;
  time?: string;
  involvedAgents?: string[];
};

export type ActivityLogEntry = {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  action: ScheduleAction;
  activity?: string;
  timestamp: Date;
  locationName: string;
  type: 'start' | 'ongoing' | 'end';
};

export type Journey = {
  id: string;
  agentId?: string;
  characterId?: string;
  fromLocation: any;
  toLocation: any;
  startTime: Date;
  endTime: Date;
  progress: number;
};
