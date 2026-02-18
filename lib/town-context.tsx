'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

interface Town {
  id: string;
  name: string;
  region: string;
  currentDate: string;
  currentTime: string;
  timeSpeed: number;
  weather: string;
  temperature: number;
  season: string;
  isHoliday: boolean;
  holidayName?: string;
}

interface Place {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  placeType: string;
  description?: string;
  rating?: number;
}

interface Character {
  id: string;
  name: string;
  avatar?: string;
  age: number;
  occupation: string;
  bio?: string;
  currentStatus: string;
  currentMood: string;
  lat: number;
  lng: number;
  homeLocation?: Place;
  workLocation?: Place;
}

interface Routine {
  id: string;
  characterId: string;
  fromPlaceId?: string;
  toPlaceId?: string;
  fromTime: string;
  toTime: string;
  activity: string;
}

export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'foggy' | 'clear';

interface Journey {
  id: string;
  characterId: string;
  fromLocation: { lat: number; lng: number; name: string };
  toLocation: { lat: number; lng: number; name: string };
  startTime: Date;
  endTime: Date;
  progress: number;
}

interface ActivityLogEntry {
  id: string;
  characterId: string;
  characterName: string;
  characterAvatar: string;
  activity: string;
  locationName: string;
  timestamp: Date;
  type: 'start' | 'ongoing' | 'end';
}

interface TownContextType {
  town: Town | null;
  places: Place[];
  characters: Character[];
  routines: Routine[];
  currentTime: Date;
  isPlaying: boolean;
  speed: number;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  followedCharacterId: string | null;
  activeJourneys: Journey[];
  recentActivities: ActivityLogEntry[];
  isLoading: boolean;
  error: string | null;
  refreshTown: () => Promise<void>;
  updateTimeSpeed: (speed: number) => Promise<void>;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  setTime: (hours: number, minutes?: number) => void;
  followCharacter: (characterId: string | null) => void;
  getCharacterPosition: (characterId: string, time: Date) => { lat: number; lng: number } | null;
  getAgentState: (agentId: string) => any;
  getCurrentTimeString: () => string;
  getTimeOfDayLabel: () => string;
}

const TownContext = createContext<TownContextType | undefined>(undefined);

const DEFAULT_LAT = 34.1425;
const DEFAULT_LNG = -118.2551;

