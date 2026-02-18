'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  MessageCircle, 
  Calendar,
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { AgentCard, AgentAvatar } from '@/components/agent-card';
import { TownMap } from '@/components/town-map';
import { ActivityTimeline } from '@/components/activity-timeline';
import { JournalMiniCard } from '@/components/journal-viewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { agents, locations, mockActivities, mockConversations } from '@/lib/data';

export default function Dashboard() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const stats = {
    totalAgents: agents.length,
    activeNow: agents.filter(a => a.status === 'active').length,
    totalLocations: locations.length,
    todayActivities: mockActivities.length,
    todayConversations: mockConversations.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <section className="text-center py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-[#fdf6ed] text-[#75401b] hover:bg-[#f9e8d0]">
                <Sparkles className="w-3 h-3 mr-1" />
                AI 驱动的生活模拟
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                欢迎来到<span className="text-gradient">虚拟小镇</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                探索居民们衣食住行的生活故事，见证AI生成的精彩日常
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8"
            >
              <StatCard icon={Sparkles} label="居民数量" value={stats.totalAgents} />
              <StatCard icon={TrendingUp} label="在线居民" value={stats.activeNow} color="green" />
              <StatCard icon={MapPin} label="地点数量" value={stats.totalLocations} />
              <StatCard icon={Calendar} label="今日活动" value={stats.todayActivities} />
              <StatCard icon={MessageCircle} label="今日对话" value={stats.todayConversations} />
            </motion.div>
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Agents */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#e59a3d]" />
                  小镇居民
                </h2>
                <Link href="/agents">
                  <Button variant="ghost" size="sm" className="text-[#e59a3d]">
                    查看全部
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/agents/${agent.id}`}>
                      <Card className="p-4 hover:shadow-lg transition-all cursor-pointer group glass">
                        <div className="flex items-center gap-4">
                          <AgentAvatar agent={agent} size="md" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-[#e59a3d] transition-colors">
                              {agent.name}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">{agent.occupation}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="text-[10px]">
                                衣 {agent.stats.clothing}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px]">
                                食 {agent.stats.food}
                              </Badge>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[#e59a3d] transition-colors" />
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Center & Right Column - Map & Activities */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#e59a3d]" />
                    小镇地图
                  </h2>
                  <Link href="/map">
                    <Button variant="ghost" size="sm" className="text-[#e59a3d]">
                      全屏查看
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="h-[350px] rounded-2xl overflow-hidden shadow-lg">
                  <TownMap />
                </div>
              </section>

              {/* Recent Activity */}
              <section>
                <Tabs defaultValue="activity">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#e59a3d]" />
                      动态记录
                    </h2>
                    <TabsList className="bg-[#fdf6ed]">
                      <TabsTrigger value="activity" className="text-xs">活动</TabsTrigger>
                      <TabsTrigger value="journals" className="text-xs">日记</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="activity" className="mt-0">
                    <ActivityTimeline limit={5} />
                  </TabsContent>

                  <TabsContent value="journals" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {agents.slice(0, 4).map(agent => (
                        <JournalMiniCard key={agent.id} agentId={agent.id} />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color = 'orange' 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color?: 'orange' | 'green';
}) {
  const colorClasses = {
    orange: 'bg-[#fdf6ed] text-[#e59a3d]',
    green: 'bg-green-50 text-green-600'
  };

  return (
    <Card className="p-4 glass hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}
