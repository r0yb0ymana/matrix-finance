/**
 * Findesk CRM Integration Service
 *
 * Bi-directional sync with Findesk CRM for application management
 * API Documentation: https://app.findesk.com.au/api/v1
 *
 * @module lib/findesk
 */

// =====================================================
// Types
// =====================================================

export interface FindeskLead {
  id?: string;
  Title?: string;
  PersonName: string;
  Phone?: string;
  Email: string;
  OrganisationName?: string;
  FinanceAmount?: number;
  Deposit?: number;
  PurchasePrice?: number;
  RealestateOwner?: boolean;
}

export interface FindeskPerson {
  PersonID?: string;
  Title?: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone?: string;
}

export interface FindeskOrganisation {
  id?: string;
  Name: string;
  ABN?: string;
  ACN?: string;
  TradingName?: string;
  Phone?: string;
  Email?: string;
  Address?: {
    Street?: string;
    City?: string;
    State?: string;
    PostCode?: string;
    Country?: string;
  };
}

export interface FindeskApplication {
  id?: string;
  OrganisationID?: string;
  PersonID?: string;
  FinanceAmount: number;
  Deposit?: number;
  PurchasePrice?: number;
  Term?: number;
  Status?: string;
  ProductType?: string;
  Notes?: string;
}

export interface FindeskResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FindeskPaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    totalPages: number;
    totalRecords: number;
  };
  error?: string;
}

// =====================================================
// Configuration
// =====================================================

const FINDESK_BASE_URL = process.env.FINDESK_API_URL || 'https://app.findesk.com.au/api/v1';

function getHeaders(): HeadersInit {
  const token = process.env.FINDESK_BEARER_TOKEN;
  const enterpriseId = process.env.FINDESK_ENTERPRISE_ID;

  if (!token || !enterpriseId) {
    throw new Error('Findesk API credentials not configured. Set FINDESK_BEARER_TOKEN and FINDESK_ENTERPRISE_ID.');
  }

  return {
    'Authorization': `Bearer ${token}`,
    'EnterpriseID': enterpriseId,
    'Content-Type': 'application/json',
  };
}

// =====================================================
// API Helper
// =====================================================

async function findeskFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<FindeskResponse<T>> {
  const useMock = process.env.USE_MOCK_FINDESK === 'true';

  if (useMock) {
    console.log(`[MOCK] Findesk API call: ${options.method || 'GET'} ${endpoint}`);
    return {
      success: true,
      data: { id: `mock-${Date.now()}` } as T,
    };
  }

  try {
    const response = await fetch(`${FINDESK_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Findesk API error:', data);
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Findesk API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// Leads API
// =====================================================

/**
 * Create a new lead in Findesk
 * Used when calculator is completed (optional pre-application)
 */
export async function createLead(lead: FindeskLead): Promise<FindeskResponse<FindeskLead>> {
  return findeskFetch<FindeskLead>('/leads', {
    method: 'POST',
    body: JSON.stringify(lead),
  });
}

/**
 * Get a lead by ID
 */
export async function getLead(id: string): Promise<FindeskResponse<FindeskLead>> {
  return findeskFetch<FindeskLead>(`/leads/${id}`);
}

/**
 * Update a lead
 */
export async function updateLead(id: string, lead: Partial<FindeskLead>): Promise<FindeskResponse<FindeskLead>> {
  return findeskFetch<FindeskLead>(`/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(lead),
  });
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string): Promise<FindeskResponse<void>> {
  return findeskFetch<void>(`/leads/${id}`, {
    method: 'DELETE',
  });
}

/**
 * List leads with pagination
 */
export async function listLeads(page: number = 1): Promise<FindeskPaginatedResponse<FindeskLead>> {
  const response = await findeskFetch<FindeskLead[]>(`/leads?page=${page}`);
  return {
    success: response.success,
    data: response.data ? (Array.isArray(response.data) ? response.data : [response.data]) : [],
    error: response.error,
  };
}

// =====================================================
// People API
// =====================================================

/**
 * Create a person (applicant/director/trustee)
 */
export async function createPerson(person: FindeskPerson): Promise<FindeskResponse<FindeskPerson>> {
  return findeskFetch<FindeskPerson>('/people', {
    method: 'POST',
    body: JSON.stringify(person),
  });
}

/**
 * Get a person by ID
 */
export async function getPerson(id: string): Promise<FindeskResponse<FindeskPerson>> {
  return findeskFetch<FindeskPerson>(`/people/${id}`);
}

/**
 * List people with pagination
 */
export async function listPeople(page: number = 1): Promise<FindeskPaginatedResponse<FindeskPerson>> {
  const response = await findeskFetch<FindeskPerson[]>(`/people?page=${page}`);
  return {
    success: response.success,
    data: response.data ? (Array.isArray(response.data) ? response.data : [response.data]) : [],
    error: response.error,
  };
}

// =====================================================
// Organisations API
// =====================================================

/**
 * Create an organisation (business)
 */
export async function createOrganisation(org: FindeskOrganisation): Promise<FindeskResponse<FindeskOrganisation>> {
  return findeskFetch<FindeskOrganisation>('/organisations', {
    method: 'POST',
    body: JSON.stringify(org),
  });
}

/**
 * Get an organisation by ID
 */
export async function getOrganisation(id: string): Promise<FindeskResponse<FindeskOrganisation>> {
  return findeskFetch<FindeskOrganisation>(`/organisations/${id}`);
}

/**
 * Update an organisation
 */
