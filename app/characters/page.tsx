'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Briefcase,
  User,
  Sparkles
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Character {
  id: string;
  name: string;
  avatar: string | null;
  age: number;
  gender: string | null;
  occupation: string;
  bio: string | null;
  homeLocation: {
    id: string;
    name: string;
  };
  workLocation?: {
    id: string;
    name: string;
  } | null;
  isUserCreated: boolean;
  currentStatus: string;
  currentMood: string;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchCharacters();
  }, []);

  useEffect(() => {
    filterCharacters();
  }, [characters, searchQuery, filterType]);

  const fetchCharacters = async () => {
    try {
      const res = await fetch('/api/characters');
      if (res.ok) {
        const data = await res.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCharacters = () => {
    let filtered = characters;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.occupation.toLowerCase().includes(query) ||
          c.bio?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType === 'user-created') {
      filtered = filtered.filter((c) => c.isUserCreated);
    } else if (filterType === 'ai-generated') {
      filtered = filtered.filter((c) => !c.isUserCreated);
    }

    setFilteredCharacters(filtered);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e59a3d] to-[#d4862a] flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Characters</h1>
                  <p className="text-muted-foreground">
                    {characters.length} residents in Virtual Town
                  </p>
                </div>
              </div>
              
              <Link href="/characters/new">
                <Button className="bg-gradient-to-r from-[#e59a3d] to-[#d4862a]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Character
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, occupation, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Characters</SelectItem>
                <SelectItem value="user-created">User Created</SelectItem>
                <SelectItem value="ai-generated">AI Generated</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Characters Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24" />
                      <div className="h-3 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredCharacters.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No characters found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Create your first character to get started'}
              </p>
              {!searchQuery && (
                <Link href="/characters/new">
                  <Button className="bg-gradient-to-r from-[#e59a3d] to-[#d4862a]">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Character
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharacters.map((character, index) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/characters/${character.id}`}>
                    <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group h-full">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16 border-2 border-transparent group-hover:border-[#e59a3d] transition-colors">
                          <AvatarImage 
                            src={character.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`} 
                            alt={character.name}
                          />
                          <AvatarFallback>{character.name[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg truncate">{character.name}</h3>
                              <p className="text-sm text-muted-foreground">{character.age} years old</p>
                            </div>
                            {character.isUserCreated && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Custom
                              </Badge>
                            )}
                          </div>
                          
                          <Badge className={`mt-2 ${getStatusColor(character.currentStatus)}`}>
                            {character.currentStatus.toLowerCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{character.occupation}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">Lives at {character.homeLocation.name}</span>
                        </div>

                        {character.workLocation && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">Works at {character.workLocation.name}</span>
                          </div>
                        )}
                      </div>

                      {character.bio && (
                        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                          {character.bio}
                        </p>
                      )}
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
