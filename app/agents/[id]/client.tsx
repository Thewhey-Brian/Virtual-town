'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Heart,
  Sparkles,
  Calendar,
  MessageCircle,
  Brain,
  BookHeart
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { ActivityTimeline } from '@/components/activity-timeline';
import { ConversationLog } from '@/components/conversation-log';
import { MemoryViewer } from '@/components/memory-viewer';
import { JournalViewer } from '@/components/journal-viewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Agent } from '@/lib/types';
import { getLocationById } from '@/lib/data';

interface AgentDetailClientProps {
  agent: Agent;
}

export default function AgentDetailClient({ agent }: AgentDetailClientProps) {
  const location = getLocationById(agent.currentLocation);
  const statusLabels = { active: '活跃', idle: '休息', sleeping: '睡眠' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/">
              <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </motion.div>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden glass mb-6">
              <div className="h-48 md:h-64 bg-gradient-to-br from-[#f9e8d0] via-[#fdf6ed] to-[#f4d4a7] relative">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                
                <div className="absolute -bottom-16 left-6 md:left-10">
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white p-2 shadow-xl">
                      <img 
                        src={agent.avatar} 
                        alt={agent.name}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <Badge className={`
                        px-3 py-1 text-sm font-medium
                        ${agent.status === 'active' ? 'bg-green-500' : ''}
                        ${agent.status === 'idle' ? 'bg-yellow-500' : ''}
                        ${agent.status === 'sleeping' ? 'bg-gray-400' : ''}
                      `}>
                        {statusLabels[agent.status]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-20 pb-8 px-6 md:px-10">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{agent.name}</h1>
                    <p className="text-lg text-muted-foreground mb-4">{agent.occupation}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#e59a3d]" />
                        {location?.name || '未知位置'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#e59a3d]" />
                        {agent.routine.wakeUp} - {agent.routine.sleep}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {agent.routine.preferences.map((pref, i) => (
                      <Badge key={i} variant="secondary" className="bg-[#fdf6ed]">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="mt-6 text-foreground/80 leading-relaxed max-w-3xl">
                  {agent.bio}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Stats & Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Four Dimensions Stats */}
              <Card className="p-6 glass">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#e59a3d]" />
                  生活维度
                </h3>
                <div className="space-y-4">
                  <DimensionStat icon="👔" label="衣 (服饰)" value={agent.stats.clothing} color="bg-rose-500" />
                  <DimensionStat icon="🍽️" label="食 (饮食)" value={agent.stats.food} color="bg-orange-500" />
                  <DimensionStat icon="🏠" label="住 (居住)" value={agent.stats.housing} color="bg-blue-500" />
                  <DimensionStat icon="🚶" label="行 (出行)" value={agent.stats.transport} color="bg-green-500" />
                </div>
              </Card>

              {/* Personality */}
              <Card className="p-6 glass">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#e59a3d]" />
                  性格特点
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {agent.personality}
                </p>
              </Card>
            </motion.div>

            {/* Right Column - Tabs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="w-full bg-[#fdf6ed] mb-4">
                  <TabsTrigger value="activity" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    活动记录
                  </TabsTrigger>
                  <TabsTrigger value="conversations" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    对话记录
                  </TabsTrigger>
                  <TabsTrigger value="memory" className="flex-1">
                    <Brain className="w-4 h-4 mr-2" />
                    记忆
                  </TabsTrigger>
                  <TabsTrigger value="journal" className="flex-1">
                    <BookHeart className="w-4 h-4 mr-2" />
                    日记
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-0">
                  <Card className="p-6 glass">
                    <ActivityTimeline agentId={agent.id} />
                  </Card>
                </TabsContent>

                <TabsContent value="conversations" className="mt-0">
                  <Card className="p-6 glass">
                    <ConversationLog agentId={agent.id} />
                  </Card>
                </TabsContent>

                <TabsContent value="memory" className="mt-0">
                  <Card className="p-6 glass">
                    <MemoryViewer agentId={agent.id} />
                  </Card>
                </TabsContent>

                <TabsContent value="journal" className="mt-0">
                  <Card className="p-6 glass">
                    <JournalViewer agentId={agent.id} />
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DimensionStat({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: string; 
  label: string; 
  value: number; 
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </span>
        <span className="text-sm font-semibold">{value}/100</span>
      </div>
      <div className="h-2 bg-[#f0e0cc] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}
