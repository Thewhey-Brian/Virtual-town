'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Agent, Location, ScheduleAction } from '@/lib/types';
import { agents, locations, dailySchedules, getScheduleByAgent, getLocationById } from '@/lib/data';

// Time of day types
export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';

// Weather types
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'foggy' | 'clear';

// Simulation state
interface SimulationState {
  // Time management
  currentTime: Date;
  isPlaying: boolean;
  speed: number; // 1x, 2x, 5x
  
  // Day/night cycle
  timeOfDay: TimeOfDay;
  
  // Weather
  weather: WeatherType;
  
  // Agent states
  agentStates: Map<string, AgentState>;
  
  // Active journeys
  activeJourneys: Journey[];
  
  // Activity log
  recentActivities: ActivityLogEntry[];
}

interface AgentState {
  agent: Agent;
  currentAction: ScheduleAction | null;
  currentLocation: Location;
  isTraveling: boolean;
  journeyProgress: number; // 0-1
  journeyFrom: Location | null;
  journeyTo: Location | null;
}

export interface Journey {
  id: string;
  agentId: string;
  fromLocation: Location;
  toLocation: Location;
  startTime: Date;
  endTime: Date;
  progress: number;
}

export interface ActivityLogEntry {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  action: ScheduleAction;
  timestamp: Date;
  locationName: string;
  type: 'start' | 'ongoing' | 'end';
}

interface SimulationContextType extends SimulationState {
  // Actions
  play: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
  setTime: (hours: number, minutes?: number) => void;
  togglePlay: () => void;
  
  // Queries
  getAgentState: (agentId: string) => AgentState | undefined;
  getCurrentTimeString: () => string;
  getTimeOfDayLabel: () => string;
  
