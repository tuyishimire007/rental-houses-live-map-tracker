export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'owner' | 'renter' | 'admin'
          name: string | null
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'owner' | 'renter' | 'admin'
          name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'owner' | 'renter' | 'admin'
          name?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
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
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          latitude: number
          longitude: number
          price: number
          images?: string[] | null
          status?: 'available' | 'occupied' | 'pending_review'
          first_tenant_date?: string | null
          last_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          latitude?: number
          longitude?: number
          price?: number
          images?: string[] | null
          status?: 'available' | 'occupied' | 'pending_review'
          first_tenant_date?: string | null
          last_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      visit_confirmations: {
        Row: {
          id: string
          property_id: string
          renter_id: string
          arrived_at: string
          confirmed: boolean
          confirmation_timestamp: string | null
        }
        Insert: {
          id?: string
          property_id: string
          renter_id: string
          arrived_at: string
          confirmed: boolean
          confirmation_timestamp?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          renter_id?: string
          arrived_at?: string
          confirmed?: boolean
          confirmation_timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_confirmations_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_confirmations_renter_id_fkey"
            columns: ["renter_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
