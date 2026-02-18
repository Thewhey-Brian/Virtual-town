'use client';

import { Suspense, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar,
  ArrowRight,
  Sparkles,
  Users,
  Activity,
  Clock,
  Sun,
  Cloud,
  Navigation,
  Menu,
  Home,
  Map,
  History,
  BookOpen,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useApi } from '@/lib/hooks/use-api';
import { ErrorBoundary, SectionErrorBoundary } from '@/components/error-boundary';
import { 
  Skeleton, 
  CharacterCardSkeleton, 
  StatCardSkeleton,
  DashboardSkeleton 
} from '@/components/skeletons';

// Types
interface Town {
  id: string;
  name: string;
  currentTime: string;
  weather: string;
  temperature: number;
  season: string;
  _count?: {
    characters: number;
    places: number;
  };
}

interface Character {
  id: string;
  name: string;
  avatar: string | null;
  age: number;
  occupation: string;
  bio: string;
  currentStatus: string;
  currentMood: string;
}

interface Place {
  id: string;
  name: string;
  placeType: string;
  lat: number;
  lng: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Navigation Component
function DashboardNavigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/characters', label: '居民', icon: Users },
    { href: '/map', label: '地图', icon: Map },
    { href: '/playback', label: '回放', icon: History },
    { href: '/prompt', label: '命令', icon: Navigation },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#f0e0cc]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e59a3d] to-[#d97f28] flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg text-foreground leading-tight">虚拟小镇</h1>
            <p className="text-[10px] text-muted-foreground">Virtual Town v3.0</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" size="sm" className="rounded-full px-4">
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-gradient-to-br from-[#fefbf7] to-[#fdf6ed]">
            <div className="flex flex-col gap-2 mt-8">
              {navItems.map((item) => (
                <SheetClose key={item.href} asChild>
                  <Link href={item.href}>
                    <Button variant="ghost" className="w-full justify-start rounded-xl h-12">
                      <item.icon className="w-5 h-5 mr-3 text-[#e59a3d]" />
                      {item.label}
                    </Button>
                  </Link>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

// Weather Icon Component
function WeatherIcon({ weather }: { weather: string }) {
  switch (weather?.toUpperCase()) {
    case 'SUNNY': return <Sun className="w-5 h-5 text-yellow-500" />;
    case 'CLOUDY': return <Cloud className="w-5 h-5 text-gray-500" />;
    case 'RAINY': return <Cloud className="w-5 h-5 text-blue-500" />;
    case 'SNOWY': return <Cloud className="w-5 h-5 text-blue-300" />;
    default: return <Sun className="w-5 h-5 text-yellow-500" />;
  }
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color = 'orange',
  isLoading = false
}: { 
  icon: React.ElementType;
  label: string;
  value: number | string;
  color?: 'orange' | 'green' | 'blue';
  isLoading?: boolean;
}) {
  const colorClasses = {
    orange: 'bg-[#fdf6ed] text-[#e59a3d]',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  if (isLoading) {
    return (
      <Card className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton variant="circle" width={40} height={40} />
          <div className="space-y-2">
            <Skeleton width={40} height={24} />
            <Skeleton width={80} />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClasses[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </div>
    </Card>
  );
}

// Character Card Component
function CharacterCard({ 
  character, 
  index,
  isLoading = false
}: { 
  character?: Character; 
  index: number;
  isLoading?: boolean;
}) {
  if (isLoading || !character) {
    return (
      <Card className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <Skeleton variant="circle" width={56} height={56} />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" />
            <Skeleton width="40%" />
            <Skeleton width="30%" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/characters/${character.id}`}>
        <Card className="p-3 sm:p-4 hover:shadow-lg transition-all cursor-pointer group">
          <div className="flex items-start gap-3">
            <img 
              src={character.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`}
              alt={character.name}
              loading="lazy"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 shrink-0 group-hover:scale-110 transition-transform"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-foreground truncate">{character.name}</h3>
                <Badge variant="outline" className="text-xs shrink-0">
                  {character.age}岁
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{character.occupation}</p>
              <p className="text-xs text-[#e59a3d] mt-1 capitalize">{character.currentStatus?.toLowerCase() || 'idle'}</p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

// Error Display Component
function ErrorDisplay({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h3>
      <p className="text-sm text-gray-600 mb-4 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          重试
        </Button>
      )}
    </div>
  );
}

// Stats Section Component
function StatsSection({ 
  town, 
  characters, 
  places,
  isLoading 
}: { 
  town: Town | null;
  characters: Character[];
  places: Place[];
  isLoading: boolean;
}) {
  const activeCharacters = characters.filter(c => c.currentStatus !== 'SLEEPING').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
      <StatCard 
        icon={Users} 
        label="居民数量" 
        value={town?._count?.characters || characters.length} 
        isLoading={isLoading}
      />
      <StatCard 
        icon={Activity} 
        label="活跃中" 
        value={activeCharacters} 
        color="green"
        isLoading={isLoading}
      />
      <StatCard 
        icon={MapPin} 
        label="地点数量" 
        value={town?._count?.places || places.length} 
        color="blue"
        isLoading={isLoading}
      />
      <StatCard 
        icon={Calendar} 
        label="今日活动" 
        value="0" 
        isLoading={isLoading}
      />
      <StatCard 
        icon={Clock} 
        label="模拟时间" 
        value={town?.currentTime || '--:--'} 
        isLoading={isLoading}
      />
    </div>
  );
}

// Characters Section Component
function CharactersSection({ 
  characters,
  isLoading,
  error,
  onRetry
}: { 
  characters: Character[];
  isLoading: boolean;
  error: { message: string } | null;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6">
        <ErrorDisplay message={error.message} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3">
          {[...Array(6)].map((_, i) => (
            <CharacterCard key={i} index={i} isLoading />
          ))}
        </div>
      ) : characters.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">暂无居民数据</p>
          <Link href="/characters/new">
            <Button className="mt-4 bg-[#e59a3d] hover:bg-[#d4862a]">
              创建居民
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {characters.slice(0, 6).map((character, index) => (
            <CharacterCard key={character.id} character={character} index={index} />
          ))}
        </div>
      )}
    </>
  );
}

// Weather Card Component
function WeatherCard({ 
  town,
  isLoading 
}: { 
  town: Town | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6 h-full">
        <Skeleton width="60%" height={24} className="mb-4" />
        <Skeleton width="80%" height={48} className="mb-4" />
        <Skeleton width="40%" />
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 h-full bg-gradient-to-br from-[#e59a3d]/10 to-[#d4862a]/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{town?.name || 'Glendale'}</h2>
        <Badge variant="outline">{town?.season || 'SPRING'}</Badge>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl sm:text-5xl font-bold text-[#e59a3d]">
          {town?.currentTime || '08:00'}
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <WeatherIcon weather={town?.weather || 'SUNNY'} />
        <span>{town?.temperature || 72}°F</span>
        <span className="capitalize">{town?.weather?.toLowerCase() || 'sunny'}</span>
      </div>

      <div className="mt-4 pt-4 border-t border-[#e59a3d]/20">
        <Link href="/map">
          <Button className="w-full bg-[#e59a3d] hover:bg-[#d4862a]">
            <Map className="w-4 h-4 mr-2" />
            查看地图
          </Button>
        </Link>
      </div>
    </Card>
  );
}

// Main Dashboard Content
function DashboardContent() {
  const { 
    data: townData, 
    isLoading: townLoading, 
    error: townError,
    refetch: refetchTown 
  } = useApi<Town>({
    url: '/api/town',
    cacheKey: 'town',
    cacheTTL: 30,
  });

  const { 
    data: charactersData, 
    isLoading: charsLoading, 
    error: charsError,
    refetch: refetchCharacters 
  } = useApi<{ characters: Character[] }>({
    url: '/api/characters?limit=50',
    cacheKey: 'characters',
    cacheTTL: 300,
  });

  const { 
    data: placesData, 
    isLoading: placesLoading, 
    error: placesError,
    refetch: refetchPlaces 
  } = useApi<{ places: Place[] }>({
    url: '/api/places',
    cacheKey: 'places',
    cacheTTL: 3600,
  });

  const town = townData || null;
  const characters = charactersData?.characters || [];
  const places = placesData?.places || [];

  const isLoading = townLoading || charsLoading || placesLoading;
  const hasError = townError || charsError || placesError;

  const handleRefresh = useCallback(() => {
    refetchTown();
    refetchCharacters();
    refetchPlaces();
  }, [refetchTown, refetchCharacters, refetchPlaces]);

  // Show full-page error only if all requests failed
  if (hasError && !isLoading && !town && characters.length === 0 && places.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
        <div className="text-center p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">无法加载数据</h2>
          <p className="text-gray-600 mb-6">
            {townError?.message || charsError?.message || placesError?.message || '服务器连接失败'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRefresh} className="bg-[#e59a3d] hover:bg-[#d4862a]">
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <DashboardNavigation />
      
      <main className="pt-20 sm:pt-24 pb-8 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Title & Welcome */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <Badge className="mb-3 sm:mb-4 bg-[#fdf6ed] text-[#75401b] hover:bg-[#f9e8d0]">
                <Sparkles className="w-3 h-3 mr-1" />
                AI 驱动的生活模拟 v3.0
              </Badge>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
                欢迎来到<span className="text-[#e59a3d]">虚拟小镇</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                探索居民们衣食住行的生活故事，实时见证AI生成的精彩日常
              </p>

              {/* Quick Stats Grid */}
              <div className="mt-4 sm:mt-6">
                <StatsSection 
                  town={town} 
                  characters={characters} 
                  places={places}
                  isLoading={isLoading}
                />
              </div>
            </motion.div>

            {/* Weather & Time Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <WeatherCard town={town} isLoading={townLoading} />
            </motion.div>
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* Characters Column */}
            <div className="lg:col-span-4 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#e59a3d]" />
                  小镇居民
                </h2>
                <Link href="/characters">
                  <Button variant="ghost" size="sm" className="text-[#e59a3d]">
                    查看全部
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <SectionErrorBoundary sectionName="居民列表" onRetry={refetchCharacters}>
                <CharactersSection 
                  characters={characters}
                  isLoading={charsLoading}
                  error={charsError}
                  onRetry={refetchCharacters}
                />
              </SectionErrorBoundary>
            </div>

            {/* Map Preview Column */}
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
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

              {/* Map Preview */}
              <Card className="h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden relative">
                <Link href="/map" className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#fefbf7] to-[#f9e8d0] group cursor-pointer">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#e59a3d]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Map className="w-8 h-8 sm:w-10 sm:h-10 text-[#e59a3d]" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">Interactive Map</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isLoading ? 'Loading...' : `${places.length} locations • ${characters.length} residents`}
                    </p>
                    <Button className="bg-[#e59a3d] hover:bg-[#d4862a]">
                      Open Map
                    </Button>
                  </div>
                </Link>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link href="/characters/new">
                  <Card className="p-4 text-center hover:shadow-md transition-all cursor-pointer group">
                    <Users className="w-6 h-6 mx-auto mb-2 text-[#e59a3d] group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium">创建居民</p>
                  </Card>
                </Link>
                <Link href="/playback">
                  <Card className="p-4 text-center hover:shadow-md transition-all cursor-pointer group">
                    <History className="w-6 h-6 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium">时间回放</p>
                  </Card>
                </Link>
                <Link href="/prompt">
                  <Card className="p-4 text-center hover:shadow-md transition-all cursor-pointer group">
                    <Navigation className="w-6 h-6 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium">发送命令</p>
                  </Card>
                </Link>
                <Link href="/events">
                  <Card className="p-4 text-center hover:shadow-md transition-all cursor-pointer group">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium">事件日历</p>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Main Page with Error Boundary
export default function HomePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  );
}

// Add React import
import React from 'react';
