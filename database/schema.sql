-- =====================================================
-- Matrix Equipment Finance - Database Schema
-- PostgreSQL 14+
-- Version: 1.0
-- Date: 2026-01-31
-- =====================================================
--
-- This schema supports all entity types:
-- - Sole Trader
-- - Company
-- - Trust (Individual Trustee)
-- - Trust (Company Trustee)
--
-- Design Principles:
-- - Normalized structure for data integrity
-- - Flexible contact model (directors, trustees, beneficiaries)
-- - Audit trail for all critical operations
-- - Ready for bi-directional CRM sync
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable trigram extension (for text search indexes)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE entity_type AS ENUM (
  'sole_trader',
  'company',
  'partnership',
  'trust_individual_trustee',
  'trust_company_trustee'
);

CREATE TYPE finance_product AS ENUM (
  'chattel_mortgage',
  'rental_lease'
);

CREATE TYPE application_status AS ENUM (
  'incomplete',
  'submitted',
  'under_review',
  'approved',
  'declined',
  'awaiting_signature',
  'signed',
  'settled'
);

CREATE TYPE contact_role AS ENUM (
  'primary_applicant',
  'director',
  'trustee',
  'trustee_director',
  'beneficiary',
  'partner'
);

CREATE TYPE residency_status AS ENUM (
  'australian_citizen',
  'permanent_resident',
  'temporary_visa_holder'
);

CREATE TYPE document_type AS ENUM (
  'drivers_license_front',
  'drivers_license_back',
  'medicare_card',
  'bank_statement',
  'financial_statement',
  'equipment_quote',
  'signed_contract',
  'privacy_consent',
  'credit_authorization',
  'direct_debit_authority',
  'other'
);

CREATE TYPE document_status AS ENUM (
  'pending',
  'uploaded',
  'verified',
  'rejected'
);

CREATE TYPE esign_status AS ENUM (
  'pending',
  'sent',
  'viewed',
  'signed',
  'declined',
  'expired',
  'error'
);

CREATE TYPE sync_status AS ENUM (
  'pending',
  'in_progress',
  'success',
  'failed',
  'retry'
);

-- =====================================================
-- STAFF & AUTHENTICATION
-- =====================================================

-- Staff users (admin dashboard access)
CREATE TABLE staff_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255), -- For future password auth if needed
  is_active BOOLEAN DEFAULT true,
  role VARCHAR(50) DEFAULT 'staff', -- staff, admin, manager
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OTP codes for applicant authentication
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(4) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_email_code ON otp_codes(email, code);
CREATE INDEX idx_otp_expires ON otp_codes(expires_at);

-- Magic link sessions
CREATE TABLE magic_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  application_id UUID, -- NULL for new applications
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_magic_token ON magic_links(token);
CREATE INDEX idx_magic_expires ON magic_links(expires_at);

-- Active sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  application_id UUID,
  staff_user_id UUID REFERENCES staff_users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_token ON sessions(session_token);
CREATE INDEX idx_session_expires ON sessions(expires_at);

-- =====================================================
-- ADMIN CONFIGURATION
-- =====================================================

-- Rate bands configuration
CREATE TABLE rate_bands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  min_amount DECIMAL(12, 2) NOT NULL,
  max_amount DECIMAL(12, 2) NOT NULL,
  annual_rate DECIMAL(5, 4) NOT NULL, -- e.g., 0.1595 for 15.95%
  is_active BOOLEAN DEFAULT true,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES staff_users(id),
  CHECK (min_amount < max_amount),
  CHECK (annual_rate >= 0)
);

-- Available loan terms
CREATE TABLE loan_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  months INTEGER UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CHECK (months > 0)
);

-- Application fee configuration
CREATE TABLE app_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES staff_users(id)
);

