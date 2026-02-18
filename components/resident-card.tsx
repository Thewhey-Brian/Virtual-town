'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Activity,
  Navigation,
  Home,
  Briefcase,
  Utensils,
  Users,
  ShoppingBag,
  Moon,
  Sun,
  Dumbbell,
  Sparkles,
  ChevronRight,
  Target
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSimulation, ScheduleAction, Agent } from '@/lib/simulation-context';
import { getLocationById } from '@/lib/data';

const actionTypeIcons: Record<ScheduleAction['type'], React.ReactNode> = {
  wake: <Sun className="w-4 h-4" />,
  sleep: <Moon className="w-4 h-4" />,
  home: <Home className="w-4 h-4" />,
  travel: <Navigation className="w-4 h-4" />,
  work: <Briefcase className="w-4 h-4" />,
  meal: <Utensils className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  social: <Users className="w-4 h-4" />,
  exercise: <Dumbbell className="w-4 h-4" />,
  leisure: <Sparkles className="w-4 h-4" />,
};

const actionTypeColors: Record<ScheduleAction['type'], string> = {
  wake: 'bg-orange-500',
  sleep: 'bg-indigo-500',
  home: 'bg-rose-500',
  travel: 'bg-blue-500',
  work: 'bg-violet-500',
  meal: 'bg-orange-500',
  shopping: 'bg-pink-500',
  social: 'bg-green-500',
  exercise: 'bg-emerald-500',
  leisure: 'bg-yellow-500',
};

const actionTypeLabels: Record<ScheduleAction['type'], string> = {
  wake: '起床',
  sleep: '睡觉',
  home: '在家',
  travel: '移动中',
  work: '工作中',
  meal: '用餐',
  shopping: '购物',
  social: '社交',
  exercise: '运动',
  leisure: '休闲',
};

interface ResidentCardProps {
  agent: Agent;
  onFollow?: () => void;
  isFollowing?: boolean;
}

