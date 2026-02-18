import { Client, PlaceType1 } from '@googlemaps/google-maps-services-js'

const client = new Client({})

// Glendale, CA coordinates
const GLENDALE_CENTER = {
  lat: 34.1425,
  lng: -118.2551,
}

// Search radius in meters
const SEARCH_RADIUS = 5000 // 5km

export interface PlaceSearchResult {
  placeId: string
  name: string
  address?: string
  lat: number
  lng: number
  types: string[]
  rating?: number
  userRatingsTotal?: number
  photos?: string[]
  openingHours?: {
    openNow?: boolean
    weekdayText?: string[]
  }
  phoneNumber?: string
  website?: string
}

export class GooglePlacesService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY is not set')
    }
  }

  /**
   * Search for places near Glendale center
   */
  async searchNearby(type: string, keyword?: string): Promise<PlaceSearchResult[]> {
    try {
      const response = await client.placesNearby({
        params: {
          location: GLENDALE_CENTER,
          radius: SEARCH_RADIUS,
          type: type as PlaceType1,
          keyword,
          key: this.apiKey,
        },
      })

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${response.data.status}`)
      }

      const results = response.data.results || []
      return results.map(this.mapPlaceResult)
    } catch (error) {
      console.error('Error searching nearby places:', error)
      throw error
    }
  }

  /**
   * Get detailed information about a place
   */
  async getPlaceDetails(placeId: string): Promise<PlaceSearchResult> {
    try {
      const response = await client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'geometry',
            'type',
            'rating',
            'user_ratings_total',
            'photos',
            'opening_hours',
            'formatted_phone_number',
            'website',
          ],
          key: this.apiKey,
        },
      })

      if (response.data.status !== 'OK') {
        throw new Error(`Google Places API error: ${response.data.status}`)
      }

      return this.mapPlaceResult(response.data.result)
    } catch (error) {
      console.error('Error getting place details:', error)
      throw error
    }
  }

  /**
   * Search for places by text query
   */
  async textSearch(query: string): Promise<PlaceSearchResult[]> {
    try {
      const response = await client.textSearch({
        params: {
          query: `${query} in Glendale, CA`,
          location: GLENDALE_CENTER,
          radius: SEARCH_RADIUS,
          key: this.apiKey,
        },
      })

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${response.data.status}`)
      }

      const results = response.data.results || []
      return results.map(this.mapPlaceResult)
    } catch (error) {
      console.error('Error text searching places:', error)
      throw error
    }
  }

  /**
   * Map Google Places result to our format
   */
  private mapPlaceResult(result: any): PlaceSearchResult {
    return {
      placeId: result.place_id,
      name: result.name,
      address: result.formatted_address || result.vicinity,
      lat: result.geometry?.location?.lat || 0,
      lng: result.geometry?.location?.lng || 0,
      types: result.types || [],
      rating: result.rating,
      userRatingsTotal: result.user_ratings_total,
      photos: result.photos?.map((p: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${this.apiKey}`
      ),
      openingHours: result.opening_hours ? {
        openNow: result.opening_hours.open_now,
        weekdayText: result.opening_hours.weekday_text,
      } : undefined,
      phoneNumber: result.formatted_phone_number,
      website: result.website,
    }
  }

  /**
   * Get photo URL for a place
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`
  }
}

// Singleton instance
export const googlePlacesService = new GooglePlacesService()
