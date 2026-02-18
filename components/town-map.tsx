'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Clock, Star, User, Navigation, Home, Coffee, ShoppingBag, BookOpen, TreePine, Train, Sun, Moon, Cloud, CloudRain, CloudFog } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Agent, Location } from '@/lib/types';
import { locations, agents, getLocationById } from '@/lib/data';
import { useSimulation, TimeOfDay, WeatherType } from '@/lib/simulation-context';
import { JourneyVisualization } from '@/components/journey-visualization';

interface TownMapProps {
  onLocationClick?: (location: Location) => void;
  selectedAgentId?: string;
}

// Weather effects overlay
function WeatherOverlay({ weather, timeOfDay }: { weather: WeatherType; timeOfDay: TimeOfDay }) {
  const getOverlayOpacity = () => {
    if (timeOfDay === 'night') return 0.6;
    if (timeOfDay === 'evening') return 0.3;
    if (timeOfDay === 'dawn') return 0.4;
    return 0.2;
  };
  
  return (
    <>
      {/* Base time of day overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-30 transition-all duration-1000"
        style={{
          background: timeOfDay === 'night' 
            ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.5), rgba(30, 27, 75, 0.3))'
            : timeOfDay === 'evening'
            ? 'linear-gradient(to bottom, rgba(251, 146, 60, 0.2), rgba(192, 132, 252, 0.1))'
            : timeOfDay === 'dawn'
            ? 'linear-gradient(to bottom, rgba(251, 146, 60, 0.3), rgba(147, 197, 253, 0.2))'
            : 'transparent',
          opacity: getOverlayOpacity(),
        }}
      />
      
      {/* Rain effect */}
      {weather === 'rainy' && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-8 bg-blue-400/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: -20,
              }}
              animate={{
                y: ['0%', '120%'],
              }}
              transition={{
                duration: 0.8 + Math.random() * 0.4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}
      
      {/* Fog effect */}
      {weather === 'foggy' && (
        <div className="absolute inset-0 pointer-events-none z-30">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-gray-100/40 via-transparent to-gray-100/40"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      )}
    </>
  );
}

// Time of day indicator
function TimeOfDayIndicator({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const icons: Record<TimeOfDay, React.ReactNode> = {
    dawn: <Sun className="w-5 h-5 text-orange-400" />,
    morning: <Sun className="w-5 h-5 text-yellow-400" />,
    noon: <Sun className="w-5 h-5 text-yellow-500" />,
    afternoon: <Sun className="w-5 h-5 text-orange-400" />,
    evening: <Sun className="w-5 h-5 text-orange-500" />,
    night: <Moon className="w-5 h-5 text-blue-300" />,
  };
  
  const labels: Record<TimeOfDay, string> = {
    dawn: '黎明',
    morning: '上午',
    noon: '中午',
    afternoon: '下午',
    evening: '傍晚',
    night: '夜晚',
  };
  
  return (
    <div className="absolute top-4 left-4 z-40 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-gray-100 flex items-center gap-2">
      {icons[timeOfDay]}
      <span className="text-sm font-medium text-gray-700">{labels[timeOfDay]}</span>
    </div>
  );
}

// Building icons
const BuildingIcon = ({ type, isSelected, isHovered }: { type: Location['type']; isSelected: boolean; isHovered: boolean }) => {
  const getStyles = () => {
    switch (type) {
      case 'home': return { bg: 'bg-rose-100', icon: '🏠' };
      case 'cafe': return { bg: 'bg-amber-100', icon: '☕' };
      case 'restaurant': return { bg: 'bg-orange-100', icon: '🍽️' };
      case 'shop': return { bg: 'bg-pink-100', icon: '🛍️' };
      case 'park': return { bg: 'bg-emerald-100', icon: '🌳' };
      case 'library': return { bg: 'bg-blue-100', icon: '📚' };
      case 'work': return { bg: 'bg-violet-100', icon: '🏢' };
      case 'transport': return { bg: 'bg-slate-100', icon: '🚆' };
      default: return { bg: 'bg-gray-100', icon: '📍' };
    }
  };

  const style = getStyles();

  return (
    <motion.div
      className={`
        relative w-12 h-12 rounded-xl flex items-center justify-center
        ${style.bg} border-2 border-white/50
        ${isSelected ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
        ${isHovered ? 'shadow-xl scale-110' : 'shadow-md'}
        transition-all duration-200
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-2xl">{style.icon}</span>
      {isSelected && (
        <motion.div
          layoutId="selection-indicator"
          className="absolute -inset-1 border-2 border-yellow-400 rounded-xl"
        />
      )}
    </motion.div>
  );
};

// Agent marker on map
const AgentMarker = ({ 
  agent, 
  position, 
  isTraveling, 
  isFollowed 
}: { 
  agent: Agent; 
  position: { x: number; y: number };
  isTraveling?: boolean;
  isFollowed?: boolean;
}) => {
  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      animate={isTraveling ? {
        y: [0, -3, 0],
        transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
      } : {}}
    >
      {isFollowed && (
        <motion.div
          className="absolute inset-0 -m-3 rounded-full border-2 border-[#e59a3d]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.4, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/20 rounded-full blur-sm" />
      
      <motion.div className="relative" whileHover={{ scale: 1.15 }}>
        {isTraveling && (
          <motion.div
            className="absolute inset-0 -m-2 rounded-full bg-blue-400/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        
        <img 
          src={agent.avatar} 
          alt={agent.name}
          className={`
            w-10 h-10 rounded-full border-3 shadow-lg object-cover bg-white
            ${isFollowed ? 'border-[#e59a3d] ring-2 ring-[#e59a3d]/30' : 'border-white'}
            ${isTraveling ? 'border-blue-400' : ''}
          `}
        />
        
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        
        {isTraveling && (
          <motion.div 
            className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Navigation className="w-2 h-2 text-white" />
          </motion.div>
        )}
      </motion.div>
      
      <motion.div 
        className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className={`
          px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm
          ${isFollowed ? 'bg-[#e59a3d] text-white' : 'bg-white/95 text-gray-700'}
        `}>
          {agent.name}
        </span>
      </motion.div>
    </motion.div>
  );
};

export function TownMap({ onLocationClick, selectedAgentId }: TownMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showJourneyPaths, setShowJourneyPaths] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  
  const { 
    agentStates, 
    activeJourneys, 
    timeOfDay, 
    weather,
    followedAgentId,
    followAgent,
  } = useSimulation();

  const getAgentPosition = (agentId: string): { x: number; y: number } => {
    const state = agentStates.get(agentId);
    if (!state) {
      const agent = agents.find(a => a.id === agentId);
      const loc = agent ? getLocationById(agent.currentLocation) : locations[0];
      return { x: loc?.x || 50, y: loc?.y || 50 };
    }
    
    if (state.isTraveling && state.journeyFrom && state.journeyTo) {
      const progress = state.journeyProgress;
      return {
        x: state.journeyFrom.x + (state.journeyTo.x - state.journeyFrom.x) * progress,
        y: state.journeyFrom.y + (state.journeyTo.y - state.journeyFrom.y) * progress,
      };
    }
    
    return { x: state.currentLocation.x, y: state.currentLocation.y };
  };

  const getAgentsAtLocation = (locationId: string) => {
    return agents.filter(agent => {
      const state = agentStates.get(agent.id);
      if (!state) return agent.currentLocation === locationId;
      return state.currentLocation.id === locationId && !state.isTraveling;
    });
  };

  const getLocationTypeLabel = (type: Location['type']) => {
    const labels = {
      home: '住宅', cafe: '咖啡馆', restaurant: '餐厅', shop: '商店',
      park: '公园', library: '图书馆', work: '地标/工作', transport: '交通'
    };
    return labels[type] || '其他';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).dataset?.mapBackground) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y };
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setMapOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  }, [isDragging]);

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setMapScale(prev => Math.max(0.5, Math.min(2.5, prev * delta)));
  };

  const resetView = () => {
    setMapScale(1);
    setMapOffset({ x: 0, y: 0 });
  };

  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        setContainerSize({
          width: containerRef.current?.offsetWidth || 800,
          height: containerRef.current?.offsetHeight || 600,
        });
      };
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] bg-[#f5f0e8] rounded-2xl overflow-hidden shadow-inner cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Map Background */}
      <div 
        data-map-background
        className="absolute inset-0"
        style={{
          transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapScale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out'
        }}
      >
        <div className="absolute inset-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-[#e8e0d0] via-[#f0e8d8] to-[#e5ddd0]">
          <svg width="100%" height="100%" opacity="0.03">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)"/>
          </svg>
        </div>

        {/* Roads */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#8a8a8a" strokeWidth="28" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#a0a0a0" strokeWidth="20" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#f0d080" strokeWidth="2" strokeDasharray="10,15" opacity="0.6" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#8a8a8a" strokeWidth="24" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#a0a0a0" strokeWidth="16" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#f0d080" strokeWidth="2" strokeDasharray="10,15" opacity="0.6" />
          <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#9a9a9a" strokeWidth="20" />
          <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#b0b0b0" strokeWidth="14" />
          <text x="52%" y="8%" fill="#666" fontSize="11" fontWeight="600">Brand Blvd</text>
          <text x="3%" y="48%" fill="#666" fontSize="11" fontWeight="600">Broadway</text>
          <text x="3%" y="73%" fill="#666" fontSize="11" fontWeight="600">Colorado Blvd</text>
        </svg>

        {/* Park areas */}
        <div className="absolute top-[8%] left-[3%] w-[22%] h-[28%] bg-emerald-100/40 rounded-3xl border-2 border-emerald-200/50 flex items-center justify-center">
          <span className="text-4xl opacity-30">🌲</span>
        </div>
        <div className="absolute top-[3%] right-[8%] w-[18%] h-[22%] bg-emerald-100/40 rounded-3xl border-2 border-emerald-200/50 flex items-center justify-center">
          <span className="text-4xl opacity-30">🌳</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[6%] bg-gradient-to-t from-blue-300/40 to-blue-200/20 rounded-t-[50px]" />
      </div>

      {/* Weather & Time Effects */}
      <WeatherOverlay weather={weather} timeOfDay={timeOfDay} />
      <TimeOfDayIndicator timeOfDay={timeOfDay} />

      {/* Journey Paths */}
      {showJourneyPaths && (
        <div 
          className="absolute inset-0"
          style={{
            transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapScale})`,
            transformOrigin: 'center center'
          }}
        >
          <JourneyVisualization mapWidth={containerSize.width} mapHeight={containerSize.height} />
        </div>
      )}

      {/* Locations & Agents */}
      <div 
        className="absolute inset-0"
        style={{
          transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapScale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out'
        }}
      >
        {locations.map((location) => {
          const agentsHere = getAgentsAtLocation(location.id);
          const isSelected = selectedLocation?.id === location.id;
          const isHovered = hoveredLocation === location.id;

          return (
            <motion.div
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLocation(location);
                onLocationClick?.(location);
              }}
              onMouseEnter={() => setHoveredLocation(location.id)}
              onMouseLeave={() => setHoveredLocation(null)}
            >
              <BuildingIcon type={location.type} isSelected={isSelected} isHovered={isHovered} />
              
              {agentsHere.length > 0 && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex -space-x-2">
                  {agentsHere.slice(0, 3).map((agent, i) => (
                    <motion.img 
                      key={agent.id}
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ zIndex: 15 - i }}
                      whileHover={{ scale: 1.2, zIndex: 100 }}
                    />
                  ))}
                  {agentsHere.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-[#e59a3d] text-white text-[10px] flex items-center justify-center border-2 border-white font-bold shadow-md">
                      +{agentsHere.length - 3}
                    </div>
                  )}
                </div>
              )}

              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full mb-14 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
                  >
                    <div className="bg-white px-3 py-2 rounded-lg shadow-xl border border-gray-200">
                      <p className="font-bold text-sm text-gray-900">{location.name}</p>
                      <p className="text-xs text-gray-500">{getLocationTypeLabel(location.type)}</p>
                      {agentsHere.length > 0 && (
                        <p className="text-xs text-[#e59a3d] mt-1">{agentsHere.length} 位居民在此</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        
        {agents.map((agent) => {
          const state = agentStates.get(agent.id);
          const position = getAgentPosition(agent.id);
          const isFollowed = followedAgentId === agent.id;
          
          return (
            <AgentMarker
              key={agent.id}
              agent={agent}
              position={position}
              isTraveling={state?.isTraveling}
              isFollowed={isFollowed}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-40">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => setMapScale(prev => Math.min(2.5, prev * 1.2))}
          className="bg-white/95 shadow-lg hover:bg-white w-10 h-10"
        >
          <span className="text-lg">+</span>
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => setMapScale(prev => Math.max(0.5, prev * 0.8))}
          className="bg-white/95 shadow-lg hover:bg-white w-10 h-10"
        >
          <span className="text-lg">−</span>
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={resetView}
          className="bg-white/95 shadow-lg hover:bg-white w-10 h-10"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute bottom-4 right-4 z-40">
        <Button
          variant={showJourneyPaths ? "default" : "secondary"}
          size="sm"
          onClick={() => setShowJourneyPaths(!showJourneyPaths)}
          className={`shadow-lg ${showJourneyPaths ? 'bg-[#e59a3d] hover:bg-[#d4892d]' : 'bg-white/95'}`}
        >
          <Navigation className="w-4 h-4 mr-2" />
          {showJourneyPaths ? '隐藏路线' : '显示路线'}
        </Button>
      </div>

      {/* Location Details Panel */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-4 right-4 bottom-4 w-80 z-40"
          >
            <Card className="h-full bg-white/98 backdrop-blur-sm overflow-hidden flex flex-col shadow-2xl border-0">
              <div className="relative h-28 bg-gradient-to-br from-[#e59a3d] to-[#c67f2a]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
                  onClick={() => setSelectedLocation(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-3 left-4">
                  <div className="w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center text-3xl">
                    {selectedLocation.icon}
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <Badge className="bg-[#e59a3d] text-white border-0 mb-2 text-xs">
                  {getLocationTypeLabel(selectedLocation.type)}
                </Badge>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedLocation.name}</h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{selectedLocation.description}</p>

                <div className="space-y-2 mb-4 bg-gray-50 rounded-lg p-3">
                  {selectedLocation.hours && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-[#e59a3d]" />
                      <span>{selectedLocation.hours}</span>
                    </div>
                  )}
                  {selectedLocation.rating && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{selectedLocation.rating}/5.0</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#e59a3d]" />
                    当前在此的居民 ({getAgentsAtLocation(selectedLocation.id).length})
                  </h4>
                  {getAgentsAtLocation(selectedLocation.id).length > 0 ? (
                    <div className="space-y-2">
                      {getAgentsAtLocation(selectedLocation.id).map(agent => (
                        <div 
                          key={agent.id} 
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-[#fdf6ed] hover:bg-[#f9ecd9] transition-colors cursor-pointer"
                          onClick={() => followAgent(agent.id)}
                        >
                          <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.occupation}</p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic bg-gray-50 rounded-lg p-3">暂时没有居民在这里</p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute top-16 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 z-40 shadow-lg border border-gray-100">
        <h4 className="text-xs font-bold text-gray-900 mb-2">地图图例</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {[
            { icon: '🏠', label: '住宅' },
            { icon: '☕', label: '咖啡馆' },
            { icon: '🍽️', label: '餐厅' },
            { icon: '🛍️', label: '购物' },
            { icon: '🌳', label: '公园' },
            { icon: '📚', label: '图书馆' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">滚轮缩放 • 拖拽移动 • 点击查看</p>
      </div>
    </div>
  );
}