export function ResidentCard({ agent, onFollow, isFollowing }: ResidentCardProps) {
  const { getAgentState, currentTime } = useSimulation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const state = getAgentState(agent.id);
  
  const { currentAction, isTraveling, journeyProgress, currentLocation } = (state as any) || {};
  const location = getLocationById(agent.currentLocation || '');
  
  // Calculate stats with animation
  const stats = [
    { label: '衣', value: (agent as any).stats?.clothing || 80, icon: '👔', color: 'bg-blue-500' },
    { label: '食', value: (agent as any).stats?.food || 80, icon: '🍽️', color: 'bg-orange-500' },
    { label: '住', value: (agent as any).stats?.housing || 80, icon: '🏠', color: 'bg-rose-500' },
    { label: '行', value: (agent as any).stats?.transport || 80, icon: '🚶', color: 'bg-green-500' },
  ];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`
        relative rounded-2xl overflow-hidden cursor-pointer
        ${isFollowing ? 'ring-2 ring-[#e59a3d] ring-offset-2' : ''}
      `}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Header with gradient */}
        <div className={`
          relative h-24 bg-gradient-to-br
          ${agent.id === 'agent-1' ? 'from-orange-400 to-amber-500' :
            agent.id === 'agent-2' ? 'from-blue-400 to-indigo-500' :
            agent.id === 'agent-3' ? 'from-pink-400 to-rose-500' :
            agent.id === 'agent-4' ? 'from-violet-400 to-purple-500' :
            'from-emerald-400 to-teal-500'}
        `}>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <pattern id={`pattern-${agent.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#pattern-${agent.id})`} />
            </svg>
          </div>
          
          {/* Avatar */}
          <div className="absolute -bottom-8 left-4">
            <motion.div 
              className="relative"
              animate={isTraveling ? { 
                x: [0, 5, 0],
                transition: { duration: 0.5, repeat: Infinity }
              } : {}}
            >
              <img 
                src={agent.avatar} 
                alt={agent.name}
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-white"
              />
              {/* Status indicator */}
              <motion.div 
                className={`
                  absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white
                  ${currentAction ? actionTypeColors[currentAction.type] : 'bg-gray-400'}
                `}
                animate={isTraveling ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-full h-full flex items-center justify-center text-white">
                  {currentAction && actionTypeIcons[currentAction.type]}
                </div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Follow button */}
          {onFollow && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFollow();
              }}
              className={`
                absolute top-3 right-3 text-xs
                ${isFollowing 
                  ? 'bg-[#e59a3d] text-white hover:bg-[#d4892c]' 
                  : 'bg-white/90 hover:bg-white'
                }
              `}
            >
              <Target className="w-3 h-3 mr-1" />
              {isFollowing ? '跟随中' : '跟随'}
            </Button>
          )}
        </div>
        
        {/* Content */}
        <div className="pt-10 pb-4 px-4">
          {/* Name & Occupation */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{agent.name}</h3>
              <p className="text-sm text-gray-500">{agent.occupation}</p>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
          
          {/* Current Activity */}
          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[#e59a3d]" />
              <span className="text-xs font-medium text-gray-500">当前活动</span>
            </div>
            
            {currentAction ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${actionTypeColors[currentAction.type]} text-white border-0 text-xs`}>
                    {actionTypeLabels[currentAction.type]}
                  </Badge>
                  <span className="text-sm font-medium text-gray-800">
                    {currentLocation.name}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {currentAction.description}
                </p>
                
                {/* Journey progress */}
                {isTraveling && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                      <span>移动进度</span>
                      <span>{Math.round(journeyProgress * 100)}%</span>
                    </div>
                    <Progress value={journeyProgress * 100} className="h-1.5" />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">暂无活动</p>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-2 bg-gray-50 rounded-lg">
                <span className="text-lg">{stat.icon}</span>
                <div className="text-[10px] text-gray-500 mt-0.5">{stat.label}</div>
                <div className={`text-xs font-bold ${stat.value >= 80 ? 'text-green-600' : stat.value >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
          
          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                  {/* Bio */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">个人简介</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{agent.bio}</p>
                  </div>
                  
                  {/* Personality */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">性格特点</h4>
                    <div className="flex flex-wrap gap-1">
                      {((agent as any).personality || '友好、善良').split('、').map((trait: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Routine */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">日常作息</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>起床时间</span>
                        <span className="font-medium">{agent.routine?.wakeUp || '07:00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>睡觉时间</span>
                        <span className="font-medium">{agent.routine?.sleep || '23:00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>工作时间</span>
                        <span className="font-medium">{agent.routine?.workHours || '09:00-18:00'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preferences */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">兴趣爱好</h4>
                    <div className="flex flex-wrap gap-1">
                      {(agent.routine?.preferences || ['阅读', '音乐']).map((pref, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#fdf6ed] text-[#e59a3d] rounded-full text-[10px]">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

// Compact card for lists
export function ResidentCardCompact({ agent, onClick }: { agent: Agent; onClick?: () => void }) {
  const { getAgentState } = useSimulation();
  const state = getAgentState(agent.id);
  
  if (!state) return null;
  
  const { currentAction, isTraveling } = state;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
        <div className="relative">
          <img 
            src={agent.avatar} 
            alt={agent.name}
            className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
          />
          {isTraveling && (
            <motion.div 
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Navigation className="w-2 h-2 text-white" />
            </motion.div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900">{agent.name}</h4>
          <p className="text-xs text-gray-500 truncate">{agent.occupation}</p>
          {currentAction && (
            <div className="flex items-center gap-1 mt-1">
              <span className={actionTypeColors[currentAction.type].replace('bg-', 'text-').replace('500', '600')}>
                {actionTypeIcons[currentAction.type]}
              </span>
              <span className="text-[10px] text-gray-500 truncate">
                {actionTypeLabels[currentAction.type]}
              </span>
            </div>
          )}
        </div>
        
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </Card>
    </motion.div>
  );
}
