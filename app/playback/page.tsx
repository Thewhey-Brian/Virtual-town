'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Map, { Marker, Source, Layer, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Clock,
  FastForward,
  RotateCcw,
  Calendar
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface CharacterPosition {
  id: string;
  name: string;
  avatar: string | null;
  lat: number;
  lng: number;
  status: string;
  location: string;
}

interface RouteSegment {
  characterId: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  startTime: string;
  endTime: string;
  actionType: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const center = {
  latitude: 34.1469,
  longitude: -118.2551,
};

const speedOptions = [
  { value: 1, label: '1x', description: 'Real-time' },
  { value: 10, label: '10x', description: '10 min/sec' },
  { value: 60, label: '60x', description: '1 hour/sec' },
  { value: 300, label: '300x', description: '5 hours/sec' },
];

export default function PlaybackPage() {
  const mapRef = useRef<any>(null);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState('08:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(60);
  const [characterPositions, setCharacterPositions] = useState<CharacterPosition[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<RouteSegment[]>([]);
  
  const animationRef = useRef<number | undefined>(undefined);
  const lastFrameTime = useRef<number>(0);

  // Fetch positions for current time
  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch(`/api/playback/positions?date=${selectedDate}&time=${currentTime}`);
      if (res.ok) {
        const data = await res.json();
        setCharacterPositions(data.positions);
        setActiveRoutes(data.routes);
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  }, [selectedDate, currentTime]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastFrameTime.current) {
        lastFrameTime.current = timestamp;
      }

      const deltaTime = timestamp - lastFrameTime.current;
      
      // Update time based on playback speed
      // playbackSpeed represents minutes of sim time per second of real time
      const minutesToAdd = (deltaTime / 1000) * playbackSpeed;
      
      setCurrentTime(prevTime => {
        const newTime = addMinutes(prevTime, minutesToAdd);
        if (newTime >= '23:59') {
          setIsPlaying(false);
          return '23:59';
        }
        return newTime;
      });

      lastFrameTime.current = timestamp;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastFrameTime.current = 0;
    };
  }, [isPlaying, playbackSpeed]);

  const handleScrubberChange = (value: number[]) => {
    const minutes = value[0];
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    setCurrentTime(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime('06:00');
    lastFrameTime.current = 0;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
  };

  // Build GeoJSON for routes
  const routesGeoJSON = {
    type: 'FeatureCollection' as const,
    features: activeRoutes.map((route) => ({
      type: 'Feature' as const,
      properties: {
        characterId: route.characterId,
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [route.from.lng, route.from.lat],
          [route.to.lng, route.to.lat],
        ],
      },
    })),
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-muted-foreground">Mapbox token not configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <Navigation />
      
      <main className="pt-16 h-screen">
        <div className="flex h-full">
          {/* Sidebar Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white/90 backdrop-blur-sm border-r overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              {/* Header */}
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#e59a3d]" />
                  Playback
                </h1>
                <p className="text-sm text-muted-foreground">
                  Visualize character movements through the day
                </p>
              </div>

              {/* Date Selector */}
              <Card className="p-3">
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </Card>

              {/* Time Display */}
              <Card className="p-4 bg-gradient-to-r from-[#e59a3d]/10 to-[#d4862a]/10">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Time</p>
                  <p className="text-4xl font-bold text-[#e59a3d]">{currentTime}</p>
                </div>
              </Card>

              {/* Playback Controls */}
              <Card className="p-3">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentTime(prev => {
                      const mins = timeToMinutes(prev) - 60;
                      const h = Math.floor(Math.max(0, mins) / 60);
                      const m = Math.max(0, mins) % 60;
                      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    })}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <Button
                    className="bg-[#e59a3d] hover:bg-[#d4862a]"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentTime(prev => {
                      const mins = timeToMinutes(prev) + 60;
                      const h = Math.floor(Math.min(1439, mins) / 60);
                      const m = Math.min(1439, mins) % 60;
                      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    })}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* Speed Controls */}
              <Card className="p-3">
                <label className="text-sm font-medium flex items-center gap-2 mb-3">
                  <FastForward className="w-4 h-4" />
                  Playback Speed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {speedOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={playbackSpeed === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPlaybackSpeed(option.value)}
                      className={playbackSpeed === option.value ? 'bg-[#e59a3d]' : ''}
                    >
                      <div className="text-left">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Timeline Scrubber */}
              <Card className="p-3">
                <label className="text-sm font-medium mb-2 block">Timeline</label>
                <Slider
                  value={[timeToMinutes(currentTime)]}
                  onValueChange={handleScrubberChange}
                  min={360} // 6:00 AM
                  max={1439} // 23:59
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:59</span>
                </div>
              </Card>

              {/* Active Characters */}
              <Card className="p-3">
                <h3 className="font-medium mb-3">Active Characters</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {characterPositions.map((char) => (
                    <div
                      key={char.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <img
                        src={char.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.id}`}
                        alt={char.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{char.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {char.status.toLowerCase()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {char.location}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Map */}
          <div className="flex-1 relative">
            <Map
              ref={mapRef}
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={{
                longitude: center.longitude,
                latitude: center.latitude,
                zoom: 14
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
            >
              <NavigationControl position="top-right" />
              <FullscreenControl position="top-right" />

              {/* Active Routes */}
              <Source id="routes" type="geojson" data={routesGeoJSON}>
                <Layer
                  id="route-lines"
                  type="line"
                  paint={{
                    'line-color': '#e59a3d',
                    'line-width': 3,
                    'line-opacity': 0.8,
                  }}
                />
              </Source>

              {/* Character Markers */}
              {characterPositions.map((char) => (
                <Marker
                  key={char.id}
                  longitude={char.lng}
                  latitude={char.lat}
                  anchor="center"
                >
                  <div className="relative">
                    <img
                      src={char.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.id}`}
                      alt={char.name}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                      title={`${char.name} - ${char.status}`}
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                </Marker>
              ))}
            </Map>

            {/* Time Overlay */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#e59a3d]" />
                <span className="font-mono font-bold">{currentTime}</span>
                {isPlaying && (
                  <Badge className="bg-green-100 text-green-700 animate-pulse">
                    LIVE
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = Math.floor(totalMinutes % 60);
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}
