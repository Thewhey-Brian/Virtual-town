'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Heart, 
  BookOpen,
  Brain,
  Search,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Memory } from '@/lib/types';
import { mockMemories, getAgentById } from '@/lib/data';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface MemoryViewerProps {
  agentId?: string;
}

export function MemoryViewer({ agentId }: MemoryViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  let memories = agentId
    ? mockMemories.filter(m => m.agentId === agentId)
    : mockMemories;

  if (activeCategory !== 'all') {
    memories = memories.filter(m => m.category === activeCategory);
  }

  if (searchQuery) {
    memories = memories.filter(m => 
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  memories = memories.sort((a, b) => b.date.getTime() - a.date.getTime());

  const getCategoryIcon = (category: Memory['category']) => {
    switch (category) {
      case 'people': return <Users className="w-4 h-4" />;
      case 'places': return <MapPin className="w-4 h-4" />;
      case 'events': return <Calendar className="w-4 h-4" />;
      case 'preferences': return <Heart className="w-4 h-4" />;
      case 'daily': return <BookOpen className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Memory['category']) => {
    switch (category) {
      case 'people': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'places': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'events': return 'bg-violet-100 text-violet-600 border-violet-200';
      case 'preferences': return 'bg-pink-100 text-pink-600 border-pink-200';
      case 'daily': return 'bg-amber-100 text-amber-600 border-amber-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getCategoryLabel = (category: Memory['category']) => {
    switch (category) {
      case 'people': return '人物';
      case 'places': return '地点';
      case 'events': return '事件';
      case 'preferences': return '喜好';
      case 'daily': return '日常';
      default: return '其他';
    }
  };

  const categories = [
    { value: 'all', label: '全部', icon: Brain },
    { value: 'people', label: '人物', icon: Users },
    { value: 'places', label: '地点', icon: MapPin },
    { value: 'events', label: '事件', icon: Calendar },
    { value: 'preferences', label: '喜好', icon: Heart },
    { value: 'daily', label: '日常', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索记忆..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white/50"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full flex-wrap h-auto bg-[#fdf6ed] p-1">
          {categories.map(cat => (
            <TabsTrigger 
              key={cat.value} 
              value={cat.value}
              className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <cat.icon className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          <ScrollArea className="h-[350px] pr-4">
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {memories.map((memory, index) => {
                  const agent = getAgentById(memory.agentId);

                  return (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card className="p-4 hover:shadow-md transition-all group">
                        <div className="flex items-start gap-3">
                          {/* Category Icon */}
                          <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                            border ${getCategoryColor(memory.category)}
                          `}>
                            {getCategoryIcon(memory.category)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] ${getCategoryColor(memory.category)}`}
                              >
                                {getCategoryLabel(memory.category)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(memory.date, 'MM月dd日', { locale: zhCN })}
                              </span>
                            </div>

                            <p className="text-sm text-foreground leading-relaxed">
                              {memory.content}
                            </p>

                            {/* Importance indicator */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1.5 bg-[#f0e0cc] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${memory.importance * 10}%` }}
                                  transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                                  className={`h-full rounded-full ${
                                    memory.importance >= 8 ? 'bg-[#e59a3d]' :
                                    memory.importance >= 5 ? 'bg-[#d4a574]' :
                                    'bg-[#c4b5a0]'
                                  }`}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground w-8 text-right">
                                {memory.importance}/10
                              </span>
                            </div>
                          </div>

                          {/* Agent avatar */}
                          {!agentId && agent && (
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                <img
                                  src={agent.avatar}
                                  alt={agent.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {memories.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fdf6ed] flex items-center justify-center">
                    <Brain className="w-8 h-8 text-[#e59a3d]" />
                  </div>
                  <p className="text-muted-foreground">暂无记忆记录</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
