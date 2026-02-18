'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Map, { Marker, NavigationControl, ScaleControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Play, 
  Pause, 
  Users,
  MapPin,
  Activity,
  Plus,
  ChevronRight,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Leaf,
  Coffee,
  Utensils,
  ShoppingBag,
  Briefcase,
  Home,
  Heart,
  Car
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
const DEFAULT_LAT = 34.1469;
const DEFAULT_LNG = -118.2551;

function isValidCoord(lat: any, lng: any): boolean {
  return typeof lat === 'number' && typeof lng === 'number' && 
    !isNaN(lat) && !isNaN(lng) && 
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

interface Character {
  id: string;
  name: string;
  avatar: string | null;
  age: number;
  occupation: string;
  currentStatus: string;
  lat: number;
  lng: number;
  homeLocation?: { lat: number; lng: number };
}

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  placeType: string;
}

interface TimelineEvent {
  id: string;
  time: number;
  type: 'move' | 'activity' | 'meeting' | 'special';
  characterId: string;
  characterName: string;
  characterAvatar: string;
  description: string;
  fromLocation?: { lat: number; lng: number; name: string };
  toLocation?: { lat: number; lng: number; name: string };
  duration: number;
  completed: boolean;
}

interface WeatherState {
  type: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  temperature: number;
  windSpeed: number;
}

const SEASONS = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];

const timeMarkers = Array.from({ length: 25 }, (_, i) => i);

