import { prisma } from '@/lib/prisma';
import { generateRoutineDescription } from './ai-character';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  placeType: string;
}

interface RoutineSegment {
  startTime: string;
  endTime: string;
  fromLocationId: string;
  toLocationId: string;
  actionType: string;
  description: string;
  purpose: string;
  mood: string;
}

// Calculate travel time between two locations (in minutes)
export function calculateTravelTime(from: Location, to: Location): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLon = (to.lng - from.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in miles
  
  // Assume average speed of 25 mph in urban area
  const travelTimeMinutes = Math.ceil((distance / 25) * 60);
  
  // Add buffer for parking/walking (5-10 minutes)
  return Math.max(5, Math.min(travelTimeMinutes + 5, 60));
}

// Generate a daily routine for a character
export async function generateDailyRoutine(
  characterId: string,
  date: Date,
  allPlaces: Location[]
): Promise<RoutineSegment[]> {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      homeLocation: true,
      workLocation: true,
    },
  });

  if (!character) {
    throw new Error('Character not found');
  }

  const routines: RoutineSegment[] = [];
  
  // Get lifestyle and habits
  const lifestyle = character.lifestyle as any || {};
  const habits = character.habits as any || {};
  const preferences = character.preferences as any || {};
  
  // Determine if weekend
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Get sleep schedule
  const sleepSchedule = lifestyle.sleepSchedule?.[isWeekend ? 'weekend' : 'weekday'] || {
    wake: isWeekend ? '08:30' : '07:00',
    sleep: isWeekend ? '00:00' : '23:00',
  };
  
  let currentTime = sleepSchedule.wake;
  let currentLocationId = character.homeLocationId;
  
  // 1. Wake up at home
  routines.push({
    startTime: sleepSchedule.wake,
    endTime: addMinutes(sleepSchedule.wake, 30),
    fromLocationId: currentLocationId,
    toLocationId: currentLocationId,
    actionType: 'WAKE',
    description: 'Wake up and morning routine',
    purpose: 'Start the day',
    mood: 'sleepy',
  });
  
  currentTime = addMinutes(sleepSchedule.wake, 30);
  
  // 2. Morning routine at home
  const morningDuration = isWeekend ? 90 : 60;
  routines.push({
    startTime: currentTime,
    endTime: addMinutes(currentTime, morningDuration),
    fromLocationId: currentLocationId,
    toLocationId: currentLocationId,
    actionType: 'HOME',
    description: isWeekend ? 'Relaxing morning at home' : 'Get ready for the day',
    purpose: 'Morning routine and breakfast',
    mood: 'calm',
  });
  
  currentTime = addMinutes(currentTime, morningDuration);
  
  // 3. Coffee/Breakfast (optional based on habits)
  if (habits.morning?.includes('coffee') || Math.random() > 0.3) {
    const cafes = allPlaces.filter(p => p.placeType === 'CAFE');
    if (cafes.length > 0) {
      const cafe = cafes[Math.floor(Math.random() * cafes.length)];
      const travelTime = calculateTravelTime(
        allPlaces.find(p => p.id === currentLocationId)!,
        cafe
      );
      
      // Travel to cafe
      routines.push({
        startTime: currentTime,
        endTime: addMinutes(currentTime, travelTime),
        fromLocationId: currentLocationId,
        toLocationId: cafe.id,
        actionType: 'TRAVEL',
        description: `Travel to ${cafe.name}`,
        purpose: 'Get morning coffee',
        mood: 'energetic',
      });
      
      currentTime = addMinutes(currentTime, travelTime);
      currentLocationId = cafe.id;
      
      // At cafe
      routines.push({
        startTime: currentTime,
        endTime: addMinutes(currentTime, 30),
        fromLocationId: currentLocationId,
        toLocationId: currentLocationId,
        actionType: 'MEAL',
        description: 'Coffee and breakfast',
        purpose: 'Fuel up for the day',
        mood: 'happy',
      });
      
      currentTime = addMinutes(currentTime, 30);
    }
  }
  
  // 4. Work (weekdays only, if has work location)
  if (!isWeekend && character.workLocationId) {
    const workStart = '09:00';
    const workEnd = '17:00';
    
    // Travel to work if not there
    if (currentLocationId !== character.workLocationId) {
      const travelTime = calculateTravelTime(
        allPlaces.find(p => p.id === currentLocationId)!,
        allPlaces.find(p => p.id === character.workLocationId)!
      );
      
      routines.push({
        startTime: currentTime,
        endTime: addMinutes(currentTime, travelTime),
        fromLocationId: currentLocationId,
        toLocationId: character.workLocationId,
        actionType: 'TRAVEL',
        description: 'Commute to work',
        purpose: 'Go to work',
        mood: 'focused',
      });
      
      currentTime = addMinutes(currentTime, travelTime);
      currentLocationId = character.workLocationId;
    }
    
    // Work hours
    routines.push({
      startTime: workStart,
      endTime: workEnd,
      fromLocationId: currentLocationId,
      toLocationId: currentLocationId,
      actionType: 'WORK',
      description: 'Work at office',
      purpose: 'Professional responsibilities',
      mood: 'productive',
    });
    
    currentTime = workEnd;
  }
  
  // 5. Lunch (if work day)
  if (!isWeekend) {
    const lunchTime = '12:00';
    const restaurants = allPlaces.filter(p => p.placeType === 'RESTAURANT');
    
    if (restaurants.length > 0 && currentLocationId === character.workLocationId) {
      const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      const travelTime = calculateTravelTime(
        allPlaces.find(p => p.id === currentLocationId)!,
        restaurant
      );
      
      routines.push({
        startTime: lunchTime,
        endTime: addMinutes(lunchTime, travelTime),
        fromLocationId: currentLocationId,
        toLocationId: restaurant.id,
        actionType: 'TRAVEL',
        description: `Go to ${restaurant.name}`,
        purpose: 'Lunch break',
        mood: 'hungry',
      });
      
      routines.push({
        startTime: addMinutes(lunchTime, travelTime),
        endTime: addMinutes(lunchTime, travelTime + 60),
        fromLocationId: restaurant.id,
        toLocationId: restaurant.id,
        actionType: 'MEAL',
        description: 'Lunch',
        purpose: 'Mid-day meal',
        mood: 'satisfied',
      });
      
      // Return to work
      routines.push({
        startTime: addMinutes(lunchTime, travelTime + 60),
        endTime: addMinutes(lunchTime, travelTime * 2 + 60),
        fromLocationId: restaurant.id,
        toLocationId: character.workLocationId!,
        actionType: 'TRAVEL',
        description: 'Return to work',
        purpose: 'Back to work',
        mood: 'focused',
      });
    }
  }
  
  // 6. Afternoon activities
  if (isWeekend) {
    // Weekend activities based on preferences
    const activities = preferences.activities || [];
    let activityLocation: Location | null = null;
    
    if (activities.includes('shopping')) {
      const shops = allPlaces.filter(p => p.placeType === 'SHOP');
      if (shops.length > 0) activityLocation = shops[Math.floor(Math.random() * shops.length)];
    } else if (activities.includes('hiking') || activities.includes('outdoor')) {
      const parks = allPlaces.filter(p => p.placeType === 'PARK');
      if (parks.length > 0) activityLocation = parks[Math.floor(Math.random() * parks.length)];
    } else if (activities.includes('reading')) {
      const libraries = allPlaces.filter(p => p.placeType === 'LIBRARY');
      if (libraries.length > 0) activityLocation = libraries[Math.floor(Math.random() * libraries.length)];
    }
    
    // Default to cafe or random place
    if (!activityLocation) {
      const cafes = allPlaces.filter(p => p.placeType === 'CAFE');
      if (cafes.length > 0) activityLocation = cafes[Math.floor(Math.random() * cafes.length)];
    }
    
    if (activityLocation) {
      const travelTime = calculateTravelTime(
        allPlaces.find(p => p.id === currentLocationId)!,
        activityLocation
      );
      
      routines.push({
        startTime: currentTime,
        endTime: addMinutes(currentTime, travelTime),
        fromLocationId: currentLocationId,
        toLocationId: activityLocation.id,
        actionType: 'TRAVEL',
        description: `Go to ${activityLocation.name}`,
        purpose: 'Weekend activity',
        mood: 'excited',
      });
      
      currentTime = addMinutes(currentTime, travelTime);
      currentLocationId = activityLocation.id;
      
      routines.push({
        startTime: currentTime,
        endTime: addMinutes(currentTime, 120),
        fromLocationId: currentLocationId,
        toLocationId: currentLocationId,
        actionType: 'LEISURE',
        description: 'Weekend leisure activity',
        purpose: 'Enjoy time off',
        mood: 'relaxed',
      });
      
      currentTime = addMinutes(currentTime, 120);
    }
  }
  
  // 7. Dinner
  const dinnerTime = isWeekend ? '19:00' : '18:30';
  const restaurants = allPlaces.filter(p => p.placeType === 'RESTAURANT');
  
  if (restaurants.length > 0 && currentTime < dinnerTime) {
    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    const travelTime = calculateTravelTime(
      allPlaces.find(p => p.id === currentLocationId)!,
      restaurant
    );
    
    // Travel to dinner
    routines.push({
      startTime: currentTime,
      endTime: addMinutes(currentTime, travelTime),
      fromLocationId: currentLocationId,
      toLocationId: restaurant.id,
      actionType: 'TRAVEL',
      description: `Go to ${restaurant.name} for dinner`,
      purpose: 'Dinner',
      mood: 'hungry',
    });
    
    currentTime = addMinutes(currentTime, travelTime);
    currentLocationId = restaurant.id;
    
    // Dinner
    routines.push({
      startTime: currentTime,
      endTime: addMinutes(currentTime, 90),
      fromLocationId: currentLocationId,
      toLocationId: currentLocationId,
      actionType: 'MEAL',
      description: 'Dinner',
      purpose: 'Evening meal',
      mood: 'satisfied',
    });
    
    currentTime = addMinutes(currentTime, 90);
  }
  
  // 8. Return home
  if (currentLocationId !== character.homeLocationId) {
    const travelTime = calculateTravelTime(
      allPlaces.find(p => p.id === currentLocationId)!,
      allPlaces.find(p => p.id === character.homeLocationId)!
    );
    
    routines.push({
      startTime: currentTime,
      endTime: addMinutes(currentTime, travelTime),
      fromLocationId: currentLocationId,
      toLocationId: character.homeLocationId,
      actionType: 'TRAVEL',
      description: 'Head home',
      purpose: 'Return home for the evening',
      mood: 'tired',
    });
    
    currentTime = addMinutes(currentTime, travelTime);
    currentLocationId = character.homeLocationId;
  }
  
  // 9. Evening at home
  const eveningStart = currentTime;
  const sleepTime = sleepSchedule.sleep;
  
  if (timeToMinutes(eveningStart) < timeToMinutes(sleepTime)) {
    routines.push({
      startTime: eveningStart,
      endTime: sleepTime,
      fromLocationId: currentLocationId,
      toLocationId: currentLocationId,
      actionType: 'HOME',
      description: 'Evening at home',
      purpose: 'Relax and unwind',
      mood: 'peaceful',
    });
  }
  
  // 10. Sleep
  routines.push({
    startTime: sleepTime,
    endTime: addMinutes(sleepTime, 480), // 8 hours later
    fromLocationId: currentLocationId,
    toLocationId: currentLocationId,
    actionType: 'SLEEP',
    description: 'Sleep',
    purpose: 'Rest for the next day',
    mood: 'asleep',
  });
  
  // Enhance descriptions with AI
  const enhancedRoutines = await Promise.all(
    routines.map(async (routine) => {
      if (routine.actionType === 'TRAVEL') return routine;
      
      try {
        const aiDescription = await generateRoutineDescription(
          character.name,
          allPlaces.find(p => p.id === routine.fromLocationId)?.name || 'Unknown',
          allPlaces.find(p => p.id === routine.toLocationId)?.name || 'Unknown',
          routine.actionType,
          routine.startTime
        );
        
        return {
          ...routine,
          description: aiDescription.description,
          purpose: aiDescription.purpose,
          mood: aiDescription.mood,
        };
      } catch (error) {
        return routine;
      }
    })
  );
  
  return enhancedRoutines;
}