-- =====================================================
-- APPLICATIONS
-- =====================================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identification
  application_number VARCHAR(50) UNIQUE, -- Auto-generated: MX-YYYYMMDD-XXXX

  -- Status & Assignment
  status application_status DEFAULT 'incomplete',
  assigned_to UUID REFERENCES staff_users(id),

  -- Calculator & Product Selection
  finance_product finance_product,
  equipment_categories TEXT[], -- Array of selected categories
  invoice_amount DECIMAL(12, 2), -- Equipment cost
  term_months INTEGER,
  application_fee DECIMAL(12, 2) DEFAULT 495.00,
  amount_financed DECIMAL(12, 2), -- invoice_amount + application_fee
  balloon_amount DECIMAL(12, 2) DEFAULT 0.00,
  monthly_payment DECIMAL(12, 2),
  annual_rate DECIMAL(5, 4), -- Applied rate from rate bands

  -- Business/Entity Details
  entity_type entity_type,
  abn VARCHAR(11), -- Stored without spaces
  acn VARCHAR(9), -- For companies
  business_name VARCHAR(255),
  trading_name VARCHAR(255),
  gst_registered BOOLEAN,
  gst_registered_date DATE,

  -- Business Address
  business_street_address VARCHAR(255),
  business_city VARCHAR(100),
  business_state VARCHAR(3), -- NSW, VIC, QLD, SA, WA, TAS, NT, ACT
  business_postcode VARCHAR(4),
  business_phone VARCHAR(20),

  -- Trust-Specific Fields
  trust_abn VARCHAR(11), -- For trust entity types
  trustee_company_abn VARCHAR(11), -- For trust with company trustee
  trustee_company_acn VARCHAR(9), -- For trust with company trustee
  trustee_company_name VARCHAR(255), -- For trust with company trustee

  -- ABN Lookup Metadata
  abn_lookup_verified_at TIMESTAMP WITH TIME ZONE,
  abn_lookup_response JSONB, -- Store full API response

  -- Financial Position Summary
  total_assets DECIMAL(12, 2),
  total_liabilities DECIMAL(12, 2),
  net_position DECIMAL(12, 2), -- Calculated: total_assets - total_liabilities

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  settled_at TIMESTAMP WITH TIME ZONE,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by_email VARCHAR(255), -- Applicant email

  -- Constraints
  CHECK (invoice_amount >= 10000 AND invoice_amount <= 500000),
  CHECK (amount_financed = invoice_amount + application_fee),
  CHECK (term_months IN (24, 36, 48, 60))
);

-- Financial position details
CREATE TABLE financial_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  -- Assets
  home_value DECIMAL(12, 2) DEFAULT 0,
  investment_property_value DECIMAL(12, 2) DEFAULT 0,
  cash_at_bank DECIMAL(12, 2) DEFAULT 0,
  vehicles_value DECIMAL(12, 2) DEFAULT 0,
  home_contents_value DECIMAL(12, 2) DEFAULT 0,
  investments_shares_value DECIMAL(12, 2) DEFAULT 0,
  other_assets_value DECIMAL(12, 2) DEFAULT 0,

  -- Liabilities
  mortgage_home DECIMAL(12, 2) DEFAULT 0,
  mortgage_investment DECIMAL(12, 2) DEFAULT 0,
  vehicle_loan DECIMAL(12, 2) DEFAULT 0,
  credit_cards DECIMAL(12, 2) DEFAULT 0,
  other_liabilities DECIMAL(12, 2) DEFAULT 0,

  -- Calculated totals
  total_assets DECIMAL(12, 2) GENERATED ALWAYS AS (
    home_value + investment_property_value + cash_at_bank +
    vehicles_value + home_contents_value + investments_shares_value +
    other_assets_value
  ) STORED,

  total_liabilities DECIMAL(12, 2) GENERATED ALWAYS AS (
    mortgage_home + mortgage_investment + vehicle_loan +
    credit_cards + other_liabilities
  ) STORED,

  net_position DECIMAL(12, 2) GENERATED ALWAYS AS (
    (home_value + investment_property_value + cash_at_bank +
     vehicles_value + home_contents_value + investments_shares_value +
     other_assets_value) -
    (mortgage_home + mortgage_investment + vehicle_loan +
     credit_cards + other_liabilities)
  ) STORED,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (application_id)
);