export async function updateOrganisation(id: string, org: Partial<FindeskOrganisation>): Promise<FindeskResponse<FindeskOrganisation>> {
  return findeskFetch<FindeskOrganisation>(`/organisations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(org),
  });
}

/**
 * List organisations
 */
export async function listOrganisations(): Promise<FindeskPaginatedResponse<FindeskOrganisation>> {
  const response = await findeskFetch<FindeskOrganisation[]>('/organisations');
  return {
    success: response.success,
    data: response.data ? (Array.isArray(response.data) ? response.data : [response.data]) : [],
    error: response.error,
  };
}

// =====================================================
// Applications API
// =====================================================

/**
 * Create an application in Findesk
 */
export async function createApplication(app: FindeskApplication): Promise<FindeskResponse<FindeskApplication>> {
  return findeskFetch<FindeskApplication>('/applications', {
    method: 'POST',
    body: JSON.stringify(app),
  });
}

/**
 * Get an application by ID
 */
export async function getApplication(id: string): Promise<FindeskResponse<FindeskApplication>> {
  return findeskFetch<FindeskApplication>(`/applications/${id}`);
}

/**
 * Update an application (e.g., status change)
 */
export async function updateApplication(id: string, app: Partial<FindeskApplication>): Promise<FindeskResponse<FindeskApplication>> {
  return findeskFetch<FindeskApplication>(`/applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(app),
  });
}

/**
 * Delete an application
 */
export async function deleteApplication(id: string): Promise<FindeskResponse<void>> {
  return findeskFetch<void>(`/applications/${id}`, {
    method: 'DELETE',
  });
}

/**
 * List applications with pagination
 */
export async function listApplications(page: number = 1): Promise<FindeskPaginatedResponse<FindeskApplication>> {
  const response = await findeskFetch<FindeskApplication[]>(`/applications?page=${page}`);
  return {
    success: response.success,
    data: response.data ? (Array.isArray(response.data) ? response.data : [response.data]) : [],
    error: response.error,
  };
}

// =====================================================
// Sync Functions
// =====================================================

export interface ApplicationSyncData {
  // Business details
  businessName: string;
  abn: string;
  tradingName?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };

  // Applicant details
  applicantFirstName: string;
  applicantLastName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantTitle?: string;

  // Finance details
  loanAmount: number;
  deposit?: number;
  purchasePrice?: number;
  term?: number;
  productType?: string;
}

export interface SyncResult {
  success: boolean;
  organisationId?: string;
  personId?: string;
  applicationId?: string;
  error?: string;
}

/**
 * Sync a complete application to Findesk CRM
 * Creates organisation, person, and application records
 */
export async function syncApplicationToFindesk(data: ApplicationSyncData): Promise<SyncResult> {
  try {
    // Step 1: Create Organisation (Business)
    const orgResult = await createOrganisation({
      Name: data.businessName,
      ABN: data.abn,
      TradingName: data.tradingName,
      Phone: data.businessPhone,
      Email: data.businessEmail,
      Address: data.businessAddress ? {
        Street: data.businessAddress.street,
        City: data.businessAddress.city,
        State: data.businessAddress.state,
        PostCode: data.businessAddress.postcode,
        Country: 'Australia',
      } : undefined,
    });

    if (!orgResult.success || !orgResult.data?.id) {
      return {
        success: false,
        error: `Failed to create organisation: ${orgResult.error}`,
      };
    }

    const organisationId = orgResult.data.id;

    // Step 2: Create Person (Applicant)
    const personResult = await createPerson({
      Title: data.applicantTitle,
      FirstName: data.applicantFirstName,
      LastName: data.applicantLastName,
      Email: data.applicantEmail,
      Phone: data.applicantPhone,
    });

    if (!personResult.success || !personResult.data?.PersonID) {
      return {
        success: false,
        organisationId,
        error: `Failed to create person: ${personResult.error}`,
      };
    }

    const personId = personResult.data.PersonID;

    // Step 3: Create Application
    const appResult = await createApplication({
      OrganisationID: organisationId,
      PersonID: personId,
      FinanceAmount: data.loanAmount,
      Deposit: data.deposit,
      PurchasePrice: data.purchasePrice,
      Term: data.term,
      ProductType: data.productType,
      Status: 'New',
    });

    if (!appResult.success || !appResult.data?.id) {
      return {
        success: false,
        organisationId,
        personId,
        error: `Failed to create application: ${appResult.error}`,
      };
    }

    return {
      success: true,
      organisationId,
      personId,
      applicationId: appResult.data.id,
    };
  } catch (error) {
    console.error('Findesk sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown sync error',
    };
  }
}

/**
 * Update application status in Findesk
 */
export async function updateApplicationStatus(
  findeskApplicationId: string,
  status: string
): Promise<FindeskResponse<FindeskApplication>> {
  return updateApplication(findeskApplicationId, { Status: status });
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Check if Findesk credentials are configured
 */
export function isConfigured(): boolean {
  return !!(process.env.FINDESK_BEARER_TOKEN && process.env.FINDESK_ENTERPRISE_ID);
}

/**
 * Test Findesk connection
 */
export async function testConnection(): Promise<FindeskResponse<boolean>> {
  if (!isConfigured()) {
    return {
      success: false,
      error: 'Findesk credentials not configured',
    };
  }

  try {
    // Try to list leads as a connection test
    const result = await listLeads(1);
    return {
      success: result.success,
      data: result.success,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    };
  }
}
