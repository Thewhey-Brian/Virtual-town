'use client';

import { motion } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Agent, Location } from '@/lib/types';
import { getLocationById } from '@/lib/data';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
  compact?: boolean;
}

export function AgentCard({ agent, onClick, compact = false }: AgentCardProps) {
  const location = getLocationById(agent.currentLocation);
  
  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    sleeping: 'bg-gray-400'
  };

  const statusLabels = {
    active: '活跃',
    idle: '休息',
    sleeping: '睡眠'
  };

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="cursor-pointer"
      >
        <Card className="p-3 flex items-center gap-3 glass card-hover">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-[#e59a3d]/30">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>{agent.name[0]}</AvatarFallback>
            </Avatar>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${statusColors[agent.status]}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">{agent.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{agent.occupation}</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden glass card-hover">
        {/* Header with gradient */}
        <div className="h-24 bg-gradient-to-br from-[#f9e8d0] to-[#f4d4a7] relative">
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="absolute -bottom-8 left-4">
            <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="text-lg font-bold bg-[#e59a3d] text-white">
                {agent.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute top-3 right-3">
            <Badge 
              variant="secondary" 
              className={`${statusColors[agent.status]} text-white border-0 text-xs`}
            >
              {statusLabels[agent.status]}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 pb-4 px-4">
          <h3 className="font-bold text-lg text-foreground">{agent.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">{agent.occupation}</p>
          
          <p className="text-sm text-foreground/80 line-clamp-2 mb-4 leading-relaxed">
            {agent.bio}
          </p>

          {/* Location */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <MapPin className="w-3.5 h-3.5 text-[#e59a3d]" />
            <span>{location?.name || '未知位置'}</span>
          </div>

          {/* Stats - Four Dimensions */}
          <div className="grid grid-cols-4 gap-2">
            <DimensionBadge icon="👔" label="衣" value={agent.stats.clothing} />
            <DimensionBadge icon="🍽️" label="食" value={agent.stats.food} />
            <DimensionBadge icon="🏠" label="住" value={agent.stats.housing} />
            <DimensionBadge icon="🚶" label="行" value={agent.stats.transport} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function DimensionBadge({ icon, label, value }: { icon: string; label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 90) return 'text-green-600 bg-green-50';
    if (v >= 70) return 'text-[#d97f28] bg-[#fdf6ed]';
    if (v >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-500 bg-red-50';
  };

  return (
    <div className={`flex flex-col items-center p-2 rounded-lg ${getColor(value)}`}>
      <span className="text-lg mb-0.5">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}

export function AgentAvatar({ agent, size = 'md', showStatus = true }: { 
  agent: Agent; 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    sleeping: 'bg-gray-400'
  };

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} border-2 border-[#e59a3d]/30`}>
        <AvatarImage src={agent.avatar} alt={agent.name} />
        <AvatarFallback className="bg-[#e59a3d] text-white font-bold">
          {agent.name[0]}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <motion.span 
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${statusColors[agent.status]}`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}
