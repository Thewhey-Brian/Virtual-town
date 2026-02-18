import { NextRequest, NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seed'

// POST /api/seed - Seed the database with initial data
export async function POST(req: NextRequest) {
  try {
    // Check for secret key in production
    const authHeader = req.headers.get('authorization')
    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.SEED_SECRET_KEY}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const result = await seedDatabase()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
