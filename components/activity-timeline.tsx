'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Footprints, 
  MessageCircle, 
  Utensils, 
  ShoppingBag, 
  Briefcase, 
  Moon,
  Sparkles,
  Filter,
  Search,
  Home,
  Navigation,
  Sun,
  Users,
  Dumbbell
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Agent } from '@/lib/types';
import { useSimulation } from '@/lib/simulation-context';
import { getAgentById, getLocationById } from '@/lib/data';

interface ActivityTimelineProps {
  agentId?: string;
  limit?: number;
}

const actionTypeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  wake: { icon: <Sun className="w-4 h-4" />, color: 'bg-orange-100 text-orange-600', label: '起床' },
  sleep: { icon: <Moon className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-600', label: '睡觉' },
  home: { icon: <Home className="w-4 h-4" />, color: 'bg-rose-100 text-rose-600', label: '在家' },
  travel: { icon: <Navigation className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600', label: '移动' },
  work: { icon: <Briefcase className="w-4 h-4" />, color: 'bg-violet-100 text-violet-600', label: '工作' },
  meal: { icon: <Utensils className="w-4 h-4" />, color: 'bg-orange-100 text-orange-600', label: '用餐' },
  shopping: { icon: <ShoppingBag className="w-4 h-4" />, color: 'bg-pink-100 text-pink-600', label: '购物' },
  social: { icon: <Users className="w-4 h-4" />, color: 'bg-green-100 text-green-600', label: '社交' },
  exercise: { icon: <Dumbbell className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-600', label: '运动' },
  leisure: { icon: <Sparkles className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-600', label: '休闲' },
};

export function ActivityTimeline({ agentId, limit }: ActivityTimelineProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { recentActivities } = useSimulation();

  let activities = agentId 
    ? recentActivities.filter(a => a.agentId === agentId)
    : recentActivities;

  // Apply type filter
  if (filter !== 'all') {
    activities = activities.filter(a => a.action.type === filter);
  }

  // Apply search filter
  if (searchQuery) {
    activities = activities.filter(a => 
      a.action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.locationName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort by timestamp (newest first)
  activities = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (limit) {
    activities = activities.slice(0, limit);
  }

  const filters = [
    { value: 'all', label: '全部' },
    { value: 'travel', label: '移动' },
    { value: 'work', label: '工作' },
    { value: 'meal', label: '用餐' },
    { value: 'social', label: '社交' },
    { value: 'shopping', label: '购物' },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索活动..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.value)}
              className={filter === f.value ? 'bg-[#e59a3d] hover:bg-[#d97f28]' : ''}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {activities.map((entry, index) => {
              const config = actionTypeConfig[entry.action.type] || actionTypeConfig['leisure'];
              const agent = getAgentById(entry.agentId);

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                        ${config.color}
                      `}>
                        {config.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img 
                              src={entry.agentAvatar} 
                              alt={entry.agentName}
                              className="w-6 h-6 rounded-full border border-gray-200"
                            />
                            <p className="font-medium text-sm text-foreground">
                              {entry.agentName}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {entry.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.action.description}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-2 py-0.5"
                          >
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            {getLocationById(entry.action.toLocation)?.icon}
                            {entry.locationName}
                          </span>
                        </div>

                        {/* Involved agents */}
                        {entry.action.involvedAgents.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">一起:</span>
                            <div className="flex -space-x-1">
                              {entry.action.involvedAgents.map(relatedId => {
                                const related = getAgentById(relatedId);
                                return related ? (
                                  <div
                                    key={relatedId}
                                    className="w-5 h-5 rounded-full border border-white overflow-hidden"
                                    title={related.name}
                                  >
                                    <img 
                                      src={related.avatar} 
                                      alt={related.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
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
            })}
          </AnimatePresence>

          {activities.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fdf6ed] flex items-center justify-center">
                <Filter className="w-8 h-8 text-[#e59a3d]" />
              </div>
              <p className="text-muted-foreground">没有找到匹配的活动</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
