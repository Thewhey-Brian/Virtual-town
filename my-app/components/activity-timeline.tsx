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
  Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Agent } from '@/lib/types';
import { mockActivities, agents, getAgentById, getLocationById } from '@/lib/data';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ActivityTimelineProps {
  agentId?: string;
  limit?: number;
}

export function ActivityTimeline({ agentId, limit }: ActivityTimelineProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  let activities = agentId 
    ? mockActivities.filter(a => a.agentId === agentId)
    : mockActivities;

  // Apply type filter
  if (filter !== 'all') {
    activities = activities.filter(a => a.type === filter);
  }

  // Apply search filter
  if (searchQuery) {
    activities = activities.filter(a => 
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLocationById(a.location)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort by timestamp (newest first)
  activities = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (limit) {
    activities = activities.slice(0, limit);
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'move': return <Footprints className="w-4 h-4" />;
      case 'talk': return <MessageCircle className="w-4 h-4" />;
      case 'eat': return <Utensils className="w-4 h-4" />;
      case 'shop': return <ShoppingBag className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      case 'sleep': return <Moon className="w-4 h-4" />;
      case 'leisure': return <Sparkles className="w-4 h-4" />;
      default: return <Footprints className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'move': return 'bg-blue-100 text-blue-600';
      case 'talk': return 'bg-green-100 text-green-600';
      case 'eat': return 'bg-orange-100 text-orange-600';
      case 'shop': return 'bg-pink-100 text-pink-600';
      case 'work': return 'bg-violet-100 text-violet-600';
      case 'sleep': return 'bg-indigo-100 text-indigo-600';
      case 'leisure': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getActivityLabel = (type: Activity['type']) => {
    switch (type) {
      case 'move': return '移动';
      case 'talk': return '对话';
      case 'eat': return '用餐';
      case 'shop': return '购物';
      case 'work': return '工作';
      case 'sleep': return '休息';
      case 'leisure': return '休闲';
      default: return '其他';
    }
  };

  const filters = [
    { value: 'all', label: '全部' },
    { value: 'move', label: '移动' },
    { value: 'talk', label: '对话' },
    { value: 'eat', label: '用餐' },
    { value: 'shop', label: '购物' },
    { value: 'work', label: '工作' },
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
            {activities.map((activity, index) => {
              const agent = getAgentById(activity.agentId);
              const location = getLocationById(activity.location);

              return (
                <motion.div
                  key={activity.id}
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
                        ${getActivityColor(activity.type)}
                      `}>
                        {getActivityIcon(activity.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {agent?.name || '未知居民'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {activity.description}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {format(activity.timestamp, 'HH:mm')}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-2 py-0.5"
                          >
                            {getActivityLabel(activity.type)}
                          </Badge>
                          {location && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <span>{location.icon}</span>
                              {location.name}
                            </span>
                          )}
                        </div>

                        {/* Related agents */}
                        {activity.relatedAgents && activity.relatedAgents.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">相关:</span>
                            <div className="flex -space-x-1">
                              {activity.relatedAgents.map(relatedId => {
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
