'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Town {
  id: string
  name: string
  region: string
  currentDate: string
  currentTime: string
  timeSpeed: number
  weather: string
  temperature: number
  season: string
  isHoliday: boolean
  holidayName?: string
}

interface Place {
  id: string
  name: string
  address?: string
  lat: number
  lng: number
  placeType: string
  description?: string
  rating?: number
}

interface Character {
  id: string
  name: string
  avatar?: string
  age: number
  occupation: string
  bio?: string
  currentStatus: string
  currentMood: string
  lat: number
  lng: number
}

interface TownContextType {
  town: Town | null
  places: Place[]
  characters: Character[]
  currentTime: Date
  isLoading: boolean
  error: string | null
  refreshTown: () => Promise<void>
  updateTimeSpeed: (speed: number) => Promise<void>
}

const TownContext = createContext<TownContextType | undefined>(undefined)

export function TownProvider({ children }: { children: ReactNode }) {
  const [town, setTown] = useState<Town | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    fetchTownData()
  }, [])

  // Time progression
  useEffect(() => {
    if (!town) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = new Date(prev)
        // Add time based on speed (1 real second = X game seconds)
        const secondsToAdd = town.timeSpeed
        newTime.setSeconds(newTime.getSeconds() + secondsToAdd)
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [town?.timeSpeed])

  const fetchTownData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch town
      const townRes = await fetch('/api/town')
      if (!townRes.ok) throw new Error('Failed to fetch town')
      const townData = await townRes.json()
      setTown(townData)
      setCurrentTime(new Date(townData.currentDate))

      // Fetch places
      const placesRes = await fetch('/api/places')
      if (placesRes.ok) {
        const placesData = await placesRes.json()
        setPlaces(placesData)
      }

      // Fetch characters
      const charsRes = await fetch('/api/characters')
      if (charsRes.ok) {
        const charsData = await charsRes.json()
        setCharacters(charsData.map((c: any) => ({
          ...c,
          lat: c.homeLocation?.lat || 34.1425,
          lng: c.homeLocation?.lng || -118.2551,
        })))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const updateTimeSpeed = async (speed: number) => {
    try {
      const res = await fetch('/api/town', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSpeed: speed }),
      })
      if (!res.ok) throw new Error('Failed to update time speed')
      const updated = await res.json()
      setTown(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const refreshTown = fetchTownData

  return (
    <TownContext.Provider
      value={{
        town,
        places,
        characters,
        currentTime,
        isLoading,
        error,
        refreshTown,
        updateTimeSpeed,
      }}
    >
      {children}
    </TownContext.Provider>
  )
}

export function useTown() {
  const context = useContext(TownContext)
  if (context === undefined) {
    throw new Error('useTown must be used within a TownProvider')
  }
  return context
}
