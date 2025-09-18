'use client'

import { Property } from '@/types/property'

interface PropertyMarkerProps {
  position: { lat: number; lng: number }
  map: google.maps.Map
  property: Property
  onClick: () => void
}

export default class PropertyMarker {
  private marker: google.maps.Marker
  private property: Property
  private onClick: () => void

  constructor({ position, map, property, onClick }: PropertyMarkerProps) {
    this.property = property
    this.onClick = onClick

    // Create custom marker element
    const markerElement = document.createElement('div')
    markerElement.setAttribute('data-property-marker', 'true')
    markerElement.className = 'property-marker'
    markerElement.innerHTML = `
      <div class="relative">
        <div class="w-8 h-8 bg-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          <div class="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-indigo-600"></div>
      </div>
    `

    // Add click listener
    markerElement.addEventListener('click', () => {
      this.onClick()
    })

    // Create marker
    this.marker = new google.maps.Marker({
      position,
      map,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#4F46E5" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      },
      title: property.title
    })

    // Add click listener to marker
    this.marker.addListener('click', () => {
      this.onClick()
    })

    // Add hover effect
    this.marker.addListener('mouseover', () => {
      this.marker.setIcon({
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="15" fill="#4F46E5" stroke="white" stroke-width="3"/>
            <circle cx="20" cy="20" r="5" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
      })
    })

    this.marker.addListener('mouseout', () => {
      this.marker.setIcon({
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#4F46E5" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      })
    })
  }

  getMarker() {
    return this.marker
  }

  getProperty() {
    return this.property
  }
}
