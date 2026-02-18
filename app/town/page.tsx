'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Play, 
  Pause, 
  FastForward,
  Users,
  MapPin,
  Activity,
  Plus,
  X,
  ChevronRight,
  Sun,
  Moon,
  Cloud,
  Coffee,
  Utensils,
  ShoppingBag,
  Briefcase,
  Home
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

interface Activity {
  id: string;
  characterName: string;
  characterAvatar: string;
  action: string;
  location: string;
  time: string;
}

const timeMarkers = Array.from({ length: 25 }, (_, i) => i);

export default function TownPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentTime, setCurrentTime] = useState(8);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [weather] = useState('sunny');
  const [season] = useState('SPRING');
  const [activeTab, setActiveTab] = useState<'all' | 'hot' | 'mine'>('all');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  const [viewState, setViewState] = useState({
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    zoom: 14,
  });

  const activityRef = useRef<HTMLDivElement>(null);

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
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.1 * speed;
        return next >= 24 ? 0 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  useEffect(() => {
    const generateActivity = () => {
      if (characters.length === 0 || places.length === 0) return;
      
      const char = characters[Math.floor(Math.random() * characters.length)];
      const place = places[Math.floor(Math.random() * places.length)];
      const actions = ['正在前往', '到达了', '在', '离开了'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      const activity: Activity = {
        id: Date.now().toString(),
        characterName: char.name,
        characterAvatar: char.avatar || '',
        action: `${action} ${place.name}`,
        location: place.name,
        time: `${Math.floor(currentTime)}:${String(Math.floor((currentTime % 1) * 60)).padStart(2, '0')}`,
      };
      
      setActivities(prev => [activity, ...prev].slice(0, 50));
    };

    const interval = setInterval(generateActivity, 3000 / speed);
    return () => clearInterval(interval);
  }, [characters, places, currentTime, speed]);

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.floor((hour % 1) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const getTimeIcon = () => {
    if (currentTime >= 6 && currentTime < 18) return <Sun className="w-4 h-4 text-yellow-500" />;
    return <Moon className="w-4 h-4 text-blue-400" />;
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('eat') || s.includes('餐')) return <Utensils className="w-3 h-3" />;
    if (s.includes('coffee')) return <Coffee className="w-3 h-3" />;
    if (s.includes('shop')) return <ShoppingBag className="w-3 h-3" />;
    if (s.includes('work')) return <Briefcase className="w-3 h-3" />;
    if (s.includes('home') || s.includes('家')) return <Home className="w-3 h-3" />;
    return <MapPin className="w-3 h-3" />;
  };

  const handleCharacterClick = (char: Character) => {
    setSelectedCharacter(char);
    setSelectedPlace(null);
    setViewState(prev => ({
      ...prev,
      latitude: char.lat,
      longitude: char.lng,
      zoom: 16,
    }));
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setSelectedCharacter(null);
    setViewState(prev => ({
      ...prev,
      latitude: place.lat,
      longitude: place.lng,
      zoom: 16,
    }));
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
          <Badge variant="outline" className="text-xs">
            <Cloud className="w-3 h-3 mr-1" />
            {weather}
          </Badge>
          <Badge variant="outline" className="text-xs">{season}</Badge>
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
              {validCharacters.map(char => (
                <motion.div
                  key={char.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCharacterClick(char)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedCharacter?.id === char.id 
                      ? 'bg-[#165DFF]/10 ring-1 ring-[#165DFF]' 
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
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{char.name}</p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        {getStatusIcon(char.currentStatus)}
                        {char.currentStatus || '空闲中'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center: Map */}
        <div className="flex-1 relative">
          {MAPBOX_TOKEN ? (
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              mapStyle="mapbox://styles/mapbox/light-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: '100%', height: '100%' }}
            >
              <NavigationControl position="top-left" />

              {/* Places */}
              {validPlaces.slice(0, 30).map(place => (
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
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer transition-transform hover:scale-110 ${
                    selectedPlace?.id === place.id 
                      ? 'bg-[#FF7D00] text-white ring-2 ring-[#FF7D00]/30' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    📍
                  </div>
                </Marker>
              ))}

              {/* Characters */}
              {validCharacters.slice(0, 30).map(char => (
                <Marker
                  key={char.id}
                  latitude={char.lat}
                  longitude={char.lng}
                  anchor="bottom"
                  onClick={e => {
                    e.originalEvent.stopPropagation();
                    handleCharacterClick(char);
                  }}
                >
                  <div className={`relative cursor-pointer transition-transform hover:scale-110 ${
                    selectedCharacter?.id === char.id ? 'scale-125' : ''
                  }`}>
                    {selectedCharacter?.id === char.id && (
                      <motion.div
                        className="absolute inset-0 -m-1 rounded-full border-2 border-[#FF7D00]"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <img
                      src={char.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.id}`}
                      alt={char.name}
                      className={`w-8 h-8 rounded-full border-2 border-white shadow-md ${
                        selectedCharacter?.id === char.id ? 'border-[#FF7D00]' : ''
                      }`}
                    />
                  </div>
                </Marker>
              ))}
            </Map>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">Mapbox token not configured</p>
            </div>
          )}
        </div>

        {/* Right: Activity Feed */}
        <div className="w-[280px] bg-white border-l border-gray-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#165DFF]" />
              小镇正在发生…
            </h3>
          </div>
          <ScrollArea className="flex-1" ref={activityRef}>
            <div className="p-2 space-y-2">
              <AnimatePresence initial={false}>
                {activities.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-2 rounded-lg bg-gray-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={activity.characterAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.id}`}
                        alt=""
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="font-medium">{activity.characterName}</span>
                      <span className="text-gray-400 text-[10px] ml-auto">{activity.time}</span>
                    </div>
                    <p className="text-gray-600 mt-1 pl-7">{activity.action}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
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