export default function TownPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [currentTime, setCurrentTime] = useState(8);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [weather, setWeather] = useState<WeatherState>({
    type: 'sunny',
    temperature: 72,
    windSpeed: 5,
  });
  const [season, setSeason] = useState('SPRING');
  const [activeTab, setActiveTab] = useState<'all' | 'hot' | 'mine'>('all');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [characterPositions, setCharacterPositions] = useState<Record<string, { lat: number; lng: number }>>({});

  const [viewState, setViewState] = useState({
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    zoom: 15,
    pitch: 45,
    bearing: -20,
  });

  const activityRef = useRef<HTMLDivElement>(null);
  const prevTimeRef = useRef(8);

  useEffect(() => {
    Promise.all([
      fetch('/api/characters?limit=50').then(r => r.json()),
      fetch('/api/places').then(r => r.json()),
    ]).then(([charsData, placesData]) => {
      const chars = (charsData.characters || charsData.data?.characters || charsData.data || []).map((c: any) => ({
        ...c,
        lat: c.lat || c.homeLocation?.lat || DEFAULT_LAT,
        lng: c.lng || c.homeLocation?.lng || DEFAULT_LNG,
      }));
      const pls = (placesData.places || placesData.data?.places || placesData.data || []).map((p: any) => ({
        ...p,
        lat: p.lat || DEFAULT_LAT,
        lng: p.lng || DEFAULT_LNG,
      }));
      setCharacters(chars);
      setPlaces(pls);
      
      const positions: Record<string, { lat: number; lng: number }> = {};
      chars.forEach((c: Character) => {
        positions[c.id] = { lat: c.lat, lng: c.lng };
      });
      setCharacterPositions(positions);
      
      generateDailyEvents(chars, pls);
    }).catch(console.error);
  }, []);

  const generateDailyEvents = (chars: Character[], pls: Place[]) => {
    const eventTypes = ['move', 'activity', 'meeting', 'special'] as const;
    const activities = [
      '在咖啡店工作', '吃午餐', '购物', '散步', '运动', 
      '会见朋友', '看书', '休息', '上班', '下班回家'
    ];
    
    const newEvents: TimelineEvent[] = [];
    
    chars.slice(0, 15).forEach(char => {
      const numEvents = 4 + Math.floor(Math.random() * 4);
      
      for (let i = 0; i < numEvents; i++) {
        const hour = 6 + (i * (18 / numEvents)) + Math.random() * 2;
        const place = pls[Math.floor(Math.random() * pls.length)];
        const prevPlace = i > 0 ? pls[Math.floor(Math.random() * pls.length)] : null;
        
        newEvents.push({
          id: `${char.id}-${i}`,
          time: hour,
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          characterId: char.id,
          characterName: char.name,
          characterAvatar: char.avatar || '',
          description: activities[Math.floor(Math.random() * activities.length)],
          fromLocation: prevPlace ? { lat: prevPlace.lat, lng: prevPlace.lng, name: prevPlace.name } : undefined,
          toLocation: { lat: place.lat, lng: place.lng, name: place.name },
          duration: 0.5 + Math.random() * 1.5,
          completed: false,
        });
      }
    });
    
    newEvents.sort((a, b) => a.time - b.time);
    setEvents(newEvents);
  };

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.05 * speed;
        return next >= 24 ? 0 : next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  useEffect(() => {
    const hour = Math.floor(currentTime);
    
    if (hour >= 6 && hour < 12) {
      setWeather({ type: 'sunny', temperature: 70 + Math.random() * 10, windSpeed: 3 + Math.random() * 5 });
    } else if (hour >= 12 && hour < 18) {
      setWeather({ type: Math.random() > 0.7 ? 'cloudy' : 'sunny', temperature: 75 + Math.random() * 10, windSpeed: 5 + Math.random() * 10 });
    } else {
      setWeather({ type: Math.random() > 0.5 ? 'cloudy' : 'sunny', temperature: 60 + Math.random() * 10, windSpeed: 2 + Math.random() * 5 });
    }
    
    const month = Math.floor((currentTime / 24) * 12) % 4;
    setSeason(SEASONS[month]);
  }, [Math.floor(currentTime)]);

  useEffect(() => {
    events.forEach(event => {
      if (!event.completed && currentTime >= event.time && currentTime < event.time + event.duration) {
        setCharacterPositions(prev => {
          if (event.toLocation) {
            return {
              ...prev,
              [event.characterId]: {
                lat: event.toLocation.lat,
                lng: event.toLocation.lng,
              },
            };
          }
          return prev;
        });
      }
    });
  }, [currentTime, events]);

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.floor((hour % 1) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const getTimeIcon = () => {
    if (currentTime >= 6 && currentTime < 18) return <Sun className="w-4 h-4 text-yellow-500" />;
    return <Moon className="w-4 h-4 text-blue-400" />;
  };

  const getWeatherIcon = () => {
    switch (weather.type) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-400" />;
      case 'rainy': return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'snowy': return <CloudSnow className="w-5 h-5 text-blue-200" />;
      default: return <Sun className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('eat') || s.includes('餐')) return <Utensils className="w-3 h-3" />;
    if (s.includes('coffee')) return <Coffee className="w-3 h-3" />;
    if (s.includes('shop')) return <ShoppingBag className="w-3 h-3" />;
    if (s.includes('work')) return <Briefcase className="w-3 h-3" />;
    if (s.includes('home') || s.includes('家')) return <Home className="w-3 h-3" />;
    if (s.includes('love') || s.includes('爱')) return <Heart className="w-3 h-3" />;
    if (s.includes('drive') || s.includes('车')) return <Car className="w-3 h-3" />;
    return <MapPin className="w-3 h-3" />;
  };

  const handleCharacterClick = (char: Character) => {
    setSelectedCharacter(char);
    setSelectedPlace(null);
    const pos = characterPositions[char.id] || { lat: char.lat, lng: char.lng };
    setViewState(prev => ({
      ...prev,
      latitude: pos.lat,
      longitude: pos.lng,
      zoom: 17,
      pitch: 60,
    }));
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setSelectedCharacter(null);
    setViewState(prev => ({
      ...prev,
      latitude: place.lat,
      longitude: place.lng,
      zoom: 17,
      pitch: 60,
    }));
  };

  const getCurrentEvents = () => {
    return events.filter(e => 
      currentTime >= e.time && currentTime < e.time + e.duration && !e.completed
    );
  };

  const getUpcomingEvents = () => {
    return events.filter(e => e.time > currentTime).slice(0, 10);
  };

  const validCharacters = characters.filter(c => isValidCoord(c.lat, c.lng));
  const validPlaces = places.filter(p => isValidCoord(p.lat, p.lng));

  return (
    <div className="fixed inset-0 bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* Top Timeline Bar */}
      <div className="h-[50px] bg-white border-b border-gray-200 flex items-center px-4 shrink-0 z-20">
        {/* Left: Time Info */}
        <div className="flex items-center gap-4 w-[280px] shrink-0">
          <div className="flex items-center gap-2">
            {getTimeIcon()}
            <span className="text-lg font-semibold text-[#165DFF]">{formatTime(currentTime)}</span>
          </div>
        </div>

        {/* Center: Timeline Slider */}
        <div className="flex-1 px-8">
          <div className="relative">
            <Slider
              value={[currentTime]}
              onValueChange={([v]) => setCurrentTime(v)}
              max={24}
              step={0.1}
              className="w-full"
            />
            <div className="absolute top-6 left-0 right-0 flex justify-between text-[10px] text-gray-400">
              {timeMarkers.filter((_, i) => i % 4 === 0).map(h => (
                <span key={h}>{String(h).padStart(2, '0')}:00</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 w-[280px] justify-end shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
            {[1, 2, 4].map(s => (
              <Button
                key={s}
                variant={speed === s ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSpeed(s)}
                className={`h-6 px-2 text-xs rounded-full ${speed === s ? 'bg-[#165DFF] text-white' : ''}`}
              >
                {s}×
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Resident List */}
        <div className="w-[280px] bg-white border-r border-gray-200 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { key: 'all', label: '全部居民' },
              { key: 'hot', label: '热门' },
              { key: 'mine', label: '我的' },
            ].map(tab => (
              <Button
                key={tab.key}
                variant="ghost"
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 rounded-none h-10 text-xs ${
                  activeTab === tab.key ? 'border-b-2 border-[#165DFF] text-[#165DFF]' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {validCharacters.map(char => {
                const currentEvent = events.find(e => 
                  e.characterId === char.id && 
                  currentTime >= e.time && 
                  currentTime < e.time + e.duration
                );
                
                return (
                  <motion.div
                    key={char.id}
                    layout
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCharacterClick(char)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedCharacter?.id === char.id 
                        ? 'bg-[#165DFF]/10 ring-1 ring-[#165DFF]' 
                        : currentEvent
                        ? 'bg-[#FF7D00]/5'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={char.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.id}`}
                          alt={char.name}
                          className="w-10 h-10 rounded-full bg-gray-100"
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          currentEvent ? 'bg-[#FF7D00]' : 'bg-green-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{char.name}</p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          {getStatusIcon(currentEvent?.description || char.currentStatus)}
                          {currentEvent?.description || char.currentStatus || '空闲中'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Center: Map */}
        <div className="flex-1 relative">
          {MAPBOX_TOKEN ? (
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: '100%', height: '100%' }}
              terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
            >
              <NavigationControl position="top-left" visualizePitch />
              <ScaleControl position="bottom-left" />
              
              {/* Weather Overlay */}
              <div className="absolute top-4 left-16 z-10 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-3">
                  {getWeatherIcon()}
                  <div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3 h-3 text-gray-400" />
                      <span className="text-sm font-medium">{Math.round(weather.temperature)}°F</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Wind className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{Math.round(weather.windSpeed)} mph</span>
                    </div>
                  </div>
                  <div className="pl-3 border-l border-gray-200">
                    <Leaf className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-600 block">{season}</span>
                  </div>
                </div>
              </div>

              {/* Time of Day Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none z-5 transition-all duration-1000"
                style={{
                  background: currentTime >= 6 && currentTime < 18
                    ? 'transparent'
                    : currentTime >= 18 && currentTime < 21
                    ? 'linear-gradient(to bottom, rgba(255,140,0,0.1), rgba(255,100,0,0.15))'
                    : 'linear-gradient(to bottom, rgba(0,0,50,0.2), rgba(0,0,30,0.3))',
                }}
              />

              {/* Places */}
              {validPlaces.slice(0, 30).map(place => {
                const visitorsHere = events.filter(e => 
                  currentTime >= e.time && 
                  currentTime < e.time + e.duration &&
                  e.toLocation?.lat === place.lat &&
                  e.toLocation?.lng === place.lng
                );
                
                return (
                  <Marker
                    key={place.id}
                    latitude={place.lat}
                    longitude={place.lng}
                    anchor="bottom"
                    onClick={e => {
                      e.originalEvent.stopPropagation();
                      handlePlaceClick(place);
                    }}
                  >
                    <motion.div 
                      className={`relative cursor-pointer transition-transform hover:scale-110 ${
                        selectedPlace?.id === place.id ? 'scale-125' : ''
                      }`}
                      animate={visitorsHere.length > 0 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: visitorsHere.length > 0 ? Infinity : 0 }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg ${
                        selectedPlace?.id === place.id 
                          ? 'bg-[#FF7D00] text-white ring-2 ring-[#FF7D00]/30' 
                          : visitorsHere.length > 0
                          ? 'bg-[#165DFF] text-white'
                          : 'bg-white border border-gray-200'
                      }`}>
                        📍
                      </div>
                      {visitorsHere.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF7D00] rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                          {visitorsHere.length}
                        </div>
                      )}
                    </motion.div>
                  </Marker>
                );
              })}

              {/* Characters with animation */}
              {validCharacters.slice(0, 30).map(char => {
                const pos = characterPositions[char.id] || { lat: char.lat, lng: char.lng };
                const currentEvent = events.find(e => 
                  e.characterId === char.id && 
                  currentTime >= e.time && 
                  currentTime < e.time + e.duration
                );
                
                if (!isValidCoord(pos.lat, pos.lng)) return null;
                
                return (
                  <Marker
                    key={char.id}
                    latitude={pos.lat}
                    longitude={pos.lng}
                    anchor="bottom"
                    onClick={e => {
                      e.originalEvent.stopPropagation();
                      handleCharacterClick(char);
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: selectedCharacter?.id === char.id ? 1.3 : 1,
                      }}
                      whileHover={{ scale: 1.2 }}
                      className="relative cursor-pointer"
                    >
                      {selectedCharacter?.id === char.id && (
                        <motion.div
                          className="absolute inset-0 -m-2 rounded-full border-3 border-[#FF7D00]"
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                      
                      {currentEvent?.type === 'move' && (
                        <motion.div
                          className="absolute inset-0 -m-1 rounded-full bg-[#165DFF]/20"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      )}
                      
                      <img
                        src={char.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.id}`}
                        alt={char.name}
                        className={`w-9 h-9 rounded-full border-3 shadow-lg ${
                          selectedCharacter?.id === char.id 
                            ? 'border-[#FF7D00]' 
                            : currentEvent
                            ? 'border-[#165DFF]'
                            : 'border-white'
                        }`}
                      />
                      
                      {currentEvent && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
                        >
                          <span className="text-[9px] px-1.5 py-0.5 bg-[#165DFF] text-white rounded-full shadow">
                            {currentEvent.description.slice(0, 8)}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  </Marker>
                );
              })}
            </Map>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">Mapbox token not configured</p>
            </div>
          )}
        </div>

        {/* Right: Event Feed */}
        <div className="w-[280px] bg-white border-l border-gray-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#165DFF]" />
              小镇事件
            </h3>
          </div>
          <ScrollArea className="flex-1" ref={activityRef}>
            <div className="p-2 space-y-2">
              {/* Current Events */}
              {getCurrentEvents().length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] text-gray-400 uppercase mb-1 px-1">正在进行</p>
                  {getCurrentEvents().map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-2 rounded-lg bg-[#FF7D00]/10 border border-[#FF7D00]/20 mb-1"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={event.characterAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.id}`}
                          alt=""
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="font-medium text-xs">{event.characterName}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 pl-7">{event.description}</p>
                      {event.toLocation && (
                        <p className="text-[10px] text-gray-400 mt-1 pl-7">📍 {event.toLocation.name}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Upcoming Events */}
              <div>
                <p className="text-[10px] text-gray-400 uppercase mb-1 px-1">即将发生</p>
                <AnimatePresence initial={false}>
                  {getUpcomingEvents().map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-2 rounded-lg bg-gray-50 text-xs mb-1"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={event.characterAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.id}`}
                          alt=""
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="font-medium">{event.characterName}</span>
                        <span className="text-gray-400 text-[10px] ml-auto">
                          {formatTime(event.time)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1 pl-6">{event.description}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Bottom Create Button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <Sheet open={showCreateDrawer} onOpenChange={setShowCreateDrawer}>
          <SheetTrigger asChild>
            <Button className="h-12 px-6 bg-[#FF7D00] hover:bg-[#FF7D00]/90 text-white rounded-full shadow-lg shadow-[#FF7D00]/30">
              <Plus className="w-5 h-5 mr-2" />
              创建我的角色
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>创建新角色</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <Button variant="outline" size="sm">上传头像</Button>
                </div>
                <Input placeholder="角色名称" className="h-12" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">职业</label>
                <div className="grid grid-cols-3 gap-2">
                  {['工程师', '教师', '医生', '艺术家', '商人', '厨师'].map(job => (
                    <Button key={job} variant="outline" size="sm" className="h-10">
                      {job}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">用一句话改变他的人生</label>
                <Input placeholder="例如：今天去约会、换一份工作、周末去旅行" className="h-12" />
              </div>

              <Button className="w-full h-12 bg-[#165DFF] hover:bg-[#165DFF]/90">
                生成角色
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
