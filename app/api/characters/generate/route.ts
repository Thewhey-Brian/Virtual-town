import { NextRequest, NextResponse } from 'next/server';
import { generateCharacterProfile } from '@/lib/services/ai-character';

// POST /api/characters/generate - Generate AI character profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, age, gender, occupation, personalityHint } = body;

    if (!name || !age) {
      return NextResponse.json(
        { error: 'Name and age are required' },
        { status: 400 }
      );
    }

    const profile = await generateCharacterProfile({
      name,
      age,
      gender,
      occupation,
      personalityHint,
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error generating character profile:', error);
    return NextResponse.json(
      { error: 'Failed to generate character profile' },
      { status: 500 }
    );
  }
}
