'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Footprints, 
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
import { useTown } from '@/lib/town-context';

interface ActivityTimelineProps {
  characterId?: string;
  limit?: number;
}

const activityTypeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
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

function getActivityType(activity: string): string {
  const lower = activity.toLowerCase();
  if (lower.includes('起床') || lower.includes('wake')) return 'wake';
  if (lower.includes('睡') || lower.includes('sleep')) return 'sleep';
  if (lower.includes('家') || lower.includes('home')) return 'home';
  if (lower.includes('工作') || lower.includes('work') || lower.includes('office')) return 'work';
  if (lower.includes('吃饭') || lower.includes('meal') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast')) return 'meal';
  if (lower.includes('购物') || lower.includes('shop') || lower.includes('store')) return 'shopping';
  if (lower.includes('社交') || lower.includes('social') || lower.includes('meet')) return 'social';
  if (lower.includes('运动') || lower.includes('exercise') || lower.includes('gym') || lower.includes('run')) return 'exercise';
  if (lower.includes('移动') || lower.includes('travel') || lower.includes('go to')) return 'travel';
  return 'leisure';
}

export function ActivityTimeline({ characterId, limit }: ActivityTimelineProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { characters, routines, places, currentTime } = useTown();

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const activities = routines
    .filter(r => !characterId || r.characterId === characterId)
    .map(r => {
      const character = characters.find(c => c.id === r.characterId);
      const toPlace = places.find(p => p.id === r.toPlaceId);
      const fromMinutes = parseInt(r.fromTime.split(':')[0]) * 60 + parseInt(r.fromTime.split(':')[1]);
      const toMinutes = parseInt(r.toTime.split(':')[0]) * 60 + parseInt(r.toTime.split(':')[1]);
      const isActive = currentMinutes >= fromMinutes && currentMinutes < toMinutes;
      return {
        id: r.id,
        characterId: r.characterId,
        characterName: character?.name || 'Unknown',
        characterAvatar: character?.avatar || '',
        activity: r.activity,
        locationName: toPlace?.name || 'Unknown',
        fromTime: r.fromTime,
        toTime: r.toTime,
        isActive,
        type: getActivityType(r.activity),
      };
    });

  let filteredActivities = activities;

  if (filter !== 'all') {
    filteredActivities = filteredActivities.filter(a => a.type === filter);
  }

  if (searchQuery) {
    filteredActivities = filteredActivities.filter(a => 
      a.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.locationName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  filteredActivities = filteredActivities.sort((a, b) => a.fromTime.localeCompare(b.fromTime));

  const displayActivities = limit ? filteredActivities.slice(0, limit) : filteredActivities;

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

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {displayActivities.map((entry, index) => {
              const config = activityTypeConfig[entry.type] || activityTypeConfig['leisure'];

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-4 hover:shadow-md transition-shadow ${entry.isActive ? 'ring-2 ring-[#e59a3d]' : ''}`}>
                    <div className="flex gap-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                        ${config.color}
                      `}>
                        {config.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {entry.characterAvatar ? (
                              <img 
                                src={entry.characterAvatar} 
                                alt={entry.characterName}
                                className="w-6 h-6 rounded-full border border-gray-200"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200" />
                            )}
                            <p className="font-medium text-sm text-foreground">
                              {entry.characterName}
                            </p>
                            {entry.isActive && (
                              <Badge className="bg-[#e59a3d] text-xs">进行中</Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {entry.fromTime} - {entry.toTime}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.activity}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-2 py-0.5"
                          >
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {entry.locationName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {displayActivities.length === 0 && (
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