  // Following
  followedAgentId: string | null;
  followAgent: (agentId: string | null) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// Time constants
const REAL_TIME_MS_PER_MINUTE = 1000; // 1 real second = 1 simulation minute at 1x speed
const MINUTES_IN_DAY = 24 * 60;

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'noon';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

function getWeatherForTime(hour: number): WeatherType {
  // Simple weather pattern
  if (hour >= 6 && hour < 18) {
    // Daytime - mostly sunny
    return Math.random() > 0.3 ? 'sunny' : 'cloudy';
  }
  // Night - clear or foggy
  return Math.random() > 0.7 ? 'foggy' : 'clear';
}

function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  // Initialize time to 7:00 AM
  const [currentTime, setCurrentTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    return d;
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [followedAgentId, setFollowedAgentId] = useState<string | null>(null);
  
  // Initialize agent states
  const [agentStates, setAgentStates] = useState<Map<string, AgentState>>(() => {
    const states = new Map<string, AgentState>();
    agents.forEach(agent => {
      const location = getLocationById(agent.homeLocation) || locations[0];
      states.set(agent.id, {
        agent,
        currentAction: null,
        currentLocation: location,
        isTraveling: false,
        journeyProgress: 0,
        journeyFrom: null,
        journeyTo: null,
      });
    });
    return states;
  });
  
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLogEntry[]>([]);
  
  const timeOfDay = getTimeOfDay(currentTime.getHours());
  const [weather, setWeather] = useState<WeatherType>('sunny');
  
  // Refs for animation loop
  const lastFrameTime = useRef<number>(0);
  const accumulatedTime = useRef<number>(0);
  
  // Calculate current action for an agent at a specific time
  const calculateAgentAction = useCallback((agentId: string, time: Date): ScheduleAction | null => {
    const schedule = getScheduleByAgent(agentId);
    if (!schedule) return null;
    
    const currentMinutes = time.getHours() * 60 + time.getMinutes();
    
    // Find the most recent action that has started
    let currentAction: ScheduleAction | null = null;
    
    for (const action of schedule.actions) {
      const actionMinutes = timeStringToMinutes(action.time);
      if (actionMinutes <= currentMinutes) {
        currentAction = action;
      } else {
        break;
      }
    }
    
    return currentAction;
  }, []);
  
  // Update all agent states based on current time
  const updateAgentStates = useCallback((time: Date) => {
    setAgentStates(prevStates => {
      const newStates = new Map(prevStates);
      const newJourneys: Journey[] = [];
      const newActivities: ActivityLogEntry[] = [];
      
      agents.forEach(agent => {
        const currentState = newStates.get(agent.id);
        if (!currentState) return;
        
        const action = calculateAgentAction(agent.id, time);
        
        if (action) {
          const fromLocation = getLocationById(action.fromLocation);
          const toLocation = getLocationById(action.toLocation);
          
          // Check if this is a new action
          const isNewAction = currentState.currentAction?.id !== action.id;
          
          if (action.type === 'travel' && fromLocation && toLocation) {
            // Calculate journey progress
            const actionMinutes = timeStringToMinutes(action.time);
            const currentMinutes = time.getHours() * 60 + time.getMinutes();
            const nextAction = getScheduleByAgent(agent.id)?.actions[
              getScheduleByAgent(agent.id)?.actions.indexOf(action)! + 1
            ];
            
            let journeyDuration = 15; // Default 15 minutes
            if (nextAction) {
              const nextMinutes = timeStringToMinutes(nextAction.time);
              journeyDuration = nextMinutes - actionMinutes;
            }
            
            const elapsed = currentMinutes - actionMinutes;
            const progress = Math.min(1, Math.max(0, elapsed / journeyDuration));
            
            newStates.set(agent.id, {
              ...currentState,
              currentAction: action,
              isTraveling: progress < 1,
              journeyProgress: progress,
              journeyFrom: fromLocation,
              journeyTo: toLocation,
            });
            
            // Add to active journeys
            if (progress < 1) {
              newJourneys.push({
                id: `${agent.id}-${action.id}`,
                agentId: agent.id,
                fromLocation,
                toLocation,
                startTime: new Date(time.getTime() - elapsed * 60000),
                endTime: new Date(time.getTime() + (journeyDuration - elapsed) * 60000),
                progress,
              });
            }
          } else {
            // Non-travel action
            newStates.set(agent.id, {
              ...currentState,
              currentAction: action,
              currentLocation: toLocation || currentState.currentLocation,
              isTraveling: false,
              journeyProgress: 0,
              journeyFrom: null,
              journeyTo: null,
            });
          }
          
          // Log new activity
          if (isNewAction && toLocation) {
            newActivities.push({
              id: `${agent.id}-${action.id}-${Date.now()}`,
              agentId: agent.id,
              agentName: agent.name,
              agentAvatar: agent.avatar,
              action,
              timestamp: time,
              locationName: toLocation.name,
              type: 'start',
            });
          }
        }
      });
      
      setActiveJourneys(newJourneys);
      
      // Add to recent activities (keep last 50)
      if (newActivities.length > 0) {
        setRecentActivities(prev => [...newActivities, ...prev].slice(0, 50));
      }
      
      return newStates;
    });
  }, [calculateAgentAction]);
  
  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;
    
    let animationFrameId: number;
    
    const animate = (timestamp: number) => {
      if (!lastFrameTime.current) {
        lastFrameTime.current = timestamp;
      }
      
      const deltaTime = timestamp - lastFrameTime.current;
      lastFrameTime.current = timestamp;
      
      // Accumulate time based on speed
      accumulatedTime.current += deltaTime * speed;
      
      // Update time every 100ms of accumulated time
      if (accumulatedTime.current >= 100) {
        const minutesToAdd = Math.floor(accumulatedTime.current / REAL_TIME_MS_PER_MINUTE * 60);
        if (minutesToAdd > 0) {
          setCurrentTime(prev => {
            const newTime = new Date(prev.getTime() + minutesToAdd * 60000);
            // Update weather occasionally
            if (newTime.getMinutes() === 0) {
              setWeather(getWeatherForTime(newTime.getHours()));
            }
            return newTime;
          });
          accumulatedTime.current = 0;
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      lastFrameTime.current = 0;
    };
  }, [isPlaying, speed]);
  
  // Update agent states when time changes
  useEffect(() => {
    updateAgentStates(currentTime);
  }, [currentTime, updateAgentStates]);
  
  // Control functions
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);
  
  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
  }, []);
  
  const setTime = useCallback((hours: number, minutes: number = 0) => {
    setCurrentTime(prev => {
      const newTime = new Date(prev);
      newTime.setHours(hours, minutes, 0, 0);
      return newTime;
    });
    setWeather(getWeatherForTime(hours));
  }, []);
  
  const getAgentState = useCallback((agentId: string) => {
    return agentStates.get(agentId);
  }, [agentStates]);
  
  const getCurrentTimeString = useCallback(() => {
    return currentTime.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }, [currentTime]);
  
  const getTimeOfDayLabel = useCallback(() => {
    const labels: Record<TimeOfDay, string> = {
      dawn: '黎明',
      morning: '上午',
      noon: '中午',
      afternoon: '下午',
      evening: '傍晚',
      night: '夜晚',
    };
    return labels[timeOfDay];
  }, [timeOfDay]);
  
  const followAgent = useCallback((agentId: string | null) => {
    setFollowedAgentId(agentId);
  }, []);
  
  const value: SimulationContextType = {
    currentTime,
    isPlaying,
    speed,
    timeOfDay,
    weather,
    agentStates,
    activeJourneys,
    recentActivities,
    play,
    pause,
    setSpeed,
    setTime,
    togglePlay,
    getAgentState,
    getCurrentTimeString,
    getTimeOfDayLabel,
    followedAgentId,
    followAgent,
  };
  
  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