// Helper functions
function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Generate routines for all characters
export async function generateAllRoutines(date: Date = new Date()): Promise<void> {
  const characters = await prisma.character.findMany({
    where: { isActive: true },
  });
  
  const places = await prisma.place.findMany();
  
  for (const character of characters) {
    try {
      // Check if routines already exist for this date
      const existingRoutines = await prisma.characterRoutine.findFirst({
        where: {
          characterId: character.id,
          date: date,
        },
      });
      
      if (existingRoutines) {
        console.log(`Routines already exist for ${character.name} on ${date.toDateString()}`);
        continue;
      }
      
      const routines = await generateDailyRoutine(character.id, date, places);
      
      // Save routines to database
      await prisma.characterRoutine.createMany({
        data: routines.map(routine => ({
          characterId: character.id,
          date: date,
          startTime: routine.startTime,
          endTime: routine.endTime,
          fromLocationId: routine.fromLocationId,
          toLocationId: routine.toLocationId,
          actionType: routine.actionType as any,
          description: routine.description,
          purpose: routine.purpose,
          mood: routine.mood,
          isAiGenerated: true,
        })),
      });
      
      console.log(`Generated ${routines.length} routines for ${character.name}`);
    } catch (error) {
      console.error(`Failed to generate routines for ${character.name}:`, error);
    }
  }
}
