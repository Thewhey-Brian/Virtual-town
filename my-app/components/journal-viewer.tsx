'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookHeart, 
  Calendar, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Sun,
  Cloud,
  Moon,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JournalEntry as JournalEntryType } from '@/lib/types';
import { mockJournals, getAgentById } from '@/lib/data';
import { format, startOfDay, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface JournalViewerProps {
  agentId?: string;
}

export function JournalViewer({ agentId }: JournalViewerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2026-02-15'));
  const [isGenerating, setIsGenerating] = useState(false);

  // Get journals for the selected agent
  let journals = agentId
    ? mockJournals.filter(j => j.agentId === agentId)
    : mockJournals;

  // Find journal for selected date
  const selectedJournal = journals.find(j => isSameDay(j.date, selectedDate));

  const agent = agentId ? getAgentById(agentId) : null;

  const getMoodIcon = (mood: string) => {
    if (mood.includes('愉悦') || mood.includes('满足') || mood.includes('兴奋')) {
      return <Smile className="w-5 h-5 text-green-500" />;
    } else if (mood.includes('平静') || mood.includes('宁静')) {
      return <Sun className="w-5 h-5 text-yellow-500" />;
    } else if (mood.includes('累') || mood.includes('疲惫')) {
      return <Cloud className="w-5 h-5 text-gray-500" />;
    } else {
      return <Meh className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleGenerateJournal = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const dates = [
    new Date('2026-02-13'),
    new Date('2026-02-14'),
    new Date('2026-02-15'),
  ];

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            const prev = new Date(selectedDate);
            prev.setDate(prev.getDate() - 1);
            setSelectedDate(prev);
          }}
          className="rounded-full"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <Calendar className="w-4 h-4 text-[#e59a3d]" />
            <span className="font-semibold text-foreground">
              {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(selectedDate, 'EEEE', { locale: zhCN })}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            const next = new Date(selectedDate);
            next.setDate(next.getDate() + 1);
            setSelectedDate(next);
          }}
          className="rounded-full"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Date Quick Select */}
      <div className="flex gap-2 justify-center">
        {dates.map(date => (
          <Button
            key={date.toISOString()}
            variant={isSameDay(date, selectedDate) ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDate(date)}
            className={isSameDay(date, selectedDate) ? 'bg-[#e59a3d] hover:bg-[#d97f28]' : ''}
          >
            {format(date, 'MM/dd')}
          </Button>
        ))}
      </div>

      {/* Journal Content */}
      <AnimatePresence mode="wait">
        {selectedJournal ? (
          <motion.div
            key={selectedJournal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden glass">
              {/* Header */}
              <div className="relative h-40 bg-gradient-to-br from-[#f9e8d0] via-[#fdf6ed] to-[#f4d4a7] p-6">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <BookHeart className="w-5 h-5 text-[#d97f28]" />
                    <span className="text-sm font-medium text-[#75401b]">每日日记</span>
                    <Badge variant="secondary" className="ml-auto bg-white/70">
                      AI生成
                    </Badge>
                  </div>

                  <h3 className="text-2xl font-bold text-[#75401b] mb-2">
                    {agent?.name || '居民'}的一天
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-white/60 rounded-full px-3 py-1">
                      {getMoodIcon(selectedJournal.mood)}
                      <span className="text-sm text-[#75401b]">{selectedJournal.mood}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed text-base whitespace-pre-line">
                    {selectedJournal.content}
                  </p>
                </div>

                {/* Highlights */}
                <div className="mt-6 pt-4 border-t border-dashed">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#e59a3d]" />
                    今日亮点
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJournal.highlights.map((highlight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Badge 
                          variant="secondary"
                          className="bg-[#fdf6ed] text-[#75401b] hover:bg-[#f9e8d0]"
                        >
                          ✦ {highlight}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* AI Attribution */}
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <span>由 Kimi AI 生成</span>
                  <span>{format(selectedJournal.date, 'yyyy-MM-dd HH:mm')}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#fdf6ed] flex items-center justify-center">
              {isGenerating ? (
                <Loader2 className="w-10 h-10 text-[#e59a3d] animate-spin" />
              ) : (
                <BookHeart className="w-10 h-10 text-[#e59a3d]" />
              )}
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              {isGenerating ? '正在生成日记...' : '暂无日记记录'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {isGenerating 
                ? 'AI正在根据今天的活动生成日记内容，请稍候...'
                : '该日期暂时没有日记记录。可以点击下方按钮让AI生成一篇。'
              }
            </p>
            {!isGenerating && agentId && (
              <Button 
                onClick={handleGenerateJournal}
                className="bg-[#e59a3d] hover:bg-[#d97f28]"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                生成日记
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mini journal card for dashboard
export function JournalMiniCard({ agentId }: { agentId: string }) {
  const journal = mockJournals.find(j => j.agentId === agentId);
  const agent = getAgentById(agentId);

  if (!journal) return null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="cursor-pointer"
    >
      <Card className="p-4 bg-gradient-to-br from-[#fdf6ed] to-[#f9e8d0] border-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
            <img src={agent?.avatar} alt={agent?.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">{agent?.name}的日记</h4>
            <p className="text-xs text-muted-foreground">
              {format(journal.date, 'MM月dd日')}
            </p>
          </div>
        </div>
        <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
          {journal.content}
        </p>
      </Card>
    </motion.div>
  );
}