-- =====================================================
-- CONTACTS (Directors, Trustees, Beneficiaries, etc.)
-- =====================================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  -- Role & Order
  role contact_role NOT NULL,
  contact_order INTEGER DEFAULT 1, -- 1 = primary, 2-4 = additional
  is_primary BOOLEAN DEFAULT false, -- Primary contact for the role

  -- Personal Details
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile_number VARCHAR(20),
  date_of_birth DATE,
  residency_status residency_status,

  -- Residential Address
  residential_street_address VARCHAR(255),
  residential_city VARCHAR(100),
  residential_state VARCHAR(3),
  residential_postcode VARCHAR(4),

  -- Metadata
  data_edited_from_prefill BOOLEAN DEFAULT false, -- Track if user edited pre-filled data

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_application ON contacts(application_id);
CREATE INDEX idx_contacts_role ON contacts(role);

-- =====================================================
-- DOCUMENTS
-- =====================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- Link to specific contact if applicable

  -- Document Details
  document_type document_type NOT NULL,
  status document_status DEFAULT 'pending',

  -- File Information
  original_filename VARCHAR(255),
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),

  -- Storage
  s3_bucket VARCHAR(100),
  s3_key VARCHAR(500), -- Full S3 path
  s3_url TEXT, -- Presigned URL or CDN URL

  -- Bank Statement Specifics
  bank_statement_month DATE, -- First day of the month covered
  retrieved_via_open_banking BOOLEAN DEFAULT false,

  -- Verification
  uploaded_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES staff_users(id),
  rejection_reason TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_application ON documents(application_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);

-- =====================================================
-- E-SIGNATURES (Dropbox Sign Integration)
-- =====================================================

CREATE TABLE esign_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  -- Dropbox Sign Details
  signature_request_id VARCHAR(255) UNIQUE, -- HelloSign signature_request_id
  template_id VARCHAR(255), -- HelloSign template_id

  -- Status
  status esign_status DEFAULT 'pending',

  -- Signers
  signers JSONB, -- Array of signer details

  -- Document
  document_title VARCHAR(255),
  document_subject TEXT,

  -- URLs
  signing_url TEXT, -- Embedded signing URL
  files_url TEXT, -- URL to download signed files

  -- Webhook Events
  webhook_events JSONB[], -- Array of webhook event payloads

  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  expired_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_esign_application ON esign_requests(application_id);
CREATE INDEX idx_esign_request_id ON esign_requests(signature_request_id);
CREATE INDEX idx_esign_status ON esign_requests(status);

-- =====================================================
-- CRM SYNC (Findesk Integration)
-- =====================================================

CREATE TABLE crm_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  -- Sync Details
  sync_type VARCHAR(50), -- 'create', 'update', 'status_change', 'document_added'
  status sync_status DEFAULT 'pending',

  -- Findesk Reference
  findesk_id VARCHAR(255), -- Findesk's internal ID for this application

  -- Request/Response
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,

  -- Retry Logic
  attempt_count INTEGER DEFAULT 1,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  max_retries INTEGER DEFAULT 3,

  -- Timestamps
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crm_sync_application ON crm_sync_log(application_id);
CREATE INDEX idx_crm_sync_status ON crm_sync_log(status);
CREATE INDEX idx_crm_sync_retry ON crm_sync_log(next_retry_at) WHERE status = 'retry';

-- =====================================================
-- CALCULATOR HISTORY (Optional - for analytics)
-- =====================================================

CREATE TABLE calculator_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID, -- Track calculations before application creation
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,

  -- Calculator Type
  calculator_type VARCHAR(50), -- 'payment', 'rate', 'loan_amount'

  -- Inputs
  invoice_amount DECIMAL(12, 2),
  term_months INTEGER,
  desired_payment DECIMAL(12, 2),
  annual_rate DECIMAL(5, 4),

  -- Output
  result DECIMAL(12, 2),

  -- Metadata
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calc_session ON calculator_history(session_id);
CREATE INDEX idx_calc_application ON calculator_history(application_id);

-- =====================================================
-- AUDIT LOG
-- =====================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Entity
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,

  -- Action
  action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'

  -- Changes
  old_values JSONB,
  new_values JSONB,

  -- Actor
  staff_user_id UUID REFERENCES staff_users(id),
  applicant_email VARCHAR(255),

  -- Context
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Applications - frequently queried fields
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_entity_type ON applications(entity_type);
CREATE INDEX idx_applications_abn ON applications(abn);
CREATE INDEX idx_applications_assigned_to ON applications(assigned_to);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at DESC) WHERE submitted_at IS NOT NULL;

