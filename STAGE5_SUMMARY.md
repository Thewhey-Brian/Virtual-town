# Stage 5 Summary: Interaction System

## Overview
Implemented an automatic encounter detection and conversation generation system that creates realistic social interactions between characters, tracks relationships, and creates memories.

## Features Implemented

### 1. Encounter Detection Service (`lib/services/encounter-detector.ts`)
**Automatic Detection**:
- Runs every 15 minutes via cron job
- Identifies characters at the same location simultaneously
- Excludes characters who are traveling
- Prevents duplicate encounters within 2 hours

**Location-based Grouping**:
- Groups active routines by destination location
- Identifies all characters present at each location
- Processes encounters in parallel

### 2. Conversation Generator (`lib/services/conversation-generator.ts`)
**1-on-1 Conversations**:
- Considers both characters' personalities
- Factors in current mood
- Uses MBTI types for dialogue style
- Includes conversation history context
- Generates 4-8 natural message exchanges

**Group Conversations**:
- Handles 3+ characters
- Creates natural group dynamics
- 6-10 messages with turn-taking
- Reactions and group interactions

**Generated Content**:
```typescript
{
  messages: [
    { senderId, content, emotion, timestamp }
  ],
  topic: "Conversation topic",
  sentiment: -1.0 to 1.0,
  relationshipChange: -10 to +10,
  summary: "Brief summary"
}
```

### 3. Relationship Management
**Relationship Tracking**:
- Tracks intimacy (0-100 scale)
- Tracks trust (0-100 scale)
- Records first meeting location and time
- Counts total interactions

**Status Levels**:
- HOSTILE (< 10 intimacy)
- COLD (10-20)
- NEUTRAL (20-40)
- FRIENDLY (40-60)
- CLOSE (60-80)
- INTIMATE (80+)

**Relationship Types**:
- FRIEND
- COWORKER
- FAMILY
- ROMANTIC
- NEIGHBOR
- ACQUAINTANCE
- RIVAL
- STRANGER

**Dynamic Updates**:
- Conversations affect intimacy and trust
- Positive conversations increase both
- Status automatically updates based on intimacy
- Tracks last interaction time

### 4. Memory Creation
**Automatic Memory Logging**:
- Creates memory entry for each participant
- Records conversation summary
- Tags involved characters
- Assigns importance (5-7 based on relationship change)
- Records sentiment
- Captures emotions felt

### 5. API Endpoints
**Conversations**:
- `GET /api/conversations` - List conversations with filters
- `POST /api/conversations` - Create manual conversation

**Relationships**:
- `GET /api/relationships?characterId=xxx` - Get character's relationships
- `POST /api/relationships` - Create new relationship

**Encounter Detection**:
- `POST /api/cron/encounters` - Manage encounter detection
  - `action: 'start'` - Begin auto-detection (every 15 min)
  - `action: 'stop'` - Stop detection
  - `action: 'trigger'` - Manual run

### 6. Integration with Existing Systems
**With Routines**:
- Uses current routines to find characters at locations
- Only creates encounters when both are stationary
- Respects routine timing

**With Characters**:
- Accesses personality profiles
- Uses current mood for context
- Updates current status during interactions

**With Places**:
- Records location of encounters
- Context for conversation generation

## Example Encounter Flow
```
1. 14:30 - Routine detection finds:
   - Character A at Starbucks (14:00-15:00)
   - Character B at Starbucks (14:30-15:30)

2. Encounter Detection:
   - Checks for recent conversation (none found)
   - Generates conversation based on:
     * Character personalities
     * Current moods
     * Previous interactions
     * Location context

3. AI Conversation Generation:
   - Creates natural dialogue
   - Determines sentiment (+0.6)
   - Calculates relationship change (+3)

4. Database Updates:
   - Saves conversation record
   - Updates relationship (intimacy: 15→18)
   - Creates memories for both characters
   - Updates last interaction timestamp

5. Result:
   - Both characters now have:
     * New memory of the encounter
     * Improved relationship
     * Conversation history
```

## Conversation Examples
**Positive Encounter**:
- Sentiment: +0.7
- Relationship change: +5
- Topics: Shared interests, compliments

**Neutral Encounter**:
- Sentiment: 0.0
- Relationship change: +1
- Topics: Weather, small talk

**Group Encounter**:
- 3+ characters involved
- Dynamic group conversation
- Multiple relationship updates

## Technical Highlights
- Background cron job processing
- Duplicate prevention
- Parallel processing of locations
- Error isolation per encounter
- Comprehensive relationship tracking
- Memory system integration
