'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import PropertyMarker from './PropertyMarker'
import PropertyDetailDrawer from './PropertyDetailDrawer'
import { Property } from '@/types/property'

type Property = Database['public']['Tables']['properties']['Row']

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
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
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
            ]
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
        setError('Failed to load map')
        setLoading(false)
      }
    }

    initMap()
  }, [userLocation, onLocationChange])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'available')

        if (error) throw error
        setProperties(data || [])
      } catch (err) {
        console.error('Error fetching properties:', err)
        setError('Failed to load properties')
      }
    }

    fetchProperties()
  }, [supabase])

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
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />
      {selectedProperty && (
        <PropertyDetailDrawer
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  )
}
