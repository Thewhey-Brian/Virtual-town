'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Footprints } from 'lucide-react';
import { useSimulation, Journey } from '@/lib/simulation-context';
import { getAgentById } from '@/lib/data';

interface JourneyVisualizationProps {
  mapWidth: number;
  mapHeight: number;
}

// Convert percentage coordinates to pixels
function useCoordinateTransform(mapWidth: number, mapHeight: number) {
  return useMemo(() => ({
    toPixels: (xPercent: number, yPercent: number) => ({
      x: (xPercent / 100) * mapWidth,
      y: (yPercent / 100) * mapHeight,
    }),
  }), [mapWidth, mapHeight]);
}

// Individual journey path
function JourneyPath({ 
  journey, 
  toPixels 
}: { 
  journey: Journey; 
  toPixels: (x: number, y: number) => { x: number; y: number };
}) {
  const agent = getAgentById(journey.agentId);
  const from = toPixels(journey.fromLocation.x, journey.fromLocation.y);
  const to = toPixels(journey.toLocation.x, journey.toLocation.y);
  
  // Calculate control point for curved path
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const offset = 20; // Curve offset
  const controlX = midX + offset;
  const controlY = midY - offset;
  
  // Create quadratic bezier path
  const pathD = `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
  
  // Calculate current position along the curve
  const t = journey.progress;
  const currentX = Math.pow(1-t, 2) * from.x + 2 * (1-t) * t * controlX + Math.pow(t, 2) * to.x;
  const currentY = Math.pow(1-t, 2) * from.y + 2 * (1-t) * t * controlY + Math.pow(t, 2) * to.y;
  
  // Calculate angle for arrow rotation
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
  
  return (
    <g className="journey-path">
      {/* Animated path line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={agent?.id === 'agent-1' ? '#e59a3d' : agent?.id === 'agent-2' ? '#3b82f6' : agent?.id === 'agent-3' ? '#ec4899' : agent?.id === 'agent-4' ? '#8b5cf6' : '#10b981'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.7 }}
        transition={{ duration: 0.5 }}
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-24"
          dur="1s"
          repeatCount="indefinite"
        />
      </motion.path>
      
      {/* Moving agent avatar */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          x: currentX,
          y: currentY,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Glow effect */}
        <circle 
          r="20" 
          fill={agent?.id === 'agent-1' ? '#e59a3d' : agent?.id === 'agent-2' ? '#3b82f6' : agent?.id === 'agent-3' ? '#ec4899' : agent?.id === 'agent-4' ? '#8b5cf6' : '#10b981'}
          opacity="0.2"
        >
          <animate
            attributeName="r"
            values="15;25;15"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.1;0.3"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Avatar circle */}
        <circle r="14" fill="white" stroke={agent?.id === 'agent-1' ? '#e59a3d' : agent?.id === 'agent-2' ? '#3b82f6' : agent?.id === 'agent-3' ? '#ec4899' : agent?.id === 'agent-4' ? '#8b5cf6' : '#10b981'} strokeWidth="3" />
        
        {/* Agent image or initials */}
        {agent ? (
          <>
            <defs>
              <clipPath id={`clip-${journey.id}`}>
                <circle r="11" />
              </clipPath>
            </defs>
            <image
              href={agent.avatar}
              x="-11"
              y="-11"
              width="22"
              height="22"
              clipPath={`url(#clip-${journey.id})`}
            />
          </>
        ) : null}
        
        {/* Direction indicator */}
        <motion.g
          animate={{ rotate: angle }}
          style={{ transformOrigin: '0 0' }}
        >
          <Navigation className="w-3 h-3 text-white" style={{ x: 8, y: -6 }} />
        </motion.g>
      </motion.g>
      
      {/* Start point marker */}
      <circle 
        cx={from.x} 
        cy={from.y} 
        r="4" 
        fill={agent?.id === 'agent-1' ? '#e59a3d' : agent?.id === 'agent-2' ? '#3b82f6' : agent?.id === 'agent-3' ? '#ec4899' : agent?.id === 'agent-4' ? '#8b5cf6' : '#10b981'}
        opacity="0.5"
      />
      
      {/* End point marker */}
      <circle 
        cx={to.x} 
        cy={to.y} 
        r="6" 
        fill="none"
        stroke={agent?.id === 'agent-1' ? '#e59a3d' : agent?.id === 'agent-2' ? '#3b82f6' : agent?.id === 'agent-3' ? '#ec4899' : agent?.id === 'agent-4' ? '#8b5cf6' : '#10b981'}
        strokeWidth="2"
        strokeDasharray="2 2"
      >
        <animate
          attributeName="r"
          values="4;8;4"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}

// Journey legend
function JourneyLegend() {
  const { activeJourneys } = useSimulation();
  
  if (activeJourneys.length === 0) return null;
  
  return (
    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100 max-w-[200px]">
      <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
        <Footprints className="w-3 h-3" />
        正在移动 ({activeJourneys.length})
      </h4>
      <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
        {activeJourneys.map((journey) => {
          const agent = getAgentById(journey.agentId);
          if (!agent) return null;
          
          const progress = Math.round(journey.progress * 100);
          
          return (
            <div key={journey.id} className="flex items-center gap-2 text-xs">
              <img 
                src={agent.avatar} 
                alt={agent.name}
                className="w-5 h-5 rounded-full border border-gray-200"
              />
              <span className="font-medium text-gray-700 truncate">{agent.name}</span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-500 truncate">{journey.toLocation.name}</span>
              <span className="ml-auto text-[10px] text-[#e59a3d]">{progress}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Main journey visualization component
export function JourneyVisualization({ mapWidth, mapHeight }: JourneyVisualizationProps) {
  const { activeJourneys } = useSimulation();
  const { toPixels } = useCoordinateTransform(mapWidth, mapHeight);
  
  return (
    <>
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        preserveAspectRatio="none"
      >
        <AnimatePresence mode="popLayout">
          {activeJourneys.map((journey) => (
            <JourneyPath
              key={journey.id}
              journey={journey}
              toPixels={toPixels}
            />
          ))}
        </AnimatePresence>
      </svg>
      <JourneyLegend />
    </>
  );
}

// Journey details panel
export function JourneyDetailsPanel() {
  const { activeJourneys, agentStates } = useSimulation();
  
  if (activeJourneys.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <Footprints className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">暂时没有居民在移动</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto">
      {activeJourneys.map((journey) => {
        const agent = getAgentById(journey.agentId);
        const state = agentStates.get(journey.agentId);
        if (!agent || !state) return null;
        
        const progress = Math.round(journey.progress * 100);
        const remaining = 100 - progress;
        
        return (
          <motion.div
            key={journey.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <img 
                src={agent.avatar} 
                alt={agent.name}
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-800">{agent.name}</h4>
                <p className="text-xs text-gray-500">{agent.occupation}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[#e59a3d]">{progress}%</div>
                <div className="text-[10px] text-gray-400">已移动</div>
              </div>
            </div>
            
            {/* Journey route */}
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="truncate">{journey.fromLocation.name}</span>
              <motion.div 
                className="flex-1 h-0.5 bg-gray-200 relative overflow-hidden"
                style={{ minWidth: '30px' }}
              >
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-[#e59a3d]"
                  style={{ width: `${progress}%` }}
                />
              </motion.div>
              <MapPin className="w-3 h-3 text-[#e59a3d]" />
              <span className="truncate">{journey.toLocation.name}</span>
            </div>
            
            {/* Current action */}
            {state.currentAction && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                {state.currentAction.description}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
