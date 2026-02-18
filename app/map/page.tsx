'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  MapPin, 
  Users, 
  Coffee,
  Utensils,
  ShoppingBag,
  TreePine,
  BookOpen,
  Briefcase,
  Film,
  Home,
  Filter,
  X,
  Navigation,
  Clock,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Snowflake
} from 'lucide-react';
import { Navigation as NavBar } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  placeType: string;
  address: string | null;
  rating: number | null;
}

interface Character {
  id: string;
  name: string;
  avatar: string | null;
  lat: number;
  lng: number;
  currentStatus: string;
  currentMood: string;
}

interface Town {
  id: string;
  name: string;
  currentTime: string;
  weather: string;
  temperature: number;
  season: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const center = {
  latitude: 34.1469,
  longitude: -118.2551,
};

const placeTypeIcons: Record<string, string> = {
  HOME: '🏠',
  CAFE: '☕',
  RESTAURANT: '🍽️',
  SHOP: '🛍️',
  PARK: '🌳',
  LIBRARY: '📚',
  WORK: '💼',
  TRANSPORT: '🚌',
  ENTERTAINMENT: '🎭',
  GYM: '💪',
  HOSPITAL: '🏥',
  SCHOOL: '🎓',
  OTHER: '📍',
};

const placeTypeFilters = [
  { value: 'HOME', label: 'Homes', icon: Home },
  { value: 'CAFE', label: 'Cafes', icon: Coffee },
  { value: 'RESTAURANT', label: 'Food', icon: Utensils },
  { value: 'SHOP', label: 'Shops', icon: ShoppingBag },
  { value: 'PARK', label: 'Parks', icon: TreePine },
  { value: 'LIBRARY', label: 'Libraries', icon: BookOpen },
  { value: 'WORK', label: 'Work', icon: Briefcase },
  { value: 'ENTERTAINMENT', label: 'Fun', icon: Film },
];

function MapPageContent() {
  const searchParams = useSearchParams();
  const highlightPlaceId = searchParams.get('place');
  const mapRef = useRef<any>(null);

  const [places, setPlaces] = useState<Place[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [town, setTown] = useState<Town | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showCharacters, setShowCharacters] = useState(true);

  useEffect(() => {
    fetchPlaces();
    fetchCharacters();
    fetchTown();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchCharacters();
      fetchTown();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (highlightPlaceId && places.length > 0) {
      const place = places.find(p => p.id === highlightPlaceId);
      if (place && mapRef.current) {
        setSelectedPlace(place);
        mapRef.current.flyTo({
          center: [place.lng, place.lat],
          zoom: 18,
          duration: 1000
        });
      }
    }
  }, [highlightPlaceId, places]);

  const fetchPlaces = async () => {
    try {
      const res = await fetch('/api/places');
      if (res.ok) {
        const response = await res.json();
        // Handle both old format (array) and new format ({ success, data })
        const placesData = Array.isArray(response) ? response : response.data?.places || response.data || [];
        setPlaces(placesData);
      }
    } catch (error) {
      console.error('Failed to fetch places:', error);
    }
  };

  const fetchCharacters = async () => {
    try {
      const res = await fetch('/api/characters/positions');
      if (res.ok) {
        const response = await res.json();
        // Handle both old format (array) and new format ({ success, data })
        const charactersData = Array.isArray(response) ? response : response.data?.characters || response.data || [];
        setCharacters(charactersData);
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    }
  };

  const fetchTown = async () => {
    try {
      const res = await fetch('/api/town');
      if (res.ok) {
        const response = await res.json();
        // Handle both old format and new format ({ success, data })
        const townData = response.data?.town || response.data || response;
        setTown(townData);
      }
    } catch (error) {
      console.error('Failed to fetch town:', error);
    }
  };

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [character.lng, character.lat],
        zoom: 18,
        duration: 1000
      });
    }
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [place.lng, place.lat],
        zoom: 18,
        duration: 1000
      });
    }
  };

  const filteredPlaces = activeFilters.length > 0
    ? places.filter(p => activeFilters.includes(p.placeType))
    : places;

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'SUNNY': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'CLOUDY': return <Cloud className="w-5 h-5 text-gray-500" />;
      case 'RAINY': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'SNOWY': return <Snowflake className="w-5 h-5 text-blue-300" />;
      case 'WINDY': return <Wind className="w-5 h-5 text-gray-400" />;
      default: return <Sun className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-muted-foreground">Mapbox token not configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <NavBar />
      
      <main className="pt-16 h-screen">
        <div className="flex h-full">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white/90 backdrop-blur-sm border-r overflow-y-auto hidden lg:block"
          >
            <div className="p-4 space-y-4">
              {/* Town Info */}
              {town && (
                <Card className="p-4 bg-gradient-to-r from-[#e59a3d]/10 to-[#d4862a]/10">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold">{town.name}</h2>
                    <Badge variant="outline">{town.season}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#e59a3d]" />
                      {town.currentTime}
                    </div>
                    <div className="flex items-center gap-1">
                      {getWeatherIcon(town.weather)}
                      {town.temperature}°F
                    </div>
                  </div>
                </Card>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold text-[#e59a3d]">{places.length}</p>
                  <p className="text-xs text-muted-foreground">Locations</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{characters.length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </Card>
              </div>

              {/* Filters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter Places
                  </h3>
                  {activeFilters.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveFilters([])}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                
                <ToggleGroup
                  type="multiple"
                  value={activeFilters}
                  onValueChange={setActiveFilters}
                  className="flex flex-wrap gap-2"
                >
                  {placeTypeFilters.map((filter) => (
                    <ToggleGroupItem
                      key={filter.value}
                      value={filter.value}
                      size="sm"
                      className="data-[state=on]:bg-[#e59a3d] data-[state=on]:text-white"
                    >
                      <filter.icon className="w-3 h-3 mr-1" />
                      {filter.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Show Characters Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Show Characters</span>
                <Button
                  variant={showCharacters ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowCharacters(!showCharacters)}
                  className={showCharacters ? 'bg-[#e59a3d]' : ''}
                >
                  <Users className="w-4 h-4 mr-1" />
                  {showCharacters ? 'On' : 'Off'}
                </Button>
              </div>

              {/* Active Characters List */}
              {showCharacters && characters.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Active Characters</h3>
                  <div className="space-y-2">
                    {characters.slice(0, 10).map((character) => (
                      <div
                        key={character.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => handleCharacterClick(character)}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage 
                            src={character.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`}
                            alt={character.name}
                          />
                          <AvatarFallback>{character.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{character.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {character.currentStatus.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

              {/* Place Markers */}
              {filteredPlaces.map((place) => (
                <Marker
                  key={place.id}
                  longitude={place.lng}
                  latitude={place.lat}
                  anchor="bottom"
                  onClick={() => handlePlaceClick(place)}
                >
                  <div className="text-2xl cursor-pointer hover:scale-110 transition-transform">
                    {placeTypeIcons[place.placeType] || '📍'}
                  </div>
                </Marker>
              ))}

              {/* Character Markers */}
              {showCharacters && characters.map((character) => (
                <Marker
                  key={character.id}
                  longitude={character.lng}
                  latitude={character.lat}
                  anchor="center"
                  onClick={() => handleCharacterClick(character)}
                >
                  <div className="cursor-pointer hover:scale-110 transition-transform">
                    <img
                      src={character.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`}
                      alt={character.name}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                    />
                  </div>
                </Marker>
              ))}

              {/* Place Popup */}
              {selectedPlace && (
                <Popup
                  longitude={selectedPlace.lng}
                  latitude={selectedPlace.lat}
                  anchor="bottom"
                  onClose={() => setSelectedPlace(null)}
                  closeButton={true}
                >
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold">{selectedPlace.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {placeTypeIcons[selectedPlace.placeType]} {selectedPlace.placeType.toLowerCase()}
                    </p>
                    {selectedPlace.rating && (
                      <p className="text-sm">⭐ {selectedPlace.rating}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Link href={`/places/${selectedPlace.id}`}>
                        <Button size="sm" className="bg-[#e59a3d]">Details</Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.flyTo({
                              center: [selectedPlace.lng, selectedPlace.lat],
                              zoom: 18,
                              duration: 1000
                            });
                          }
                        }}
                      >
                        <Navigation className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Popup>
              )}

              {/* Character Popup */}
              {selectedCharacter && (
                <Popup
                  longitude={selectedCharacter.lng}
                  latitude={selectedCharacter.lat}
                  anchor="bottom"
                  onClose={() => setSelectedCharacter(null)}
                  closeButton={true}
                >
                  <div className="p-2 min-w-[150px]">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={selectedCharacter.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCharacter.id}`}
                        alt={selectedCharacter.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">{selectedCharacter.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {selectedCharacter.currentStatus.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <Link href={`/characters/${selectedCharacter.id}`}>
                      <Button size="sm" className="w-full bg-[#e59a3d]">View Profile</Button>
                    </Link>
                  </div>
                </Popup>
              )}
            </Map>

            {/* Mobile Filter Button */}
            <div className="absolute top-4 left-4 lg:hidden">
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-[#e59a3d] animate-bounce" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  );
}
