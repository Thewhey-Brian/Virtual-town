'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookHeart, ArrowLeft, Calendar, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { JournalViewer } from '@/components/journal-viewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { agents, mockJournals } from '@/lib/data';
import { format, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function JournalsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2026-02-15'));

  // Get all journal entries for the selected date
  const dailyJournals = mockJournals.filter(j => isSameDay(j.date, selectedDate));

  const dates = [
    new Date('2026-02-13'),
    new Date('2026-02-14'),
    new Date('2026-02-15'),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <BookHeart className="w-6 h-6 text-[#e59a3d]" />
                    居民日记
                  </h1>
                  <p className="text-muted-foreground">AI生成的每日生活记录</p>
                </div>
              </div>

              <Badge className="bg-[#fdf6ed] text-[#75401b] px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                由 Kimi AI 驱动
              </Badge>
            </div>
          </motion.div>

          {/* Date Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-4 glass">
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
                    <Calendar className="w-5 h-5 text-[#e59a3d]" />
                    <span className="text-xl font-bold text-foreground">
                      {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedDate, 'EEEE', { locale: zhCN })} · {dailyJournals.length} 篇日记
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
              <div className="flex gap-2 justify-center mt-4">
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
            </Card>
          </motion.div>

          {/* Agent Selection & Journals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs 
              value={selectedAgent || 'all'} 
              onValueChange={(v) => setSelectedAgent(v === 'all' ? null : v)}
              className="w-full"
            >
              <TabsList className="w-full bg-[#fdf6ed] mb-6 flex-wrap h-auto">
                <TabsTrigger value="all" className="flex-1 min-w-[80px]">
                  全部居民
                </TabsTrigger>
                {agents.map(agent => (
                  <TabsTrigger 
                    key={agent.id} 
                    value={agent.id}
                    className="flex-1 min-w-[80px]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full overflow-hidden">
                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="hidden sm:inline">{agent.name}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agents.map(agent => (
                    <Card key={agent.id} className="p-6 glass">
                      <JournalViewer agentId={agent.id} />
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {agents.map(agent => (
                <TabsContent key={agent.id} value={agent.id} className="mt-0">
                  <Card className="p-6 glass max-w-3xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{agent.name}的日记</h2>
                        <p className="text-muted-foreground">{agent.occupation}</p>
                      </div>
                    </div>
                    <JournalViewer agentId={agent.id} />
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>

          {/* AI Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              日记由 Kimi AI 根据居民的日常活动生成 · 每日更新一次 · 展示虚拟居民的生活点滴
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
