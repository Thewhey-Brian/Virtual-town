'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  MessageCircle, 
  Utensils, 
  ShoppingBag, 
  Briefcase, 
  Moon,
  Sun,
  Home,
  Navigation,
  Users,
  Dumbbell,
  Sparkles,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSimulation, ActivityLogEntry } from '@/lib/simulation-context';
import { getLocationById, getAgentById } from '@/lib/data';
import { ScheduleAction } from '@/lib/types';

// Action type icons and colors
const actionTypeConfig: Record<ScheduleAction['type'], { icon: React.ReactNode; color: string; label: string }> = {
  wake: { icon: <Sun className="w-4 h-4" />, color: 'bg-orange-100 text-orange-600', label: '起床' },
  sleep: { icon: <Moon className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-600', label: '睡觉' },
  home: { icon: <Home className="w-4 h-4" />, color: 'bg-rose-100 text-rose-600', label: '在家' },
  travel: { icon: <Navigation className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600', label: '移动中' },
  work: { icon: <Briefcase className="w-4 h-4" />, color: 'bg-violet-100 text-violet-600', label: '工作' },
  meal: { icon: <Utensils className="w-4 h-4" />, color: 'bg-orange-100 text-orange-600', label: '用餐' },
  shopping: { icon: <ShoppingBag className="w-4 h-4" />, color: 'bg-pink-100 text-pink-600', label: '购物' },
  social: { icon: <Users className="w-4 h-4" />, color: 'bg-green-100 text-green-600', label: '社交' },
  exercise: { icon: <Dumbbell className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-600', label: '运动' },
  leisure: { icon: <Sparkles className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-600', label: '休闲' },
};

// Single activity item
function ActivityItem({ entry, isNew }: { entry: ActivityLogEntry; isNew?: boolean }) {
  const config = actionTypeConfig[entry.action.type];
  const location = getLocationById(entry.action.toLocation);
  
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -20, scale: 0.95 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card className={`
        p-3 hover:shadow-md transition-all cursor-pointer group
        ${isNew ? 'border-l-4 border-l-[#e59a3d]' : ''}
      `}>
        <div className="flex gap-3">
          {/* Agent Avatar */}
          <div className="relative flex-shrink-0">
            <img 
              src={entry.agentAvatar} 
              alt={entry.agentName}
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
            {/* Status indicator */}
            <motion.div 
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                entry.action.type === 'travel' ? 'bg-blue-500' : 
                entry.action.type === 'work' ? 'bg-violet-500' : 
                entry.action.type === 'meal' ? 'bg-orange-500' : 'bg-green-500'
              }`}
              animate={entry.action.type === 'travel' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-gray-900">
                  {entry.agentName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {entry.action.description}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 flex-shrink-0">
                {formatRelativeTime(entry.timestamp)}
              </span>
            </div>
            
            {/* Action type & location */}
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={`text-[10px] px-2 py-0.5 flex items-center gap-1 ${config.color}`}
              >
                {config.icon}
                {config.label}
              </Badge>
              
              {location && (
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <span>{location.icon}</span>
                  {location.name}
                </span>
              )}
            </div>
            
            {/* Involved agents */}
            {entry.action.involvedAgents.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-gray-400">一起:</span>
                <div className="flex -space-x-1">
                  {entry.action.involvedAgents.map((agentId) => {
                    const agent = getAgentById(agentId);
                    return agent ? (
                      <img
                        key={agentId}
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-5 h-5 rounded-full border border-white"
                        title={agent.name}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Clock className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">暂无活动</h3>
      <p className="text-xs text-gray-500">居民们的活动将实时显示在这里</p>
    </div>
  );
}

// Filter buttons
const filterOptions: { value: ScheduleAction['type'] | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'travel', label: '移动' },
  { value: 'work', label: '工作' },
  { value: 'meal', label: '用餐' },
  { value: 'social', label: '社交' },
  { value: 'shopping', label: '购物' },
];

// Main Activity Feed component
export function ActivityFeed() {
  const { recentActivities, agentStates, currentTime } = useSimulation();
  const [filter, setFilter] = useState<ScheduleAction['type'] | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevActivitiesLength = useRef(recentActivities.length);
  
  // Filter activities
  const filteredActivities = recentActivities.filter((entry) => {
    if (filter === 'all') return true;
    return entry.action.type === filter;
  });
  
  // Auto-scroll to top when new activities arrive
  useEffect(() => {
    if (autoScroll && recentActivities.length > prevActivitiesLength.current) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevActivitiesLength.current = recentActivities.length;
  }, [recentActivities.length, autoScroll]);
  
  // Group activities by time
  const groupedActivities = filteredActivities.reduce((groups, entry) => {
    const hour = entry.timestamp.getHours();
    const timeKey = `${hour}:00`;
    
    if (!groups[timeKey]) {
      groups[timeKey] = [];
    }
    groups[timeKey].push(entry);
    return groups;
  }, {} as Record<string, ActivityLogEntry[]>);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#e59a3d]" />
          <h3 className="font-bold text-gray-900">实时活动</h3>
          <Badge variant="secondary" className="text-xs">
            {filteredActivities.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs ${autoScroll ? 'text-[#e59a3d]' : 'text-gray-400'}`}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${autoScroll ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            自动滚动
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
              ${filter === option.value
                ? 'bg-[#e59a3d] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      {/* Activities List */}
      <ScrollArea className="flex-1 -mx-2 px-2" ref={scrollRef}>
        <AnimatePresence mode="popLayout">
          {filteredActivities.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((entry, index) => (
                <ActivityItem 
                  key={entry.id} 
                  entry={entry} 
                  isNew={index < 3}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
      
      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-bold text-[#e59a3d]">
              {Array.from(agentStates.values()).filter(s => s.isTraveling).length}
            </div>
            <div className="text-[10px] text-gray-500">移动中</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-bold text-violet-600">
              {Array.from(agentStates.values()).filter(s => s.currentAction?.type === 'work').length}
            </div>
            <div className="text-[10px] text-gray-500">工作中</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-bold text-green-600">
              {Array.from(agentStates.values()).filter(s => s.currentAction?.type === 'social').length}
            </div>
            <div className="text-[10px] text-gray-500">社交中</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for sidebar
export function ActivityFeedCompact() {
  const { recentActivities } = useSimulation();
  
  const recentThree = recentActivities.slice(0, 3);
  
  return (
    <div className="space-y-2">
      {recentThree.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">暂无活动</p>
      ) : (
        recentThree.map((entry) => {
          const config = actionTypeConfig[entry.action.type];
          
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/50 hover:bg-white transition-colors cursor-pointer"
            >
              <img 
                src={entry.agentAvatar} 
                alt={entry.agentName}
                className="w-7 h-7 rounded-full border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">
                  {entry.agentName}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {config.label} · {entry.locationName}
                </p>
              </div>
              <div className={`p-1 rounded ${config.color}`}>
                {config.icon}
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
