'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Home, 
  Briefcase, 
  Clock, 
  Heart,
  Brain,
  Calendar,
  MapPin,
  MessageSquare,
  Activity,
  Sparkles
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timeline } from '@/components/ui/timeline';

interface Character {
  id: string;
  name: string;
  avatar: string | null;
  age: number;
  gender: string | null;
  occupation: string;
  bio: string | null;
  personality: {
    traits: string[];
    mbti: string;
    bigFive: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
  };
  lifestyle: {
    sleepSchedule: {
      weekday: { wake: string; sleep: string };
      weekend: { wake: string; sleep: string };
    };
    dietary: string[];
    hobbies: string[];
  };
  habits: {
    morning: string[];
    evening: string[];
    weekend: string[];
  };
  preferences: {
    food: string[];
    activities: string[];
    music: string[];
    social: string;
  };
  goals: string[];
  wealth: number;
  income: number;
  homeLocation: {
    id: string;
    name: string;
    address: string | null;
  };
  workLocation?: {
    id: string;
    name: string;
  } | null;
  currentLocationId: string | null;
  currentStatus: string;
  currentMood: string;
  isUserCreated: boolean;
}

interface Routine {
  id: string;
  startTime: string;
  endTime: string;
  fromLocation: { name: string };
  toLocation: { name: string };
  actionType: string;
  description: string;
  purpose: string;
  mood: string;
}

