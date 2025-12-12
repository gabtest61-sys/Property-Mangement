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
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          business_name: string | null
          business_address: string | null
          tax_id: string | null
          is_premium: boolean
          premium_expires_at: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          business_name?: string | null
          business_address?: string | null
          tax_id?: string | null
          is_premium?: boolean
          premium_expires_at?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          business_name?: string | null
          business_address?: string | null
          tax_id?: string | null
          is_premium?: boolean
          premium_expires_at?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          name: string
          address: string
          city: string | null
          province: string | null
          postal_code: string | null
          type: 'apartment' | 'condo' | 'house' | 'boarding_house' | 'commercial'
          description: string | null
          amenities: string[] | null
          images: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          address: string
          city?: string | null
          province?: string | null
          postal_code?: string | null
          type: 'apartment' | 'condo' | 'house' | 'boarding_house' | 'commercial'
          description?: string | null
          amenities?: string[] | null
          images?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          address?: string
          city?: string | null
          province?: string | null
          postal_code?: string | null
          type?: 'apartment' | 'condo' | 'house' | 'boarding_house' | 'commercial'
          description?: string | null
          amenities?: string[] | null
          images?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: string
          property_id: string
          name: string
          floor: number | null
          bedrooms: number
          bathrooms: number
          area_sqm: number | null
          monthly_rent: number
          deposit_amount: number | null
          status: 'vacant' | 'occupied' | 'maintenance' | 'reserved'
          amenities: string[] | null
          images: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          name: string
          floor?: number | null
          bedrooms?: number
          bathrooms?: number
          area_sqm?: number | null
          monthly_rent: number
          deposit_amount?: number | null
          status?: 'vacant' | 'occupied' | 'maintenance' | 'reserved'
          amenities?: string[] | null
          images?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          name?: string
          floor?: number | null
          bedrooms?: number
          bathrooms?: number
          area_sqm?: number | null
          monthly_rent?: number
          deposit_amount?: number | null
          status?: 'vacant' | 'occupied' | 'maintenance' | 'reserved'
          amenities?: string[] | null
          images?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          owner_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string
          date_of_birth: string | null
          government_id_type: string | null
          government_id_number: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employer_name: string | null
          employer_address: string | null
          job_title: string | null
          monthly_income: number | null
          status: 'applying' | 'approved' | 'active' | 'inactive' | 'rejected'
          application_status: 'pending' | 'under_review' | 'documents_needed' | 'approved' | 'rejected' | null
          renting_rating: number
          id_document_url: string | null
          proof_of_income_url: string | null
          previous_landlord_reference: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone: string
          date_of_birth?: string | null
          government_id_type?: string | null
          government_id_number?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer_name?: string | null
          employer_address?: string | null
          job_title?: string | null
          monthly_income?: number | null
          status?: 'applying' | 'approved' | 'active' | 'inactive' | 'rejected'
          application_status?: 'pending' | 'under_review' | 'documents_needed' | 'approved' | 'rejected' | null
          renting_rating?: number
          id_document_url?: string | null
          proof_of_income_url?: string | null
          previous_landlord_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string
          date_of_birth?: string | null
          government_id_type?: string | null
          government_id_number?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer_name?: string | null
          employer_address?: string | null
          job_title?: string | null
          monthly_income?: number | null
          status?: 'applying' | 'approved' | 'active' | 'inactive' | 'rejected'
          application_status?: 'pending' | 'under_review' | 'documents_needed' | 'approved' | 'rejected' | null
          renting_rating?: number
          id_document_url?: string | null
          proof_of_income_url?: string | null
          previous_landlord_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contract_templates: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          type: 'month_to_month' | 'fixed_term' | 'bedspace' | 'boarding_house'
          content: string
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          type: 'month_to_month' | 'fixed_term' | 'bedspace' | 'boarding_house'
          content: string
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          type?: 'month_to_month' | 'fixed_term' | 'bedspace' | 'boarding_house'
          content?: string
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      leases: {
        Row: {
          id: string
          owner_id: string
          tenant_id: string
          unit_id: string
          template_id: string | null
          type: 'month_to_month' | 'fixed_term' | 'bedspace' | 'boarding_house'
          start_date: string
          end_date: string | null
          monthly_rent: number
          deposit_amount: number | null
          deposit_paid: boolean
          due_day: number
          late_fee_amount: number
          late_fee_grace_days: number
          status: 'pending' | 'pending_signature' | 'active' | 'expiring_soon' | 'expired' | 'terminated'
          landlord_signed_at: string | null
          tenant_signed_at: string | null
          landlord_signature_url: string | null
          tenant_signature_url: string | null
          contract_document_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          tenant_id: string
          unit_id: string
          template_id?: string | null
          type: 'month_to_month' | 'fixed_term' | 'bedspace' | 'boarding_house'
          start_date: string
          end_date?: string | null
          monthly_rent: number
          deposit_amount?: number | null
          deposit_paid?: boolean
          due_day?: number
          late_fee_amount?: number
          late_fee_grace_days?: number
          status?: 'pending' | 'pending_signature' | 'active' | 'expiring_soon' | 'expired' | 'terminated'
          landlord_signed_at?: string | null
          tenant_signed_at?: string | null
          landlord_signature_url?: string | null
          tenant_signature_url?: string | null
          contract_document_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          tenant_id?: string
          unit_id?: string
          template_id?: string | null
          type?: 'month_to_month' | 'fixed_term' | 'bedspace' | 'boarding_house'
          start_date?: string
          end_date?: string | null
          monthly_rent?: number
          deposit_amount?: number | null
          deposit_paid?: boolean
          due_day?: number
          late_fee_amount?: number
          late_fee_grace_days?: number
          status?: 'pending' | 'pending_signature' | 'active' | 'expiring_soon' | 'expired' | 'terminated'
          landlord_signed_at?: string | null
          tenant_signed_at?: string | null
          landlord_signature_url?: string | null
          tenant_signature_url?: string | null
          contract_document_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          owner_id: string
          lease_id: string
          tenant_id: string
          invoice_number: string | null
          billing_period_start: string
          billing_period_end: string
          due_date: string
          rent_amount: number
          utilities_amount: number
          late_fee_amount: number
          other_charges: number
          discount_amount: number
          total_amount: number
          amount_paid: number
          status: 'draft' | 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          notes: string | null
          line_items: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          lease_id: string
          tenant_id: string
          invoice_number?: string | null
          billing_period_start: string
          billing_period_end: string
          due_date: string
          rent_amount: number
          utilities_amount?: number
          late_fee_amount?: number
          other_charges?: number
          discount_amount?: number
          total_amount: number
          amount_paid?: number
          status?: 'draft' | 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          notes?: string | null
          line_items?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          lease_id?: string
          tenant_id?: string
          invoice_number?: string | null
          billing_period_start?: string
          billing_period_end?: string
          due_date?: string
          rent_amount?: number
          utilities_amount?: number
          late_fee_amount?: number
          other_charges?: number
          discount_amount?: number
          total_amount?: number
          amount_paid?: number
          status?: 'draft' | 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          notes?: string | null
          line_items?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          owner_id: string
          invoice_id: string
          tenant_id: string
          amount: number
          payment_method: 'cash' | 'bank_transfer' | 'gcash' | 'maya' | 'credit_card' | 'check' | 'other' | null
          payment_date: string
          reference_number: string | null
          status: 'pending' | 'confirmed' | 'failed' | 'refunded'
          proof_url: string | null
          notes: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          invoice_id: string
          tenant_id: string
          amount: number
          payment_method?: 'cash' | 'bank_transfer' | 'gcash' | 'maya' | 'credit_card' | 'check' | 'other' | null
          payment_date: string
          reference_number?: string | null
          status?: 'pending' | 'confirmed' | 'failed' | 'refunded'
          proof_url?: string | null
          notes?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          invoice_id?: string
          tenant_id?: string
          amount?: number
          payment_method?: 'cash' | 'bank_transfer' | 'gcash' | 'maya' | 'credit_card' | 'check' | 'other' | null
          payment_date?: string
          reference_number?: string | null
          status?: 'pending' | 'confirmed' | 'failed' | 'refunded'
          proof_url?: string | null
          notes?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          owner_id: string
          tenant_id: string
          property_id: string | null
          last_message_at: string
          last_message_preview: string | null
          owner_unread_count: number
          tenant_unread_count: number
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          tenant_id: string
          property_id?: string | null
          last_message_at?: string
          last_message_preview?: string | null
          owner_unread_count?: number
          tenant_unread_count?: number
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          tenant_id?: string
          property_id?: string | null
          last_message_at?: string
          last_message_preview?: string | null
          owner_unread_count?: number
          tenant_unread_count?: number
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_type: 'owner' | 'tenant'
          sender_id: string
          content: string | null
          message_type: 'text' | 'image' | 'file' | 'voice' | 'location' | 'system'
          attachment_url: string | null
          attachment_name: string | null
          attachment_size: number | null
          attachment_type: string | null
          is_read: boolean
          read_at: string | null
          is_deleted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_type: 'owner' | 'tenant'
          sender_id: string
          content?: string | null
          message_type?: 'text' | 'image' | 'file' | 'voice' | 'location' | 'system'
          attachment_url?: string | null
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          is_read?: boolean
          read_at?: string | null
          is_deleted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_type?: 'owner' | 'tenant'
          sender_id?: string
          content?: string | null
          message_type?: 'text' | 'image' | 'file' | 'voice' | 'location' | 'system'
          attachment_url?: string | null
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          is_read?: boolean
          read_at?: string | null
          is_deleted?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'payment' | 'contract' | 'message' | 'maintenance' | 'reminder' | 'system'
          title: string
          message: string
          link: string | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'payment' | 'contract' | 'message' | 'maintenance' | 'reminder' | 'system'
          title: string
          message: string
          link?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'payment' | 'contract' | 'message' | 'maintenance' | 'reminder' | 'system'
          title?: string
          message?: string
          link?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      maintenance_requests: {
        Row: {
          id: string
          owner_id: string
          tenant_id: string
          unit_id: string
          title: string
          description: string
          category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other' | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          images: string[] | null
          resolved_at: string | null
          resolution_notes: string | null
          cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          tenant_id: string
          unit_id: string
          title: string
          description: string
          category?: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other' | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          images?: string[] | null
          resolved_at?: string | null
          resolution_notes?: string | null
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          tenant_id?: string
          unit_id?: string
          title?: string
          description?: string
          category?: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other' | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          images?: string[] | null
          resolved_at?: string | null
          resolution_notes?: string | null
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          owner_id: string
          activity_type: string
          description: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          activity_type: string
          description: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          activity_type?: string
          description?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
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

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type Unit = Database['public']['Tables']['units']['Row']
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type ContractTemplate = Database['public']['Tables']['contract_templates']['Row']
export type Lease = Database['public']['Tables']['leases']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type UnitInsert = Database['public']['Tables']['units']['Insert']
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type LeaseInsert = Database['public']['Tables']['leases']['Insert']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']
export type UnitUpdate = Database['public']['Tables']['units']['Update']
export type TenantUpdate = Database['public']['Tables']['tenants']['Update']
export type LeaseUpdate = Database['public']['Tables']['leases']['Update']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

// Extended types with relations
export type PropertyWithUnits = Property & {
  units: Unit[]
}

export type TenantWithLease = Tenant & {
  leases: (Lease & {
    unit: Unit & {
      property: Property
    }
  })[]
}

export type LeaseWithDetails = Lease & {
  tenant: Tenant
  unit: Unit & {
    property: Property
  }
}

export type InvoiceWithDetails = Invoice & {
  tenant: Tenant
  lease: Lease & {
    unit: Unit & {
      property: Property
    }
  }
}

export type ConversationWithDetails = Conversation & {
  tenant: Tenant
  property: Property | null
  messages: Message[]
}
