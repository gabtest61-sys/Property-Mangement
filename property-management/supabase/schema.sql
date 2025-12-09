-- PropManager Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  business_name TEXT,
  business_address TEXT,
  tax_id TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROPERTIES & UNITS
-- =============================================

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  type TEXT NOT NULL CHECK (type IN ('apartment', 'condo', 'house', 'boarding_house', 'commercial')),
  description TEXT,
  amenities TEXT[], -- Array of amenities
  images TEXT[], -- Array of image URLs
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units/Rooms within properties
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Unit 101", "Room A"
  floor INTEGER,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  area_sqm DECIMAL(10,2),
  monthly_rent DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  status TEXT DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'maintenance', 'reserved')),
  amenities TEXT[],
  images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TENANTS
-- =============================================

-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  government_id_type TEXT,
  government_id_number TEXT,
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  -- Employment info
  employer_name TEXT,
  employer_address TEXT,
  job_title TEXT,
  monthly_income DECIMAL(10,2),
  -- Tenant status
  status TEXT DEFAULT 'applying' CHECK (status IN ('applying', 'approved', 'active', 'inactive', 'rejected')),
  application_status TEXT CHECK (application_status IN ('pending', 'under_review', 'documents_needed', 'approved', 'rejected')),
  renting_rating INTEGER DEFAULT 70 CHECK (renting_rating >= 0 AND renting_rating <= 100),
  -- Documents (URLs)
  id_document_url TEXT,
  proof_of_income_url TEXT,
  previous_landlord_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LEASES & CONTRACTS
-- =============================================

-- Contract templates
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('month_to_month', 'fixed_term', 'bedspace', 'boarding_house')),
  content TEXT NOT NULL, -- HTML or Markdown template
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leases/Contracts
CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  template_id UUID REFERENCES contract_templates(id),
  -- Contract details
  type TEXT NOT NULL CHECK (type IN ('month_to_month', 'fixed_term', 'bedspace', 'boarding_house')),
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_rent DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  deposit_paid BOOLEAN DEFAULT FALSE,
  -- Payment terms
  due_day INTEGER DEFAULT 1 CHECK (due_day >= 1 AND due_day <= 28),
  late_fee_amount DECIMAL(10,2) DEFAULT 0,
  late_fee_grace_days INTEGER DEFAULT 5,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pending_signature', 'active', 'expiring_soon', 'expired', 'terminated')),
  -- Signatures
  landlord_signed_at TIMESTAMPTZ,
  tenant_signed_at TIMESTAMPTZ,
  landlord_signature_url TEXT,
  tenant_signature_url TEXT,
  -- Document
  contract_document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BILLING & PAYMENTS
-- =============================================

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  -- Invoice details
  invoice_number TEXT UNIQUE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  -- Amounts
  rent_amount DECIMAL(10,2) NOT NULL,
  utilities_amount DECIMAL(10,2) DEFAULT 0,
  late_fee_amount DECIMAL(10,2) DEFAULT 0,
  other_charges DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled')),
  -- Notes
  notes TEXT,
  line_items JSONB, -- For additional charges breakdown
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'gcash', 'maya', 'credit_card', 'check', 'other')),
  payment_date DATE NOT NULL,
  reference_number TEXT,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
  -- Proof
  proof_url TEXT,
  notes TEXT,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Utility readings (for tracking utilities)
CREATE TABLE utility_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  utility_type TEXT NOT NULL CHECK (utility_type IN ('electricity', 'water', 'gas', 'internet')),
  reading_date DATE NOT NULL,
  previous_reading DECIMAL(10,2),
  current_reading DECIMAL(10,2) NOT NULL,
  rate_per_unit DECIMAL(10,4),
  total_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MESSAGING
-- =============================================

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  owner_unread_count INTEGER DEFAULT 0,
  tenant_unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('owner', 'tenant')),
  sender_id UUID NOT NULL, -- References either profiles.id or tenants.id based on sender_type
  -- Content
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice', 'location', 'system')),
  -- Attachments
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_size INTEGER,
  attachment_type TEXT,
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment', 'contract', 'message', 'maintenance', 'reminder', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MAINTENANCE REQUESTS
-- =============================================

CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  -- Request details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  -- Images
  images TEXT[],
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ACTIVITY LOG
-- =============================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  entity_type TEXT, -- 'property', 'tenant', 'payment', etc.
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_tenants_owner ON tenants(owner_id);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_leases_owner ON leases(owner_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_unit ON leases(unit_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_invoices_owner ON invoices(owner_id);
CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX idx_activity_log_owner ON activity_log(owner_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own properties" ON properties FOR DELETE USING (auth.uid() = owner_id);

-- Units policies
CREATE POLICY "Users can view own units" ON units FOR SELECT
  USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = units.property_id AND properties.owner_id = auth.uid()));
CREATE POLICY "Users can insert own units" ON units FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = units.property_id AND properties.owner_id = auth.uid()));
CREATE POLICY "Users can update own units" ON units FOR UPDATE
  USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = units.property_id AND properties.owner_id = auth.uid()));
CREATE POLICY "Users can delete own units" ON units FOR DELETE
  USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = units.property_id AND properties.owner_id = auth.uid()));

-- Tenants policies
CREATE POLICY "Users can view own tenants" ON tenants FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own tenants" ON tenants FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own tenants" ON tenants FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own tenants" ON tenants FOR DELETE USING (auth.uid() = owner_id);

-- Contract templates policies
CREATE POLICY "Users can view own templates" ON contract_templates FOR SELECT
  USING (auth.uid() = owner_id OR owner_id IS NULL);
