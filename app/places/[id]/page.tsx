'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Star,
  Users,
  Navigation,
  Image as ImageIcon,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Place {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  placeType: string;
  types: string[];
  description: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  phoneNumber: string | null;
  website: string | null;
  photoUrls: string[];
  openingHours: any;
}

interface Character {
  id: string;
  name: string;
  avatar: string | null;
  currentStatus: string;
}

interface Review {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  time: string;
}

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const placeId = params.id as string;

  const [place, setPlace] = useState<Place | null>(null);
  const [visitors, setVisitors] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (placeId) {
      fetchPlace();
      fetchVisitors();
    }
  }, [placeId]);

  const fetchPlace = async () => {
    try {
      const res = await fetch(`/api/places/${placeId}`);
      if (res.ok) {
        const data = await res.json();
        setPlace(data);
      }
    } catch (error) {
      console.error('Failed to fetch place:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVisitors = async () => {
    try {
      const res = await fetch(`/api/places/${placeId}/visitors`);
      if (res.ok) {
        const data = await res.json();
        setVisitors(data);
      }
    } catch (error) {
      console.error('Failed to fetch visitors:', error);
    }
  };

  const getPlaceTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      HOME: '🏠',
      CAFE: '☕',
      RESTAURANT: '🍽️',
      SHOP: '🛍️',
      PARK: '🌳',
      LIBRARY: '📚',
      WORK: '💼',
      TRANSPORT: '🚌',
      ENTERTAINMENT: '🎭',
      GYM: '💪',
      HOSPITAL: '🏥',
      SCHOOL: '🎓',
      OTHER: '📍',
    };
    return icons[type] || '📍';
  };

  const getTodayHours = (openingHours: any) => {
    if (!openingHours || !openingHours.weekday_text) return 'Hours not available';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const todayHours = openingHours.weekday_text.find((h: string) => h.includes(today));
    return todayHours ? todayHours.replace(`${today}: `, '') : 'Closed';
  };

  const isOpenNow = (openingHours: any) => {
    if (!openingHours || !openingHours.open_now !== undefined) return null;
    return openingHours.open_now;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
        <main className="pt-8 pb-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-48 bg-gray-200 rounded-xl" />
              <div className="h-96 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
        <main className="pt-8 pb-8 px-4">
          <div className="max-w-5xl mx-auto text-center py-16">
            <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Place Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The location you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/map">
              <Button>Back to Map</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <main className="pt-8 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.push('/map')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden mb-6">
              {/* Photo Gallery */}
              <div className="h-48 bg-gradient-to-r from-[#e59a3d]/20 to-[#d4862a]/20 flex items-center justify-center">
                {place.photoUrls && place.photoUrls.length > 0 ? (
                  <img
                    src={place.photoUrls[0]}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-6xl">{getPlaceTypeIcon(place.placeType)}</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{getPlaceTypeIcon(place.placeType)} {place.placeType}</Badge>
                      {place.rating && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                          {place.rating} ({place.userRatingsTotal || 0} reviews)
                        </Badge>
                      )}
                      {place.openingHours && (
                        <Badge className={isOpenNow(place.openingHours) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {isOpenNow(place.openingHours) ? 'Open' : 'Closed'}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold">{place.name}</h1>
                    {place.address && (
                      <p className="text-muted-foreground mt-1">{place.address}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Navigation className="w-4 h-4 mr-2" />
                      Directions
                    </Button>
                  </div>
                </div>

                {place.description && (
                  <p className="mt-4 text-foreground">{place.description}</p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <InfoCard
              icon={Clock}
              title="Hours"
              content={getTodayHours(place.openingHours)}
              subtext={place.openingHours?.weekday_text ? 'See full schedule' : undefined}
            />
            {place.phoneNumber && (
              <InfoCard
                icon={Phone}
                title="Phone"
                content={place.phoneNumber}
                subtext="Call now"
              />
            )}
            {place.website && (
              <InfoCard
                icon={Globe}
                title="Website"
                content="Visit website"
                subtext={new URL(place.website).hostname}
                href={place.website}
              />
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="visitors" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
              <TabsTrigger value="visitors">
                <Users className="w-4 h-4 mr-2" />
                Current Visitors ({visitors.length})
              </TabsTrigger>
              <TabsTrigger value="info">
                <MapPin className="w-4 h-4 mr-2" />
                Location Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visitors">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#e59a3d]" />
                  Characters Currently Here
                </h2>

                {visitors.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No characters here right now</p>
                    <p className="text-sm">Check back later to see who visits!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visitors.map((visitor) => (
                      <Link key={visitor.id} href={`/characters/${visitor.id}`}>
                        <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage 
                                src={visitor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${visitor.id}`}
                                alt={visitor.name}
                              />
                              <AvatarFallback>{visitor.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{visitor.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {visitor.currentStatus.toLowerCase()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#e59a3d]" />
                  Location Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Coordinates</p>
                    <p className="font-medium">
                      {place.lat.toFixed(6)}, {place.lng.toFixed(6)}
                    </p>
                  </div>

                  {place.openingHours?.weekday_text && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Opening Hours</p>
                      <div className="space-y-1">
                        {place.openingHours.weekday_text.map((hours: string, index: number) => (
                          <p key={index} className="text-sm">{hours}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {place.types && place.types.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {place.types.map((type: string) => (
                          <Badge key={type} variant="outline">
                            {type.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ 
  icon: Icon, 
  title, 
  content, 
  subtext,
  href 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  subtext?: string;
  href?: string;
}) {
  const CardContent = (
    <Card className={`p-4 ${href ? 'hover:shadow-md transition-all cursor-pointer' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#e59a3d]/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#e59a3d]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="font-medium truncate">{content}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {CardContent}
      </a>
    );
  }

  return CardContent;
}