function isValidCoord(lat: any, lng: any): boolean {
  return typeof lat === 'number' && typeof lng === 'number' && 
    !isNaN(lat) && !isNaN(lng) && 
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'noon';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

function getWeatherForTime(hour: number): WeatherType {
  if (hour >= 6 && hour < 18) {
    return Math.random() > 0.3 ? 'sunny' : 'cloudy';
  }
  return Math.random() > 0.7 ? 'foggy' : 'clear';
}

function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function getCharacterPositionAtTime(character: Character, routines: Routine[], time: Date, places: Place[]): { lat: number; lng: number } | null {
  const currentMinutes = time.getHours() * 60 + time.getMinutes();
  
  const characterRoutines = routines.filter(r => r.characterId === character.id);
  if (characterRoutines.length === 0) {
    return character.homeLocation ? { lat: character.homeLocation.lat, lng: character.homeLocation.lng } : null;
  }
  
  const sortedRoutines = [...characterRoutines].sort((a, b) => 
    timeStringToMinutes(a.fromTime) - timeStringToMinutes(b.fromTime)
  );
  
  for (let i = sortedRoutines.length - 1; i >= 0; i--) {
    const routine = sortedRoutines[i];
    const fromMinutes = timeStringToMinutes(routine.fromTime);
    const toMinutes = timeStringToMinutes(routine.toTime);
    
    if (currentMinutes >= fromMinutes && currentMinutes < toMinutes) {
      if (routine.toPlaceId) {
        const place = places.find(p => p.id === routine.toPlaceId);
        if (place) return { lat: place.lat, lng: place.lng };
      }
    }
    
    if (currentMinutes < fromMinutes && i > 0) {
      const prevRoutine = sortedRoutines[i - 1];
      if (prevRoutine.toPlaceId) {
        const place = places.find(p => p.id === prevRoutine.toPlaceId);
        if (place) return { lat: place.lat, lng: place.lng };
      }
    }
  }
  
  return character.homeLocation ? { lat: character.homeLocation.lat, lng: character.homeLocation.lng } : null;
}

export function TownProvider({ children }: { children: ReactNode }) {
  const [town, setTown] = useState<Town | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [followedCharacterId, setFollowedCharacterId] = useState<string | null>(null);
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeOfDay = getTimeOfDay(currentTime.getHours());
  const weather: WeatherType = town?.weather as WeatherType || 'sunny';

  const lastFrameTime = useRef<number>(0);
  const accumulatedTime = useRef<number>(0);

  const fetchTownData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [townRes, placesRes, charsRes, routinesRes] = await Promise.all([
        fetch('/api/town').catch(() => null),
        fetch('/api/places').catch(() => null),
        fetch('/api/characters').catch(() => null),
        fetch('/api/routines/current').catch(() => null),
      ]);
      
      if (townRes?.ok) {
        const townData = await townRes.json();
        setTown(townData);
        setCurrentTime(new Date(townData.currentDate || townData.currentTime));
        setSpeedState(townData.timeSpeed || 1);
      }
      
      if (placesRes?.ok) {
        const placesData = await placesRes.json();
        const places = (placesData.data || placesData).map((p: any) => ({
          ...p,
          lat: isValidCoord(p.lat, p.lng) ? p.lat : DEFAULT_LAT,
          lng: isValidCoord(p.lat, p.lng) ? p.lng : DEFAULT_LNG,
        }));
        setPlaces(places);
      }
      
      if (charsRes?.ok) {
        const charsData = await charsRes.json();
        setCharacters((charsData.data || charsData).map((c: any) => ({
          ...c,
          lat: isValidCoord(c.lat, c.lng) ? c.lat : (isValidCoord(c.homeLocation?.lat, c.homeLocation?.lng) ? c.homeLocation.lat : DEFAULT_LAT),
          lng: isValidCoord(c.lat, c.lng) ? c.lng : (isValidCoord(c.homeLocation?.lat, c.homeLocation?.lng) ? c.homeLocation.lng : DEFAULT_LNG),
          homeLocation: c.homeLocation,
          workLocation: c.workLocation,
        })));
      }
      
      if (routinesRes?.ok) {
        const routinesData = await routinesRes.json();
        setRoutines(routinesData.data || routinesData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTownData();
  }, [fetchTownData]);

  useEffect(() => {
    if (!isPlaying) return;
    
    let animationFrameId: number;
    
    const animate = (timestamp: number) => {
      if (!lastFrameTime.current) {
        lastFrameTime.current = timestamp;
      }
      
      const deltaTime = timestamp - lastFrameTime.current;
      lastFrameTime.current = timestamp;
      
      accumulatedTime.current += deltaTime * speed;
      
      if (accumulatedTime.current >= 100) {
        const minutesToAdd = Math.floor(accumulatedTime.current / 1000 * 60);
        if (minutesToAdd > 0) {
          setCurrentTime(prev => new Date(prev.getTime() + minutesToAdd * 60000));
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

  useEffect(() => {
    const journeys: Journey[] = [];
    const activities: ActivityLogEntry[] = [];
    
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    characters.forEach(character => {
      const characterRoutines = routines.filter(r => r.characterId === character.id);
      
      for (const routine of characterRoutines) {
        const fromMinutes = timeStringToMinutes(routine.fromTime);
        const toMinutes = timeStringToMinutes(routine.toTime);
        
        if (currentMinutes >= fromMinutes && currentMinutes < toMinutes) {
          const fromPlace = places.find(p => p.id === routine.fromPlaceId);
          const toPlace = places.find(p => p.id === routine.toPlaceId);
          
          if (fromPlace && toPlace) {
            const totalDuration = toMinutes - fromMinutes;
            const elapsed = currentMinutes - fromMinutes;
            const progress = Math.min(1, Math.max(0, elapsed / totalDuration));
            
            if (progress < 1) {
              journeys.push({
                id: `${character.id}-${routine.id}`,
                characterId: character.id,
                fromLocation: { lat: fromPlace.lat, lng: fromPlace.lng, name: fromPlace.name },
                toLocation: { lat: toPlace.lat, lng: toPlace.lng, name: toPlace.name },
                startTime: new Date(currentTime.getTime() - elapsed * 60000),
                endTime: new Date(currentTime.getTime() + (totalDuration - elapsed) * 60000),
                progress,
              });
            }
          }
        }
      }
    });
    
    setActiveJourneys(journeys);
  }, [currentTime, characters, routines, places]);

  const updateTimeSpeed = async (newSpeed: number) => {
    try {
      const res = await fetch('/api/town', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSpeed: newSpeed }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTown(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);
  
  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
    updateTimeSpeed(newSpeed);
  }, []);
  
  const setTime = useCallback((hours: number, minutes: number = 0) => {
    setCurrentTime(prev => {
      const newTime = new Date(prev);
      newTime.setHours(hours, minutes, 0, 0);
      return newTime;
    });
  }, []);
  
  const followCharacter = useCallback((characterId: string | null) => {
    setFollowedCharacterId(characterId);
  }, []);
  
  const getCharacterPosition = useCallback((characterId: string, time: Date): { lat: number; lng: number } | null => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return null;
    return getCharacterPositionAtTime(character, routines, time, places);
  }, [characters, routines, places]);

  return (
    <TownContext.Provider
      value={{
        town,
        places,
        characters,
        routines,
        currentTime,
        isPlaying,
        speed,
        timeOfDay,
        weather,
        followedCharacterId,
        activeJourneys,
        recentActivities,
        isLoading,
        error,
        refreshTown: fetchTownData,
        updateTimeSpeed,
        play,
        pause,
        togglePlay,
        setSpeed,
        setTime,
        followCharacter,
        getCharacterPosition,
        getAgentState: () => null,
        getCurrentTimeString: () => currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        getTimeOfDayLabel: () => {
          const labels: Record<TimeOfDay, string> = { dawn: '黎明', morning: '上午', noon: '中午', afternoon: '下午', evening: '傍晚', night: '夜晚' };
          return labels[timeOfDay];
        },
      }}
    >
      {children}
    </TownContext.Provider>
  );
}

export function useTown() {
  const context = useContext(TownContext);
  if (context === undefined) {
    throw new Error('useTown must be used within a TownProvider');
  }
  return context;
}
