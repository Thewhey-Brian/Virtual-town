import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/places/search - Search places via Google Places API
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      )
    }

    // Import and use the Google Places service
    const { googlePlacesService } = await import('@/lib/services/google-places')
    
    const results = await googlePlacesService.textSearch(query)
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching places:', error)
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    )
  }
}

// POST /api/places/search - Import place from Google Places
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { placeId, townId } = body

    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID required' },
        { status: 400 }
      )
    }

    const { googlePlacesService } = await import('@/lib/services/google-places')
    
    const details = await googlePlacesService.getPlaceDetails(placeId)
    
    // Map Google types to our types
    const placeType = mapGoogleTypesToPlaceType(details.types)
    
    const place = await prisma.place.create({
      data: {
        townId: townId,
        googlePlaceId: details.placeId,
        name: details.name,
        address: details.address,
        lat: details.lat,
        lng: details.lng,
        types: details.types,
        placeType: placeType as any,
        rating: details.rating,
        userRatingsTotal: details.userRatingsTotal,
        openingHours: details.openingHours,
        phoneNumber: details.phoneNumber,
        website: details.website,
        photoUrls: details.photos || [],
      },
    })

    return NextResponse.json(place, { status: 201 })
  } catch (error) {
    console.error('Error importing place:', error)
    return NextResponse.json(
      { error: 'Failed to import place' },
      { status: 500 }
    )
  }
}

function mapGoogleTypesToPlaceType(googleTypes: string[]): string {
  const typeMap: Record<string, string> = {
    'cafe': 'CAFE',
    'restaurant': 'RESTAURANT',
    'food': 'RESTAURANT',
    'store': 'SHOP',
    'shopping_mall': 'SHOP',
    'park': 'PARK',
    'library': 'LIBRARY',
    'book_store': 'SHOP',
    'movie_theater': 'ENTERTAINMENT',
    'gym': 'GYM',
    'hospital': 'HOSPITAL',
    'school': 'SCHOOL',
    'university': 'SCHOOL',
    'transit_station': 'TRANSPORT',
    'bus_station': 'TRANSPORT',
  }

  for (const type of googleTypes) {
    if (typeMap[type]) return typeMap[type]
  }

  return 'OTHER'
}
