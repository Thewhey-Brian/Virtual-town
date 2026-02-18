# Virtual Town v3.0 - Stage 1: Foundation

This document describes the Stage 1 implementation of the AI Virtual Town project.

## What's Been Implemented

### 1. Database Schema (Prisma)
Created a comprehensive PostgreSQL database schema with 8 core tables:

1. **towns** - Town configuration (Glendale, CA), time system, weather, season
2. **places** - Real locations from Google Places API with lat/lng coordinates
3. **characters** - NPC/User character profiles with personality, habits, goals
4. **character_routines** - 24-hour daily trajectories with time segments
5. **character_memories** - Long-term memory system with importance scoring
6. **character_relationships** - Social graph between characters
7. **user_prompts** - User intervention commands and AI responses
8. **town_events** - Public events, holidays, weather events

### 2. API Endpoints

#### Town Management
- `GET /api/town` - Get current town state
- `POST /api/town` - Create a new town
- `PATCH /api/town` - Update town state (time, weather, etc.)

#### Places
- `GET /api/places` - List all places with filtering
- `POST /api/places` - Create a place
- `GET /api/places/[id]` - Get place details
- `PATCH /api/places/[id]` - Update place
- `DELETE /api/places/[id]` - Delete place
- `GET /api/places/search` - Search Google Places
- `POST /api/places/search` - Import from Google Places

#### Characters
- `GET /api/characters` - List all characters
- `POST /api/characters` - Create a character
- `GET /api/characters/[id]` - Get character details
- `PATCH /api/characters/[id]` - Update character
- `DELETE /api/characters/[id]` - Soft delete character

#### Routines
- `GET /api/routines` - List routines with date filtering
- `POST /api/routines` - Create routine segments
- `GET /api/routines/current` - Get current routines for all characters

#### Seed Data
- `POST /api/seed` - Seed database with sample data

### 3. Google Maps Integration

#### Components
- `GoogleMap` - React component for Google Maps JavaScript API
  - Marker rendering for places and characters
  - Click handlers for interaction
  - Custom marker icons by type

#### Services
- `GooglePlacesService` - Wrapper for Google Places API
  - `searchNearby()` - Find places by type
  - `getPlaceDetails()` - Get detailed place info
  - `textSearch()` - Search by text query

### 4. Frontend Context
- `TownProvider` - React context for town state management
  - Real-time time progression with configurable speed
  - Automatic data fetching and updates

### 5. Sample Data
16 real Glendale locations including:
- **Food**: Porto's Bakery, Din Tai Fung, Kings Row Coffee, Raffi's Place
- **Shopping**: Americana at Brand, Glendale Galleria, Target
- **Parks**: Brand Park, Verdugo Park
- **Culture**: Glendale Central Library, Alex Theatre
- **Residential**: Wilson Ave Loft, Chevy Chase Canyon, Rossmoyne Historic District

5 sample characters with detailed profiles:
- 林小雨 (Lin Xiaoyu) - Illustrator/Coffee Shop Worker
- 陈大伟 (Chen Dawei) - Software Engineer
- 王小美 (Wang Xiaomei) - Fashion Blogger
- 张思远 (Zhang Siyuan) - University Professor
- 刘阳光 (Liu Yangguang) - Delivery Courier

## Environment Variables

Create a `.env.local` file with:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/virtual_town"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
GOOGLE_PLACES_API_KEY="your_google_places_api_key"

# AI Services (for future stages)
OPENAI_API_KEY="your_openai_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"

# Redis (optional, for caching)
REDIS_URL="redis://localhost:6379"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Database
```bash
# Update DATABASE_URL in .env.local
npx prisma db push
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Seed Database
```bash
curl -X POST http://localhost:3000/api/seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000/map](http://localhost:3000/map) to view the map.

## Deployment to Vercel

### 1. Set Environment Variables
In Vercel dashboard, add:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps JavaScript API key
- `GOOGLE_PLACES_API_KEY` - Google Places API key

### 2. Deploy
```bash
vercel --prod
```

### 3. Run Seed (first time only)
```bash
curl -X POST https://your-app.vercel.app/api/seed \
  -H "Authorization: Bearer your_seed_secret"
```

## Project Structure

```
app/
├── api/                 # API routes
│   ├── town/           # Town management
│   ├── places/         # Places CRUD
│   ├── characters/     # Characters CRUD
│   ├── routines/       # Daily routines
│   └── seed/           # Database seeding
├── map/                # Map page
├── page.tsx            # Home page
└── layout.tsx          # Root layout

components/
├── google-map.tsx      # Google Maps component
├── ui/                 # shadcn/ui components
└── ...                 # Existing components

lib/
├── prisma.ts           # Prisma client
├── town-context.tsx    # Town state management
├── seed.ts             # Seed data
├── services/
│   └── google-places.ts # Google Places service
└── types.ts            # TypeScript types

prisma/
├── schema.prisma       # Database schema
└── config.ts           # Prisma configuration
```

## Next Steps (Stage 2)

1. **Character Creation Page** - Form to create new characters
2. **Character Detail Page** - 24h timeline, habits, memories
3. **AI Profile Generation** - Use OpenAI/Claude to generate personalities
4. **Initial Routine Generation** - Generate first day's schedule

## Notes

- The time system supports variable speeds (1x, 60x, 300x, 900x)
- Character locations currently default to home locations
- Real-time position updates will be implemented in Stage 6 (Animation)
- AI integration for routine generation coming in Stage 3
