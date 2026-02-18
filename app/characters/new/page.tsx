'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Home, 
  Briefcase, 
  Sparkles, 
  ArrowLeft, 
  Loader2,
  Check,
  MapPin
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Place } from '@prisma/client';

interface PlaceOption {
  id: string;
  name: string;
  address: string | null;
  placeType: string;
}

export default function NewCharacterPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [places, setPlaces] = useState<PlaceOption[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    age: 25,
    gender: '',
    occupation: '',
    personalityHint: '',
    bio: '',
    homeLocationId: '',
    workLocationId: '',
    // Personality traits (0-100)
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  });

  const [generatedProfile, setGeneratedProfile] = useState<any>(null);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const res = await fetch('/api/places');
      if (res.ok) {
        const data = await res.json();
        setPlaces(data);
      }
    } catch (error) {
      console.error('Failed to fetch places:', error);
    }
  };

  const handleGenerateProfile = async () => {
    if (!formData.name || !formData.age) {
      toast.error('Please fill in name and age first');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/characters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          occupation: formData.occupation,
          personalityHint: formData.personalityHint,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedProfile(data);
        setFormData(prev => ({
          ...prev,
          bio: data.bio,
          openness: data.personality.bigFive.openness,
          conscientiousness: data.personality.bigFive.conscientiousness,
          extraversion: data.personality.bigFive.extraversion,
          agreeableness: data.personality.bigFive.agreeableness,
          neuroticism: data.personality.bigFive.neuroticism,
        }));
        toast.success('Character profile generated!');
        setStep(2);
      } else {
        toast.error('Failed to generate profile');
      }
    } catch (error) {
      toast.error('Error generating profile');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.age || !formData.homeLocationId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          townId: 'default', // Will be handled by API
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          bio: formData.bio,
          occupation: formData.occupation || 'Resident',
          homeLocationId: formData.homeLocationId,
          workLocationId: formData.workLocationId || null,
          personality: generatedProfile?.personality || {
            traits: [],
            mbti: 'XXXX',
            bigFive: {
              openness: formData.openness,
              conscientiousness: formData.conscientiousness,
              extraversion: formData.extraversion,
              agreeableness: formData.agreeableness,
              neuroticism: formData.neuroticism,
            },
          },
          lifestyle: generatedProfile?.lifestyle || {},
          habits: generatedProfile?.habits || {},
          preferences: generatedProfile?.preferences || {},
          goals: generatedProfile?.goals || [],
          isUserCreated: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Character created successfully!');
        router.push(`/characters/${data.id}`);
      } else {
        toast.error('Failed to create character');
      }
    } catch (error) {
      toast.error('Error creating character');
    } finally {
      setIsSubmitting(false);
    }
  };

  const homePlaces = places.filter(p => p.placeType === 'HOME');
  const workPlaces = places.filter(p => ['WORK', 'CAFE', 'RESTAURANT', 'SHOP', 'OTHER'].includes(p.placeType));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.push('/characters')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Characters
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e59a3d] to-[#d4862a] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Create New Character</h1>
                <p className="text-muted-foreground">Design a new resident for Virtual Town</p>
              </div>
            </div>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            <StepIndicator step={1} currentStep={step} label="Basic Info" />
            <div className="flex-1 h-1 bg-gray-200 rounded">
              <div 
                className="h-full bg-[#e59a3d] rounded transition-all"
                style={{ width: step === 1 ? '0%' : '100%' }}
              />
            </div>
            <StepIndicator step={2} currentStep={step} label="Locations" />
          </div>

          {step === 1 ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#e59a3d]" />
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter character name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age: {formData.age}</Label>
                    <Slider
                      id="age"
                      min={18}
                      max={80}
                      step={1}
                      value={[formData.age]}
                      onValueChange={([value]) => setFormData({ ...formData, age: value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      placeholder="e.g., Software Engineer"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Label htmlFor="personalityHint">Personality Hint (Optional)</Label>
                  <Textarea
                    id="personalityHint"
                    placeholder="e.g., Outgoing coffee lover, shy bookworm, ambitious entrepreneur..."
                    value={formData.personalityHint}
                    onChange={(e) => setFormData({ ...formData, personalityHint: e.target.value })}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps AI generate a more personalized profile
                  </p>
                </div>

                {/* Big Five Traits */}
                <div className="mt-8 space-y-6">
                  <h3 className="font-medium text-muted-foreground">Personality Traits (Big Five)</h3>
                  
                  {[
                    { key: 'openness', label: 'Openness to Experience', desc: 'Curiosity, creativity, preference for novelty' },
                    { key: 'conscientiousness', label: 'Conscientiousness', desc: 'Organization, dependability, self-discipline' },
                    { key: 'extraversion', label: 'Extraversion', desc: 'Sociability, energy, positive emotions' },
                    { key: 'agreeableness', label: 'Agreeableness', desc: 'Cooperation, trust, empathy' },
                    { key: 'neuroticism', label: 'Neuroticism', desc: 'Emotional stability, anxiety, moodiness' },
                  ].map((trait) => (
                    <div key={trait.key} className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">{trait.label}</Label>
                        <span className="text-sm text-muted-foreground">
                          {formData[trait.key as keyof typeof formData]}
                        </span>
                      </div>
                      <Slider
                        value={[formData[trait.key as keyof typeof formData] as number]}
                        onValueChange={([value]) => 
                          setFormData({ ...formData, [trait.key]: value })
                        }
                        min={0}
                        max={100}
                      />
                      <p className="text-xs text-muted-foreground">{trait.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/characters')}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#e59a3d] to-[#d4862a]"
                  onClick={handleGenerateProfile}
                  disabled={isGenerating || !formData.name}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Profile
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Generated Profile Preview */}
              {generatedProfile && (
                <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e59a3d] to-[#d4862a] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900">AI-Generated Profile</h3>
                      <p className="text-sm text-amber-800 mt-1">{generatedProfile.bio}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary">{generatedProfile.personality.mbti}</Badge>
                        {generatedProfile.personality.traits.slice(0, 3).map((trait: string) => (
                          <Badge key={trait} variant="outline">{trait}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#e59a3d]" />
                  Location Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="homeLocation">Home Location *</Label>
                    <Select
                      value={formData.homeLocationId}
                      onValueChange={(value) => setFormData({ ...formData, homeLocationId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select home" />
                      </SelectTrigger>
                      <SelectContent>
                        {homePlaces.map((place) => (
                          <SelectItem key={place.id} value={place.id}>
                            {place.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Where the character lives
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workLocation">Work Location</Label>
                    <Select
                      value={formData.workLocationId}
                      onValueChange={(value) => setFormData({ ...formData, workLocationId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select workplace (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {workPlaces.map((place) => (
                          <SelectItem key={place.id} value={place.id}>
                            {place.name} ({place.placeType.toLowerCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Where the character works
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#e59a3d] to-[#d4862a]"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.homeLocationId}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Create Character
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

function StepIndicator({ step, currentStep, label }: { step: number; currentStep: number; label: string }) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[#e59a3d] text-white'
            : isCompleted
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {isCompleted ? <Check className="w-4 h-4" /> : step}
      </div>
      <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
