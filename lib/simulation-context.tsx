import { useTown, TownProvider } from './town-context';
import type { TimeOfDay, WeatherType } from './town-context';

export const useSimulation = useTown;
export const SimulationProvider = TownProvider;
export { TimeOfDay, WeatherType };

export interface AgentState {
  agent: any;
  currentAction: any;
  currentLocation: any;
  isTraveling: boolean;
  journeyProgress: number;
  journeyFrom: any;
  journeyTo: any;
}

export interface ScheduleAction {
  id: string;
  type: string;
  description: string;
  fromLocation?: string;
  toLocation?: string;
  time?: string;
  involvedAgents?: string[];
}

export interface ActivityLogEntry {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  action: ScheduleAction;
  activity?: string;
  timestamp: Date;
  locationName: string;
  type: 'start' | 'ongoing' | 'end';
}

export interface Journey {
  id: string;
  agentId?: string;
  characterId?: string;
  fromLocation: any;
  toLocation: any;
  startTime: Date;
  endTime: Date;
  progress: number;
}
