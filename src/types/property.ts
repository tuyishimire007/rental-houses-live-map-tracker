export interface Property {
  id: string
  owner_id: string
  title: string
  description: string | null
  latitude: number
  longitude: number
  price: number
  images: string[] | null
  status: 'available' | 'occupied' | 'pending_review'
  first_tenant_date: string | null
  last_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface PropertyWithOwner extends Property {
  owner: {
    id: string
    name: string | null
    phone: string | null
    email: string | null
  }
}
