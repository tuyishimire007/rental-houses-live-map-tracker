'use client'

import { useState } from 'react'
import { Property } from '@/types/property'
import { Button } from '@/components/ui/button'
import { X, MapPin, Phone, Mail, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

interface PropertyDetailDrawerProps {
  property: Property
  onClose: () => void
}

export default function PropertyDetailDrawer({ property, onClose }: PropertyDetailDrawerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = property.images || []
  const hasImages = images.length > 0

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Property Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Images */}
            {hasImages ? (
              <div className="relative">
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No images available</span>
              </div>
            )}

            {/* Property Info */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xl font-bold">{property.title}</h3>
                <p className="text-2xl font-bold text-indigo-600">
                  ${property.price.toLocaleString()}/month
                </p>
              </div>

              {property.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-600">{property.description}</p>
                </div>
              )}

              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}
                </span>
              </div>

              {/* Contact Info - This would need to be fetched from the owner profile */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>Contact owner for phone number</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>Contact owner for email</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  onClick={getDirections} 
                  className="w-full"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
                <Button 
                  onClick={() => {
                    // TODO: Implement contact owner functionality
                    alert('Contact owner functionality coming soon!')
                  }} 
                  className="w-full"
                >
                  Contact Owner
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
