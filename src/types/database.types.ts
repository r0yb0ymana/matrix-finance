/**
 * Matrix Equipment Finance - Database Types
 *
 * TypeScript types that mirror the PostgreSQL database schema.
 * Auto-generated from schema.sql
 *
 * @version 1.0
 * @date 2026-01-31
 */

// =====================================================
// ENUMS
// =====================================================

export enum EntityType {
  SOLE_TRADER = 'sole_trader',
  COMPANY = 'company',
  PARTNERSHIP = 'partnership',
  TRUST_INDIVIDUAL_TRUSTEE = 'trust_individual_trustee',
  TRUST_COMPANY_TRUSTEE = 'trust_company_trustee',
}

export enum FinanceProduct {
  CHATTEL_MORTGAGE = 'chattel_mortgage',
  RENTAL_LEASE = 'rental_lease',
}

export enum ApplicationStatus {
  INCOMPLETE = 'incomplete',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  DECLINED = 'declined',
  AWAITING_SIGNATURE = 'awaiting_signature',
  SIGNED = 'signed',
  SETTLED = 'settled',
}

export enum ContactRole {
  PRIMARY_APPLICANT = 'primary_applicant',
  DIRECTOR = 'director',
  TRUSTEE = 'trustee',
  TRUSTEE_DIRECTOR = 'trustee_director',
  BENEFICIARY = 'beneficiary',
  PARTNER = 'partner',
}

export enum ResidencyStatus {
  AUSTRALIAN_CITIZEN = 'australian_citizen',
  PERMANENT_RESIDENT = 'permanent_resident',
  TEMPORARY_VISA_HOLDER = 'temporary_visa_holder',
}

export enum DocumentType {
  DRIVERS_LICENSE_FRONT = 'drivers_license_front',
  DRIVERS_LICENSE_BACK = 'drivers_license_back',
  MEDICARE_CARD = 'medicare_card',
  BANK_STATEMENT = 'bank_statement',
  FINANCIAL_STATEMENT = 'financial_statement',
  EQUIPMENT_QUOTE = 'equipment_quote',
  SIGNED_CONTRACT = 'signed_contract',
  PRIVACY_CONSENT = 'privacy_consent',
  CREDIT_AUTHORIZATION = 'credit_authorization',
  DIRECT_DEBIT_AUTHORITY = 'direct_debit_authority',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum ESignStatus {
  PENDING = 'pending',
  SENT = 'sent',
  VIEWED = 'viewed',
  SIGNED = 'signed',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  ERROR = 'error',
}

export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  FAILED = 'failed',
  RETRY = 'retry',
}

// =====================================================
// TABLE TYPES
// =====================================================

export interface StaffUser {
  id: string;
  email: string;
  full_name: string;
  password_hash?: string;
  is_active: boolean;
  role: 'staff' | 'admin' | 'manager';
  created_at: Date;
  updated_at: Date;
}

export interface OTPCode {
  id: string;
  email: string;
  code: string;
  expires_at: Date;
  used_at?: Date;
  ip_address?: string;
  created_at: Date;
}

export interface MagicLink {
  id: string;
  token: string;
  email: string;
  application_id?: string;
  expires_at: Date;
  used_at?: Date;
  ip_address?: string;
  created_at: Date;
}

