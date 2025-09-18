'use client'

import { useState, useEffect } from 'react'
import GoogleMap from '@/components/map/GoogleMap'
import { Button } from '@/components/ui/button'
import { MapPin, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationPermission('granted')
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationPermission('denied')
        }
      )
    } else {
      setLocationPermission('denied')
    }
  }, [])

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationPermission('granted')
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationPermission('denied')
        }
      )
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Rental Tracker</h1>
          <p className="text-gray-600 mb-6">Please sign in to view available rental properties</p>
          <Button onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Rental Tracker</h1>
            {locationPermission === 'denied' && (
              <Button
                onClick={requestLocation}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <MapPin className="h-4 w-4" />
                <span>Enable Location</span>
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="pt-16 h-full">
        <GoogleMap
          userLocation={userLocation || undefined}
          onLocationChange={(location) => {
            // Handle location changes if needed
            console.log('Location changed:', location)
          }}
        />
      </div>

      {/* Location permission prompt */}
      {locationPermission === 'denied' && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Location access needed
                </p>
                <p className="text-xs text-gray-600">
                  Enable location to see properties near you
                </p>
              </div>
              <Button onClick={requestLocation} size="sm">
                Enable
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}