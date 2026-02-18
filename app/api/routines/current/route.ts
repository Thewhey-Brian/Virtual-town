import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/routines/current - Get current routines for all characters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const time = searchParams.get('time') // HH:MM format
    const date = searchParams.get('date') // YYYY-MM-DD format

    const targetDate = date ? new Date(date) : new Date()
    const targetTime = time || formatTime(new Date())

    // Find all active routines for the given time
    const routines = await prisma.characterRoutine.findMany({
      where: {
        date: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
        startTime: {
          lte: targetTime,
        },
        endTime: {
          gte: targetTime,
        },
      },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            avatar: true,
            currentStatus: true,
            currentMood: true,
          },
        },
        fromLocation: true,
        toLocation: true,
      },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json(routines)
  } catch (error) {
    console.error('Error fetching current routines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch current routines' },
      { status: 500 }
    )
  }
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5) // HH:MM
}
