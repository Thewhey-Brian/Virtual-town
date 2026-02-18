# Stage 4 Summary: AI Daily Trajectory

## Overview
Implemented an intelligent routine generation system that creates daily schedules for all characters based on their personality, habits, and lifestyle preferences.

## Features Implemented

### 1. Routine Generator Service (`lib/services/routine-generator.ts`)
**Core Functions**:
- `generateDailyRoutine()` - Creates a full day schedule for a single character
- `generateAllRoutines()` - Batch generates routines for all active characters
- `calculateTravelTime()` - Calculates realistic travel times between locations

**Daily Schedule Structure**:
1. **Wake Up** (based on sleep schedule)
2. **Morning Routine** at home
3. **Coffee/Breakfast** (optional, based on habits)
4. **Work** (weekdays, if has work location)
5. **Lunch** (during work days)
6. **Afternoon Activities** (weekend preferences-based)
7. **Dinner** (varies by day type)
8. **Return Home**
9. **Evening at Home**
10. **Sleep**

**Smart Scheduling**:
- Respects character's sleep schedule (weekday vs weekend)
- Incorporates habits (morning coffee, reading, etc.)
- Uses preferences to determine activities
- Accounts for work schedules
- Includes realistic meal times

### 2. Travel Time Calculation
**Haversine Formula**:
- Calculates straight-line distance between coordinates
- Assumes 25 mph average urban speed
- Adds 5-minute buffer for parking/walking
- Caps travel time between 5-60 minutes

### 3. AI Enhancement
- Generates contextual descriptions for each activity
- Determines mood for each routine segment
- Explains the purpose of each activity
- Falls back to generic descriptions if AI unavailable

### 4. Background Job System (`app/api/cron/routines/route.ts`)
**Cron Job Management**:
- Schedule: Daily at 00:01 AM
- Timezone: America/Los_Angeles
- Prevents concurrent executions
- Manual trigger capability

**API Endpoints**:
- `POST /api/cron/routines` - Start/stop/trigger cron job
  - `action: 'start'` - Begin daily scheduling
  - `action: 'stop'` - Stop the cron job
  - `action: 'trigger'` - Manual run with optional date

### 5. Routine Generation API (`app/api/routines/generate/route.ts`)
**Endpoints**:
- Generate for all characters: `POST /api/routines/generate`
- Generate for specific character: `POST /api/routines/generate` with `characterId`
- Specify date: include `date` in body

**Features**:
- Overwrites existing routines for the date
- Returns count of generated routines
- Error handling per character

### 6. Real-time Position Tracking (`app/api/characters/positions/route.ts`)
**Position Interpolation**:
- Fetches current routines for all characters
- Calculates exact position based on current time
- Interpolates between from/to during travel
- Shows stationary position during activities
- Updates every 30 seconds on map

**Algorithm**:
```
if (character is traveling):
  progress = (current_time - start_time) / duration
  lat = from_lat + (to_lat - from_lat) * progress
  lng = from_lon + (to_lon - from_lon) * progress
else:
  position = destination_location
```

### 7. Database Schema Updates
**Town Model**:
- Added `currentLat` and `currentLng` for map center
- Defaults to Glendale, CA coordinates

## Example Daily Routine
```
07:00 - 07:30: Wake up and morning routine (Home)
07:30 - 08:30: Get ready for the day (Home)
08:30 - 08:45: Travel to Starbucks (Travel)
08:45 - 09:15: Coffee and breakfast (Cafe)
09:15 - 09:30: Commute to work (Travel)
09:00 - 12:00: Work at office (Work)
12:00 - 12:15: Go to Porto's (Travel)
12:15 - 13:15: Lunch (Restaurant)
13:15 - 13:30: Return to work (Travel)
17:00 - 17:15: Go to Raffi's Place (Travel)
17:15 - 18:45: Dinner (Restaurant)
18:45 - 19:00: Head home (Travel)
19:00 - 22:30: Evening at home (Home)
22:30 - 06:30: Sleep (Home)
```

## Weekend vs Weekday Differences
**Weekdays**:
- Work hours (9 AM - 5 PM)
- Structured lunch break
- Commute times
- Earlier bedtimes

**Weekends**:
- Later wake-up times
- Preference-based activities (shopping, parks, libraries)
- Leisure and social activities
- Flexible schedules

## Technical Highlights
- Prisma transactions for batch creation
- Error isolation per character
- Background job processing
- Real-time position interpolation
- Comprehensive logging