interface Memory {
  id: string;
  category: string;
  content: string;
  date: string;
  importance: number;
  sentiment: number | null;
}

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (characterId) {
      fetchCharacter();
      fetchRoutines();
      fetchMemories();
    }
  }, [characterId]);

  useEffect(() => {
    fetchRoutines();
  }, [selectedDate]);

  const fetchCharacter = async () => {
    try {
      const res = await fetch(`/api/characters/${characterId}`);
      if (res.ok) {
        const data = await res.json();
        setCharacter(data);
      }
    } catch (error) {
      console.error('Failed to fetch character:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutines = async () => {
    try {
      const res = await fetch(
        `/api/routines?characterId=${characterId}&date=${selectedDate}`
      );
      if (res.ok) {
        const data = await res.json();
        setRoutines(data);
      }
    } catch (error) {
      console.error('Failed to fetch routines:', error);
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch(`/api/characters/${characterId}/memories`);
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SLEEPING: 'bg-purple-100 text-purple-700',
      IDLE: 'bg-gray-100 text-gray-700',
      WORKING: 'bg-blue-100 text-blue-700',
      EATING: 'bg-orange-100 text-orange-700',
      TRAVELING: 'bg-yellow-100 text-yellow-700',
      SOCIALIZING: 'bg-green-100 text-green-700',
      EXERCISING: 'bg-red-100 text-red-700',
      SHOPPING: 'bg-pink-100 text-pink-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
        <Navigation />
        <main className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-gray-200 rounded-xl" />
              <div className="h-96 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
        <Navigation />
        <main className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center py-16">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Character Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The character you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/characters">
              <Button>Back to Characters</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.push('/characters')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Characters
            </Button>
          </motion.div>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="w-24 h-24 border-4 border-[#e59a3d]">
                  <AvatarImage 
                    src={character.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`}
                    alt={character.name}
                  />
                  <AvatarFallback className="text-2xl">{character.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{character.name}</h1>
                    {character.isUserCreated && (
                      <Badge variant="secondary">
                        <Sparkles className="w-3 h-3 mr-1" />
                        User Created
                      </Badge>
                    )}
                    <Badge className={getStatusColor(character.currentStatus)}>
                      {character.currentStatus.toLowerCase()}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    {character.age} years old • {character.gender || 'Unknown'} • {character.occupation}
                  </p>

                  {character.bio && (
                    <p className="text-foreground mb-4 max-w-2xl">{character.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <span>Lives at <strong>{character.homeLocation.name}</strong></span>
                    </div>
                    {character.workLocation && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span>Works at <strong>{character.workLocation.name}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <span>Mood: <strong>{character.currentMood}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:w-48">
                  <StatCard label="Wealth" value={`$${character.wealth.toLocaleString()}`} />
                  <StatCard label="Income" value={`$${character.income.toLocaleString()}/mo`} />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="timeline">
                <Clock className="w-4 h-4 mr-2" />
                24h Timeline
              </TabsTrigger>
              <TabsTrigger value="personality">
                <Brain className="w-4 h-4 mr-2" />
                Personality
              </TabsTrigger>
              <TabsTrigger value="habits">
                <Activity className="w-4 h-4 mr-2" />
                Habits
              </TabsTrigger>
              <TabsTrigger value="memories">
                <MessageSquare className="w-4 h-4 mr-2" />
                Memories
              </TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#e59a3d]" />
                    Daily Schedule
                  </h2>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                {routines.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No routines scheduled for this date</p>
                    <p className="text-sm">Routines are generated daily by AI</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {routines.map((routine, index) => (
                      <TimelineItem
                        key={routine.id}
                        time={`${routine.startTime} - ${routine.endTime}`}
                        title={routine.description}
                        description={routine.purpose}
                        location={`${routine.fromLocation.name} → ${routine.toLocation.name}`}
                        mood={routine.mood}
                        isLast={index === routines.length - 1}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Personality Tab */}
            <TabsContent value="personality">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#e59a3d]" />
                    Personality Traits
                  </h2>
                  
                  {character.personality?.traits && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {character.personality.traits.map((trait) => (
                        <Badge key={trait} variant="secondary">{trait}</Badge>
                      ))}
                    </div>
                  )}

                  {character.personality?.mbti && (
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-1">MBTI Type</p>
                      <p className="text-2xl font-bold">{character.personality.mbti}</p>
                    </div>
                  )}

                  {character.personality?.bigFive && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Big Five Personality</h3>
                      {Object.entries(character.personality.bigFive).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span>{value}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#e59a3d] to-[#d4862a] transition-all"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#e59a3d]" />
                    Preferences & Goals
                  </h2>

                  {character.preferences && (
                    <div className="space-y-4 mb-6">
                      {character.preferences.food?.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Favorite Foods</p>
                          <div className="flex flex-wrap gap-2">
                            {character.preferences.food.map((item) => (
                              <Badge key={item} variant="outline">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {character.preferences.activities?.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Activities</p>
                          <div className="flex flex-wrap gap-2">
                            {character.preferences.activities.map((item) => (
                              <Badge key={item} variant="outline">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {character.preferences.music?.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Music</p>
                          <div className="flex flex-wrap gap-2">
                            {character.preferences.music.map((item) => (
                              <Badge key={item} variant="outline">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {character.preferences.social && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Social Style</p>
                          <Badge className="capitalize">{character.preferences.social}</Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {character.goals?.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Life Goals</h3>
                      <ul className="space-y-2">
                        {character.goals.map((goal, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-[#e59a3d]">•</span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* Habits Tab */}
            <TabsContent value="habits">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#e59a3d]" />
                    Daily Routine
                  </h2>

                  {character.lifestyle?.sleepSchedule && (
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Weekday Schedule</span>
                        <span className="text-sm text-muted-foreground">
                          {character.lifestyle.sleepSchedule.weekday.wake} - {character.lifestyle.sleepSchedule.weekday.sleep}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Weekend Schedule</span>
                        <span className="text-sm text-muted-foreground">
                          {character.lifestyle.sleepSchedule.weekend.wake} - {character.lifestyle.sleepSchedule.weekend.sleep}
                        </span>
                      </div>
                    </div>
                  )}

                  {character.habits && (
                    <div className="space-y-4">
                      {character.habits.morning?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Morning Habits</p>
                          <ul className="space-y-1">
                            {character.habits.morning.map((habit, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#e59a3d]" />
                                {habit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {character.habits.evening?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Evening Habits</p>
                          <ul className="space-y-1">
                            {character.habits.evening.map((habit, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#e59a3d]" />
                                {habit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#e59a3d]" />
                    Interests & Hobbies
                  </h2>

                  {character.lifestyle?.hobbies?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-3">Hobbies</p>
                      <div className="flex flex-wrap gap-2">
                        {character.lifestyle.hobbies.map((hobby) => (
                          <Badge key={hobby} variant="secondary">{hobby}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {character.lifestyle?.dietary?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-3">Dietary Preferences</p>
                      <div className="flex flex-wrap gap-2">
                        {character.lifestyle.dietary.map((item) => (
                          <Badge key={item} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {character.habits?.weekend?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Weekend Activities</p>
                      <ul className="space-y-1">
                        {character.habits.weekend.map((activity, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e59a3d]" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* Memories Tab */}
            <TabsContent value="memories">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#e59a3d]" />
                  Memories & Experiences
                </h2>

                {memories.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No memories yet</p>
                    <p className="text-sm">Memories are created as characters interact with the world</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {memories.map((memory) => (
                      <MemoryCard key={memory.id} memory={memory} />
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function TimelineItem({ 
  time, 
  title, 
  description, 
  location, 
  mood,
  isLast 
}: { 
  time: string; 
  title: string; 
  description: string;
  location: string;
  mood: string;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-[#e59a3d]" />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-2" />}
      </div>
      <div className="flex-1 pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-medium text-[#e59a3d]">{time}</span>
          <Badge variant="outline" className="text-xs capitalize">{mood}</Badge>
        </div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {location}
        </div>
      </div>
    </div>
  );
}

function MemoryCard({ memory }: { memory: Memory }) {
  const categoryColors: Record<string, string> = {
    PEOPLE: 'bg-blue-100 text-blue-700',
    PLACES: 'bg-green-100 text-green-700',
    EVENTS: 'bg-purple-100 text-purple-700',
    PREFERENCES: 'bg-yellow-100 text-yellow-700',
    DAILY: 'bg-gray-100 text-gray-700',
    MILESTONE: 'bg-red-100 text-red-700',
    RELATIONSHIP: 'bg-pink-100 text-pink-700',
    WORK: 'bg-orange-100 text-orange-700',
    LEISURE: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <Badge className={categoryColors[memory.category] || 'bg-gray-100'}>
          {memory.category}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{new Date(memory.date).toLocaleDateString()}</span>
          {memory.importance >= 8 && <span>⭐</span>}
        </div>
      </div>
      <p className="text-sm">{memory.content}</p>
      {memory.sentiment !== null && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sentiment:</span>
          <span className={`text-xs ${memory.sentiment > 0 ? 'text-green-600' : memory.sentiment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {memory.sentiment > 0 ? '😊' : memory.sentiment < 0 ? '😔' : '😐'} {memory.sentiment.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}
