import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/places/[id]/visitors - Get characters currently at this place
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get all characters whose current location is this place
    const visitors = await prisma.character.findMany({
      where: {
        currentLocationId: id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        currentStatus: true,
      },
    });

    return NextResponse.json(visitors);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitors' },
      { status: 500 }
    );
  }
}
