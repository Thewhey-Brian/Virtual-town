'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Sparkles, 
  CloudRain, 
  Sun, 
  Snowflake,
  PartyPopper,
  AlertTriangle,
  Users,
  Clock,
  MapPin,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TownEvent {
  id: string;
  name: string;
  description: string | null;
  eventType: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  isAllDay: boolean;
  crowdLevel: number | null;
  specialActivities: string[];
  weatherEffect: string | null;
  storyLine: string | null;
  isAiGenerated: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<TownEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/events?fromDate=${selectedDate}&toDate=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateEvents = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generate: true,
          date: selectedDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Generated ${data.count} events!`);
        fetchEvents();
      } else {
        toast.error('Failed to generate events');
      }
    } catch (error) {
      toast.error('Error generating events');
    } finally {
      setIsGenerating(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'HOLIDAY': return <PartyPopper className="w-5 h-5" />;
      case 'FESTIVAL': return <Sparkles className="w-5 h-5" />;
      case 'WEATHER': return <CloudRain className="w-5 h-5" />;
      case 'SOCIAL': return <Users className="w-5 h-5" />;
      case 'MARKET': return <MapPin className="w-5 h-5" />;
      case 'CONCERT': return <Sparkles className="w-5 h-5" />;
      case 'STORY': return <Sun className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      HOLIDAY: 'bg-purple-100 text-purple-700',
      FESTIVAL: 'bg-pink-100 text-pink-700',
      WEATHER: 'bg-blue-100 text-blue-700',
      SOCIAL: 'bg-green-100 text-green-700',
      MARKET: 'bg-yellow-100 text-yellow-700',
      CONCERT: 'bg-red-100 text-red-700',
      SPORTS: 'bg-orange-100 text-orange-700',
      COMMUNITY: 'bg-teal-100 text-teal-700',
      STORY: 'bg-amber-100 text-amber-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getCrowdLevel = (level: number | null) => {
    if (!level) return 'Normal';
    if (level >= 8) return 'Very Busy';
    if (level >= 6) return 'Busy';
    if (level >= 4) return 'Moderate';
    return 'Quiet';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e59a3d] to-[#d4862a] flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Special Events</h1>
                  <p className="text-muted-foreground">
                    Holidays, weather events, and character life events
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                />
                <Button
                  variant="outline"
                  onClick={fetchEvents}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#e59a3d] to-[#d4862a]"
                  onClick={handleGenerateEvents}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Event Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <CategoryCard
              icon={PartyPopper}
              label="Holidays"
              count={events.filter(e => e.eventType === 'HOLIDAY').length}
              color="bg-purple-100 text-purple-700"
            />
            <CategoryCard
              icon={CloudRain}
              label="Weather"
              count={events.filter(e => e.eventType === 'WEATHER').length}
              color="bg-blue-100 text-blue-700"
            />
            <CategoryCard
              icon={Sparkles}
              label="Festivals"
              count={events.filter(e => e.eventType === 'FESTIVAL').length}
              color="bg-pink-100 text-pink-700"
            />
            <CategoryCard
              icon={Sun}
              label="Life Events"
              count={events.filter(e => e.eventType === 'STORY').length}
              color="bg-amber-100 text-amber-700"
            />
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-24 bg-gray-200 rounded" />
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No events for this date</h3>
              <p className="text-muted-foreground mb-4">
                Generate events to see holidays, weather effects, and life events
              </p>
              <Button
                className="bg-gradient-to-r from-[#e59a3d] to-[#d4862a]"
                onClick={handleGenerateEvents}
                disabled={isGenerating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Events
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getEventColor(event.eventType)}`}>
                        {getEventIcon(event.eventType)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{event.name}</h3>
                            <Badge className={getEventColor(event.eventType)}>
                              {event.eventType}
                            </Badge>
                            {event.isAiGenerated && (
                              <Badge variant="outline" className="ml-2">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {event.description && (
                          <p className="text-muted-foreground mt-2">{event.description}</p>
                        )}
                        
                        {event.storyLine && (
                          <p className="text-sm text-amber-700 mt-2 italic">
                            &ldquo;{event.storyLine}&rdquo;
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 mt-4 text-sm">
                          {event.isAllDay ? (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              All Day
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {event.startTime} - {event.endTime}
                            </span>
                          )}
                          
                          {event.crowdLevel !== null && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              {getCrowdLevel(event.crowdLevel)}
                            </span>
                          )}
                          
                          {event.weatherEffect && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <CloudRain className="w-4 h-4" />
                              {event.weatherEffect}
                            </span>
                          )}
                        </div>
                        
                        {event.specialActivities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {event.specialActivities.map((activity) => (
                              <Badge key={activity} variant="outline" className="text-xs capitalize">
                                {activity.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function CategoryCard({ 
  icon: Icon, 
  label, 
  count, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{count}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}