CREATE POLICY "Users can insert own templates" ON contract_templates FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own templates" ON contract_templates FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own templates" ON contract_templates FOR DELETE USING (auth.uid() = owner_id);

-- Leases policies
CREATE POLICY "Users can view own leases" ON leases FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own leases" ON leases FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own leases" ON leases FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own leases" ON leases FOR DELETE USING (auth.uid() = owner_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own invoices" ON invoices FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own invoices" ON invoices FOR DELETE USING (auth.uid() = owner_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own payments" ON payments FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own payments" ON payments FOR DELETE USING (auth.uid() = owner_id);

-- Utility readings policies
CREATE POLICY "Users can view own utility readings" ON utility_readings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM units
    JOIN properties ON properties.id = units.property_id
    WHERE units.id = utility_readings.unit_id AND properties.owner_id = auth.uid()
  ));
CREATE POLICY "Users can insert own utility readings" ON utility_readings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM units
    JOIN properties ON properties.id = units.property_id
    WHERE units.id = utility_readings.unit_id AND properties.owner_id = auth.uid()
  ));

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = owner_id);

-- Messages policies
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.owner_id = auth.uid()));
CREATE POLICY "Users can insert messages in own conversations" ON messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.owner_id = auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Maintenance requests policies
CREATE POLICY "Users can view own maintenance requests" ON maintenance_requests FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own maintenance requests" ON maintenance_requests FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own maintenance requests" ON maintenance_requests FOR UPDATE USING (auth.uid() = owner_id);

-- Activity log policies
CREATE POLICY "Users can view own activity log" ON activity_log FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own activity log" ON activity_log FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON contract_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number = 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(nextval('invoice_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Trigger for invoice number generation
CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    owner_unread_count = CASE WHEN NEW.sender_type = 'tenant' THEN owner_unread_count + 1 ELSE owner_unread_count END,
    tenant_unread_count = CASE WHEN NEW.sender_type = 'owner' THEN tenant_unread_count + 1 ELSE tenant_unread_count END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Function to update unit status when lease is created/updated
CREATE OR REPLACE FUNCTION update_unit_status_on_lease()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE units SET status = 'occupied' WHERE id = NEW.unit_id;
  ELSIF NEW.status IN ('expired', 'terminated') THEN
    UPDATE units SET status = 'vacant' WHERE id = NEW.unit_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_lease_status_change
  AFTER INSERT OR UPDATE OF status ON leases
  FOR EACH ROW EXECUTE FUNCTION update_unit_status_on_lease();

-- =============================================
-- DEFAULT DATA (Contract Templates)
-- =============================================

INSERT INTO contract_templates (id, owner_id, name, type, content, is_default) VALUES
(uuid_generate_v4(), NULL, 'Standard Month-to-Month Lease', 'month_to_month',
'# MONTH-TO-MONTH RENTAL AGREEMENT

This Rental Agreement is entered into between **{{landlord_name}}** ("Landlord") and **{{tenant_name}}** ("Tenant").

## PROPERTY
Address: {{property_address}}
Unit: {{unit_name}}

## TERMS
- Monthly Rent: ₱{{monthly_rent}}
- Security Deposit: ₱{{deposit_amount}}
- Due Date: {{due_day}} of each month
- Late Fee: ₱{{late_fee}} after {{grace_days}} days

## SIGNATURES
Landlord: _________________ Date: _______
Tenant: _________________ Date: _______', TRUE),

(uuid_generate_v4(), NULL, 'Fixed-Term Lease (1 Year)', 'fixed_term',
'# FIXED-TERM RENTAL AGREEMENT

This Rental Agreement is entered into between **{{landlord_name}}** ("Landlord") and **{{tenant_name}}** ("Tenant").

## PROPERTY
Address: {{property_address}}
Unit: {{unit_name}}

## LEASE TERM
Start Date: {{start_date}}
End Date: {{end_date}}

## TERMS
- Monthly Rent: ₱{{monthly_rent}}
- Security Deposit: ₱{{deposit_amount}}
- Due Date: {{due_day}} of each month

## SIGNATURES
Landlord: _________________ Date: _______
Tenant: _________________ Date: _______', TRUE),

(uuid_generate_v4(), NULL, 'Bedspace Agreement', 'bedspace',
'# BEDSPACE RENTAL AGREEMENT

This Agreement is for the rental of a bedspace at the property described below.

## PROPERTY
Address: {{property_address}}
Room/Unit: {{unit_name}}

## TERMS
- Monthly Rate: ₱{{monthly_rent}}
- Deposit: ₱{{deposit_amount}}

## HOUSE RULES
1. Quiet hours: 10 PM - 6 AM
2. No smoking inside the premises
3. Visitors allowed until 9 PM only

## SIGNATURES
Landlord: _________________ Date: _______
Tenant: _________________ Date: _______', TRUE),

(uuid_generate_v4(), NULL, 'Boarding House Agreement', 'boarding_house',
'# BOARDING HOUSE AGREEMENT

## PARTIES
Landlord: {{landlord_name}}
Boarder: {{tenant_name}}

## ACCOMMODATION
Address: {{property_address}}
Room: {{unit_name}}

## PAYMENT TERMS
- Monthly Rate: ₱{{monthly_rent}}
- Includes: Water, Electricity (up to {{utility_allowance}} kWh)
- Due Date: {{due_day}} of each month

## HOUSE RULES
1. Curfew: 11 PM
2. No overnight guests
3. Keep common areas clean

## SIGNATURES
Landlord: _________________ Date: _______
Boarder: _________________ Date: _______', TRUE);