export interface Session {
  id: string;
  session_token: string;
  email: string;
  application_id?: string;
  staff_user_id?: string;
  expires_at: Date;
  last_activity_at: Date;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface RateBand {
  id: string;
  min_amount: number;
  max_amount: number;
  annual_rate: number;
  is_active: boolean;
  effective_from: Date;
  effective_to?: Date;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export interface LoanTerm {
  id: string;
  months: number;
  is_active: boolean;
  display_order: number;
  created_at: Date;
}

export interface AppConfig {
  key: string;
  value: string;
  description?: string;
  updated_at: Date;
  updated_by?: string;
}

export interface Application {
  id: string;
  application_number?: string;

  // Status & Assignment
  status: ApplicationStatus;
  assigned_to?: string;

  // Calculator & Product Selection
  finance_product?: FinanceProduct;
  equipment_categories?: string[];
  invoice_amount?: number;
  term_months?: number;
  application_fee: number;
  amount_financed?: number;
  balloon_amount: number;
  monthly_payment?: number;
  annual_rate?: number;

  // Business/Entity Details
  entity_type?: EntityType;
  abn?: string;
  acn?: string;
  business_name?: string;
  trading_name?: string;
  gst_registered?: boolean;
  gst_registered_date?: Date;

  // Business Address
  business_street_address?: string;
  business_city?: string;
  business_state?: string;
  business_postcode?: string;
  business_phone?: string;

  // Trust-Specific Fields
  trust_abn?: string;
  trustee_company_abn?: string;
  trustee_company_acn?: string;
  trustee_company_name?: string;

  // ABN Lookup Metadata
  abn_lookup_verified_at?: Date;
  abn_lookup_response?: Record<string, any>;

  // Financial Position Summary
  total_assets?: number;
  total_liabilities?: number;
  net_position?: number;

  // Timestamps
  started_at: Date;
  submitted_at?: Date;
  reviewed_at?: Date;
  approved_at?: Date;
  declined_at?: Date;
  signed_at?: Date;
  settled_at?: Date;

  // Audit
  created_at: Date;
  updated_at: Date;
  created_by_email?: string;
}

export interface FinancialPosition {
  id: string;
  application_id: string;

  // Assets
  home_value: number;
  investment_property_value: number;
  cash_at_bank: number;
  vehicles_value: number;
  home_contents_value: number;
  investments_shares_value: number;
  other_assets_value: number;

  // Liabilities
  mortgage_home: number;
  mortgage_investment: number;
  vehicle_loan: number;
  credit_cards: number;
  other_liabilities: number;

  // Calculated totals (generated columns)
  total_assets: number;
  total_liabilities: number;
  net_position: number;

  created_at: Date;
  updated_at: Date;
}

export interface Contact {
  id: string;
  application_id: string;

  // Role & Order
  role: ContactRole;
  contact_order: number;
  is_primary: boolean;

  // Personal Details
  full_name: string;
  email?: string;
  mobile_number?: string;
  date_of_birth?: Date;
  residency_status?: ResidencyStatus;

  // Residential Address
  residential_street_address?: string;
  residential_city?: string;
  residential_state?: string;
  residential_postcode?: string;

  // Metadata
  data_edited_from_prefill: boolean;

  created_at: Date;
  updated_at: Date;
}

export interface Document {
  id: string;
  application_id: string;
  contact_id?: string;

  // Document Details
  document_type: DocumentType;
  status: DocumentStatus;

  // File Information
  original_filename?: string;
  file_size_bytes?: number;
  mime_type?: string;

  // Storage
  s3_bucket?: string;
  s3_key?: string;
  s3_url?: string;

  // Bank Statement Specifics
  bank_statement_month?: Date;
  retrieved_via_open_banking: boolean;

  // Verification
  uploaded_at?: Date;
  verified_at?: Date;
  verified_by?: string;
  rejection_reason?: string;

  created_at: Date;
  updated_at: Date;
}

export interface ESignRequest {
  id: string;
  application_id: string;

  // Dropbox Sign Details
  signature_request_id?: string;
  template_id?: string;

  // Status
  status: ESignStatus;

  // Signers
  signers?: Record<string, any>;

  // Document
  document_title?: string;
  document_subject?: string;

  // URLs
  signing_url?: string;
  files_url?: string;

  // Webhook Events
  webhook_events?: Record<string, any>[];

  // Timestamps
  sent_at?: Date;
  viewed_at?: Date;
  signed_at?: Date;
  declined_at?: Date;
  expired_at?: Date;

  created_at: Date;
  updated_at: Date;
}

export interface CRMSyncLog {
  id: string;
  application_id: string;

  // Sync Details
  sync_type?: string;
  status: SyncStatus;

  // Findesk Reference
  findesk_id?: string;

  // Request/Response
  request_payload?: Record<string, any>;
  response_payload?: Record<string, any>;
  error_message?: string;

  // Retry Logic
  attempt_count: number;
  next_retry_at?: Date;
  max_retries: number;

  // Timestamps
  synced_at?: Date;
  created_at: Date;
}

export interface CalculatorHistory {
  id: string;
  session_id?: string;
  application_id?: string;

  // Calculator Type
  calculator_type: 'payment' | 'rate' | 'loan_amount';

  // Inputs
  invoice_amount?: number;
  term_months?: number;
  desired_payment?: number;
  annual_rate?: number;

  // Output
  result?: number;

  // Metadata
  ip_address?: string;
  created_at: Date;
}

export interface AuditLog {
  id: string;

  // Entity
  table_name: string;
  record_id: string;

  // Action
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';

  // Changes
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;

  // Actor
  staff_user_id?: string;
  applicant_email?: string;

  // Context
  ip_address?: string;
  user_agent?: string;

  created_at: Date;
}

// =====================================================
// HELPER TYPES
// =====================================================

// Complete application with all related data
export interface ApplicationWithDetails extends Application {
  contacts?: Contact[];
  financial_position?: FinancialPosition;
  documents?: Document[];
  esign_request?: ESignRequest;
  assigned_staff?: StaffUser;
}

// Application form data (for API requests)
export interface ApplicationFormData {
  // Product selection
  finance_product: FinanceProduct;
  equipment_categories: string[];
  invoice_amount: number;
  term_months: number;

  // Business details
  entity_type: EntityType;
  abn: string;
  business_name?: string;
  business_street_address: string;
  business_city: string;
  business_state: string;
  business_postcode: string;
  business_phone: string;

  // Contacts (flexible for different entity types)
  contacts: Partial<Contact>[];

  // Financial position
  financial_position: Omit<FinancialPosition, 'id' | 'application_id' | 'total_assets' | 'total_liabilities' | 'net_position' | 'created_at' | 'updated_at'>;
}

// Calculator inputs/outputs
export interface PaymentCalculatorInput {
  invoice_amount: number;
  term_months: number;
}

export interface PaymentCalculatorOutput {
  monthly_payment: number;
  amount_financed: number;
  annual_rate: number;
  rate_band?: RateBand;
}

export interface RateCalculatorInput {
  invoice_amount: number;
  term_months: number;
  desired_payment: number;
}

export interface RateCalculatorOutput {
  effective_rate: number;
}

export interface LoanAmountCalculatorInput {
  desired_payment: number;
  term_months: number;
  annual_rate: number;
}

export interface LoanAmountCalculatorOutput {
  max_invoice_amount: number;
  amount_financed: number;
}

// ABN Lookup response
export interface ABNLookupResponse {
  abn: string;
  abn_status: 'Active' | 'Cancelled';
  entity_type: string;
  entity_name: string;
  acn?: string;
  gst_registered: boolean;
  gst_registered_date?: string;
  state?: string;
  postcode?: string;
}

// Session data
export interface SessionData {
  email: string;
  application_id?: string;
  is_staff: boolean;
  staff_user_id?: string;
  staff_role?: string;
}

// Australian states
export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';

// Equipment categories (from spec)
export type EquipmentCategory =
  | 'Cardio Machines'
  | 'Strength Equipment'
  | 'Free Weight Accessories'
  | 'Other';
