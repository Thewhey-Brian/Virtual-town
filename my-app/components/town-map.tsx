'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Clock, Star, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Agent, Location } from '@/lib/types';
import { locations, agents, getLocationById } from '@/lib/data';
import { AgentAvatar } from './agent-card';

interface TownMapProps {
  onLocationClick?: (location: Location) => void;
  selectedAgentId?: string;
}

export function TownMap({ onLocationClick, selectedAgentId }: TownMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const getAgentsAtLocation = (locationId: string) => {
    return agents.filter(agent => agent.currentLocation === locationId);
  };

  const getLocationColor = (type: Location['type']) => {
    const colors = {
      home: 'bg-rose-400',
      cafe: 'bg-amber-600',
      restaurant: 'bg-orange-500',
      shop: 'bg-pink-500',
      park: 'bg-emerald-500',
      library: 'bg-blue-500',
      work: 'bg-violet-500',
      transport: 'bg-slate-500'
    };
    return colors[type] || 'bg-gray-400';
  };

  const getLocationTypeLabel = (type: Location['type']) => {
    const labels = {
      home: '住宅',
      cafe: '咖啡馆',
      restaurant: '餐厅',
      shop: '商店',
      park: '公园',
      library: '图书馆',
      work: '工作',
      transport: '交通'
    };
    return labels[type] || '其他';
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0] rounded-2xl overflow-hidden shadow-inner">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e59a3d" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Roads */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {/* Main roads */}
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#d4c4b0" strokeWidth="8" strokeDasharray="10,5" opacity="0.5" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#d4c4b0" strokeWidth="8" strokeDasharray="10,5" opacity="0.5" />
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#e0d0c0" strokeWidth="4" strokeDasharray="8,4" opacity="0.4" />
        <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#e0d0c0" strokeWidth="4" strokeDasharray="8,4" opacity="0.4" />
        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#e0d0c0" strokeWidth="4" strokeDasharray="8,4" opacity="0.4" />
        <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#e0d0c0" strokeWidth="4" strokeDasharray="8,4" opacity="0.4" />
      </svg>

      {/* Locations */}
      <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 2 }}>
        {locations.map((location) => {
          const agentsHere = getAgentsAtLocation(location.id);
          const isSelected = selectedLocation?.id === location.id;
          const isHovered = hoveredLocation === location.id;
          const hasSelectedAgent = selectedAgentId && agentsHere.some(a => a.id === selectedAgentId);

          return (
            <motion.div
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              onClick={() => {
                setSelectedLocation(location);
                onLocationClick?.(location);
              }}
              onMouseEnter={() => setHoveredLocation(location.id)}
              onMouseLeave={() => setHoveredLocation(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`
                relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg
                ${getLocationColor(location.type)}
                ${isSelected ? 'ring-4 ring-[#e59a3d] ring-opacity-50' : ''}
                ${hasSelectedAgent ? 'animate-pulse-soft' : ''}
              `}>
                <span className="text-xl">{location.icon}</span>
                
                {/* Agent indicators */}
                {agentsHere.length > 0 && (
                  <div className="absolute -top-1 -right-1 flex -space-x-1.5">
                    {agentsHere.slice(0, 3).map((agent, i) => (
                      <div
                        key={agent.id}
                        className="w-5 h-5 rounded-full border-2 border-white overflow-hidden"
                        style={{ zIndex: 3 - i }}
                      >
                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {agentsHere.length > 3 && (
                      <div className="w-5 h-5 rounded-full bg-[#e59a3d] text-white text-[10px] flex items-center justify-center border-2 border-white font-bold">
                        +{agentsHere.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Hover tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
                    >
                      <div className="glass px-3 py-1.5 rounded-lg text-sm font-medium">
                        {location.name}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Location Details Panel */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-4 right-4 bottom-4 w-80 z-10"
          >
            <Card className="h-full glass overflow-hidden flex flex-col">
              {/* Header */}
              <div className="relative h-32 bg-gradient-to-br from-[#f9e8d0] to-[#f4d4a7]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full bg-white/50 hover:bg-white"
                  onClick={() => setSelectedLocation(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-4 left-4">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl">
                    {selectedLocation.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <Badge className={`${getLocationColor(selectedLocation.type)} text-white border-0 mb-2`}>
                  {getLocationTypeLabel(selectedLocation.type)}
                </Badge>
                <h3 className="text-xl font-bold text-foreground mb-2">{selectedLocation.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{selectedLocation.description}</p>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {selectedLocation.hours && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-[#e59a3d]" />
                      <span>营业时间: {selectedLocation.hours}</span>
                    </div>
                  )}
                  {selectedLocation.rating && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>评分: {selectedLocation.rating}/5.0</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Agents Here */}
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#e59a3d]" />
                    当前在此的居民
                  </h4>
                  {getAgentsAtLocation(selectedLocation.id).length > 0 ? (
                    <div className="space-y-2">
                      {getAgentsAtLocation(selectedLocation.id).map(agent => (
                        <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#fdf6ed]">
                          <AgentAvatar agent={agent} size="sm" showStatus={false} />
                          <div>
                            <p className="font-medium text-sm">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.occupation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">暂时没有居民在这里</p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-xl p-3 z-10">
        <h4 className="text-xs font-semibold text-foreground mb-2">图例</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {[
            { type: 'home', icon: '🏠', label: '住宅' },
            { type: 'cafe', icon: '☕', label: '咖啡馆' },
            { type: 'restaurant', icon: '🍜', label: '餐厅' },
            { type: 'shop', icon: '👗', label: '商店' },
            { type: 'park', icon: '🌳', label: '公园' },
            { type: 'library', icon: '📚', label: '图书馆' },
          ].map(item => (
            <div key={item.type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