-- Search optimization
CREATE INDEX idx_applications_business_name_trgm ON applications USING gin(business_name gin_trgm_ops);
CREATE INDEX idx_applications_trading_name_trgm ON applications USING gin(trading_name gin_trgm_ops);

-- Contacts - search by email
CREATE INDEX idx_contacts_email ON contacts(email);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_staff_users_updated_at BEFORE UPDATE ON staff_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_positions_updated_at BEFORE UPDATE ON financial_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_esign_requests_updated_at BEFORE UPDATE ON esign_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  sequence_part TEXT;
  new_number VARCHAR(50);
BEGIN
  -- Format: MX-YYYYMMDD-XXXX
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  -- Get the count of applications created today
  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0') INTO sequence_part
  FROM applications
  WHERE application_number LIKE 'MX-' || date_part || '-%';

  new_number := 'MX-' || date_part || '-' || sequence_part;
  NEW.application_number := new_number;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate application number on insert
CREATE TRIGGER set_application_number BEFORE INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION generate_application_number();

-- Function: Sync financial position to application
CREATE OR REPLACE FUNCTION sync_financial_position_to_application()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE applications
  SET
    total_assets = NEW.total_assets,
    total_liabilities = NEW.total_liabilities,
    net_position = NEW.net_position,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.application_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update application when financial position changes
CREATE TRIGGER sync_financial_position AFTER INSERT OR UPDATE ON financial_positions
  FOR EACH ROW EXECUTE FUNCTION sync_financial_position_to_application();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default rate bands (as per spec)
INSERT INTO rate_bands (min_amount, max_amount, annual_rate) VALUES
  (5000.00, 20000.00, 0.0000),
  (20000.01, 75000.00, 0.0000),
  (75000.01, 150000.00, 0.0000),
  (150000.01, 250000.00, 0.0000),
  (250000.01, 500000.00, 0.0000);

-- Insert available loan terms
INSERT INTO loan_terms (months, display_order) VALUES
  (24, 1),
  (36, 2),
  (48, 3),
  (60, 4);

-- Insert default app configuration
INSERT INTO app_config (key, value, description) VALUES
  ('application_fee', '495.00', 'Default application fee in AUD'),
  ('min_loan_amount', '10000.00', 'Minimum loan amount in AUD'),
  ('max_loan_amount', '500000.00', 'Maximum loan amount in AUD'),
  ('otp_expiry_minutes', '10', 'OTP code expiry time in minutes'),
  ('magic_link_expiry_hours', '24', 'Magic link expiry time in hours'),
  ('session_timeout_minutes', '30', 'Session timeout after inactivity in minutes'),
  ('max_otp_attempts_per_hour', '5', 'Maximum OTP requests per email per hour'),
  ('max_directors', '4', 'Maximum number of directors for company'),
  ('max_trustees', '4', 'Maximum number of trustees for trust'),
  ('max_beneficiaries', '4', 'Maximum number of beneficiaries for trust'),
  ('balloon_payment_enabled', 'false', 'Enable balloon payment option');

-- Create a default admin user (password should be changed immediately)
-- Note: In production, hash the password properly
INSERT INTO staff_users (email, full_name, role) VALUES
  ('admin@matrixfinance.com.au', 'System Administrator', 'admin');

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE applications IS 'Core application data supporting all entity types';
COMMENT ON TABLE contacts IS 'Flexible contact model for directors, trustees, beneficiaries, and partners';
COMMENT ON TABLE financial_positions IS 'Assets and liabilities with auto-calculated totals';
COMMENT ON TABLE documents IS 'Document storage references and metadata';
COMMENT ON TABLE esign_requests IS 'Dropbox Sign (HelloSign) integration tracking';
COMMENT ON TABLE crm_sync_log IS 'Findesk CRM synchronization history with retry logic';

COMMENT ON COLUMN applications.abn IS 'Australian Business Number (11 digits, no spaces)';
COMMENT ON COLUMN applications.amount_financed IS 'Invoice amount + application fee';
COMMENT ON COLUMN contacts.data_edited_from_prefill IS 'Tracks if user manually edited ABN-prefilled data';
COMMENT ON COLUMN documents.s3_key IS 'Format: {application_id}/{document_type}_{timestamp}.{ext}';
