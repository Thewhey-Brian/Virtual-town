# Virtual Town v3.0

An AI-driven virtual life simulation where residents live, work, and interact in a dynamic town environment. Built with Next.js 16, React 19, Prisma, PostgreSQL, and Google Maps API.

![Virtual Town](https://img.shields.io/badge/version-3.0-orange)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)

## ✨ Features

### 🏠 Character System
- Create unique characters with AI-generated personalities
- Detailed profiles with Big Five personality traits, MBTI types
- Daily routines, habits, preferences, and life goals
- 24-hour timeline visualization

### 🗺️ Interactive Map
- Real-time Google Maps integration
- Live character positions with animated movement
- 40+ real Glendale, CA locations
- Filter by place type (cafes, restaurants, parks, etc.)

### 🤖 AI Daily Routines
- Automatic daily routine generation using LLM
- Context-aware activities based on personality
- Realistic travel time calculations
- Weekend vs weekday differences

### 💬 Social Interactions
- Automatic encounter detection
- AI-generated conversations between characters
- Relationship tracking (intimacy, trust, status)
- Memory system for life events

### 🎮 Command Center
- Natural language commands
- "Make John go to Starbucks"
- Real-time character control
- Command history and undo

### 📺 Playback System
- Visual timeline playback
- Speed controls (1x, 10x, 60x, 300x)
- Animated travel paths
- Any time of day visualization

### 🎉 Special Events
- Holiday and festival generation
- Weather impact on behavior
- Character life events (new job, moving, etc.)
- Community events and gatherings

### ⚡ Performance
- Redis caching
- Rate limiting
- Database optimizations
- Comprehensive logging

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis (optional, for caching)
- Google Maps API key
- OpenAI API key (or DeepSeek)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/virtual-town-v3.git
cd virtual-town-v3
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/virtual_town"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
OPENAI_API_KEY="your_openai_api_key"
REDIS_URL="redis://localhost:6379"
```

4. **Set up the database**
```bash
npx prisma db push
npx prisma generate
```

5. **Seed demo data**
```bash
npm run db:seed
```

6. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
virtual-town-v3/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── characters/        # Character pages
│   ├── map/              # Map page
│   ├── playback/         # Playback page
│   ├── events/           # Events page
│   ├── prompt/           # Command center
│   └── page.tsx          # Home page
├── components/           # React components
│   └── ui/              # shadcn/ui components
├── lib/                 # Utilities and services
│   ├── services/        # AI, cache, rate limiter
│   ├── prisma.ts        # Database client
│   └── utils.ts         # Helper functions
├── prisma/
│   └── schema.prisma    # Database schema
└── public/             # Static assets
```

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Maps**: Google Maps JavaScript API
- **AI**: OpenAI GPT-4o-mini / DeepSeek
- **Caching**: Redis (optional)
- **Animation**: Framer Motion
- **Cron**: node-cron

## 📖 API Documentation

### Characters
- `GET /api/characters` - List characters
- `POST /api/characters` - Create character
- `GET /api/characters/[id]` - Get character details
- `GET /api/characters/[id]/memories` - Get memories

### Places
- `GET /api/places` - List places
- `GET /api/places/[id]` - Get place details
- `GET /api/places/[id]/visitors` - Get current visitors

### Routines
- `GET /api/routines` - List routines
- `POST /api/routines` - Create routines
- `POST /api/routines/generate` - Generate AI routines

### Conversations
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation

### Commands
- `POST /api/prompts` - Submit natural language command
- `GET /api/prompts` - Get command history

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create/generate events

### Playback
- `GET /api/playback/positions` - Get positions for time

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your repository
- Add environment variables

3. **Configure Build**
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

4. **Add Database**
- Use Vercel Postgres or connect external PostgreSQL
- Run `npx prisma db push`

5. **Deploy**
- Vercel will auto-deploy on push to main

### Environment Variables for Production

```env
# Required
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
OPENAI_API_KEY="..."

# Optional
REDIS_URL="redis://..."
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

## 📝 Database Schema

See `prisma/schema.prisma` for full schema.

Key entities:
- **Town**: Town state, weather, time
- **Place**: Locations from Google Places
- **Character**: Residents with personalities
- **CharacterRoutine**: Daily schedules
- **CharacterMemory**: Life experiences
- **CharacterRelationship**: Social connections
- **Conversation**: Dialogue history
- **TownEvent**: Special events
- **UserPrompt**: Command history

## 🎨 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)
*Main dashboard showing town overview, character list, and live map*

### Character Detail
![Character](screenshots/character.png)
*Character profile with personality traits, timeline, and memories*

### Map
![Map](screenshots/map.png)
*Interactive map with real-time character positions*

### Playback
![Playback](screenshots/playback.png)
*Timeline playback with speed controls*

### Events
![Events](screenshots/events.png)
*Special events and holidays*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Google Maps Platform
- OpenAI / DeepSeek
- Vercel
- shadcn/ui community
# Virtual-town
