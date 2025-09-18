'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { createClient } from '@/lib/supabase/client'
import PropertyMarker from './PropertyMarker'
import PropertyDetailDrawer from './PropertyDetailDrawer'
import { Property } from '@/types/property'

interface GoogleMapProps {
  userLocation?: { lat: number; lng: number }
  onLocationChange?: (location: { lat: number; lng: number }) => void
}

export default function GoogleMap({ userLocation, onLocationChange }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if API key exists
        console.log('Google Maps API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing')
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          throw new Error('Google Maps API key not found. Please check your environment variables.')
        }

        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places']
        })

        const { Map } = await loader.importLibrary('maps')
        
        if (mapRef.current) {
          const mapInstance = new Map(mapRef.current, {
            center: userLocation || { lat: 40.7128, lng: -74.0060 }, // Default to NYC
            zoom: 13,
            mapTypeId: 'roadmap',
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ],
            // Optimize map performance
            gestureHandling: 'greedy',
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true
          })

          mapInstanceRef.current = mapInstance
          setMap(mapInstance)

          // Add click listener for map clicks
          mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const location = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              }
              onLocationChange?.(location)
            }
          })

          setLoading(false)
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err)
        setError(err instanceof Error ? err.message : 'Failed to load map')
        setLoading(false)
      }
    }

    initMap()
  }, [userLocation, onLocationChange])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoadingProperties(true)
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'available')

        if (error) throw error
        setProperties(data || [])
      } catch (err) {
        console.error('Error fetching properties:', err)
        // Don't set error for properties, just log it
        console.warn('Properties will load when available')
      } finally {
        setLoadingProperties(false)
      }
    }

    // Fetch properties after map loads
    if (map) {
      fetchProperties()
    }
  }, [supabase, map])

  useEffect(() => {
    if (map && properties.length > 0) {
      // Clear existing markers
      const markers = document.querySelectorAll('[data-property-marker]')
      markers.forEach(marker => marker.remove())

      // Add new markers
      properties.forEach(property => {
        const marker = new PropertyMarker({
          position: { lat: property.latitude, lng: property.longitude },
          map,
          property,
          onClick: () => setSelectedProperty(property)
        })
      })
    }
  }, [map, properties])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading map...</p>
          <p className="mt-1 text-xs text-gray-500">This may take a few moments</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Loading Error</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Properties loading indicator */}
      {loadingProperties && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          <span className="text-sm text-gray-600">Loading properties...</span>
        </div>
      )}
      
      {selectedProperty && (
        <PropertyDetailDrawer
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  )
}
