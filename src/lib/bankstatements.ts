/**
 * bankstatements.com.au Integration Service
 *
 * Open Banking integration for automated bank statement retrieval
 * Website: https://www.bankstatements.com.au
 *
 * NOTE: This is a placeholder implementation. Update with actual API
 * documentation when available.
 *
 * @module lib/bankstatements
 */

// =====================================================
// Types
// =====================================================

export interface BankConnection {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber?: string;
  accountName?: string;
  status: 'pending' | 'connected' | 'expired' | 'failed';
  connectedAt?: string;
  expiresAt?: string;
}

export interface BankStatement {
  id: string;
  connectionId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  periodStart: string;
  periodEnd: string;
  openingBalance: number;
  closingBalance: number;
  transactions: BankTransaction[];
  fileUrl?: string;
  retrievedAt: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance: number;
  category?: string;
}

export interface ConnectBankRequest {
  applicationId: string;
  redirectUrl: string;
  bankCode?: string;
}

export interface ConnectBankResponse {
  success: boolean;
  authUrl?: string;
  connectionId?: string;
  error?: string;
}

export interface FetchStatementsRequest {
  connectionId: string;
  months?: number; // Default 6 months
}

export interface FetchStatementsResponse {
  success: boolean;
  statements?: BankStatement[];
  error?: string;
}

export interface BankStatementsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// =====================================================
// Configuration
// =====================================================

const BANKSTATEMENTS_API_URL = process.env.BANKSTATEMENTS_API_URL || 'https://api.bankstatements.com.au';

function getHeaders(): HeadersInit {
  const apiKey = process.env.BANKSTATEMENTS_API_KEY;

  if (!apiKey) {
    throw new Error('Bank Statements API key not configured. Set BANKSTATEMENTS_API_KEY.');
  }

  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

// =====================================================
// API Helper
// =====================================================

async function bankstatementsFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<BankStatementsResponse<T>> {
  const useMock = process.env.USE_MOCK_BANKSTATEMENTS === 'true' || process.env.NODE_ENV === 'development';

  if (useMock) {
    console.log(`[MOCK] Bank Statements API call: ${options.method || 'GET'} ${endpoint}`);
    return getMockResponse<T>(endpoint, options);
  }

  try {
    const response = await fetch(`${BANKSTATEMENTS_API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Bank Statements API error:', data);
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
    console.error('Bank Statements API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// Mock Responses (for development)
// =====================================================

function getMockResponse<T>(endpoint: string, options: RequestInit): BankStatementsResponse<T> {
  // Mock auth URL for connect
  if (endpoint.includes('/connect')) {
    return {
      success: true,
      data: {
        authUrl: 'https://bankstatements.com.au/connect/mock?connection_id=mock-123',
        connectionId: 'mock-connection-' + Date.now(),
      } as T,
    };
  }

  // Mock connection status
  if (endpoint.includes('/connections/')) {
    return {
      success: true,
      data: {
        id: 'mock-connection-123',
        bankName: 'Commonwealth Bank',
        bankCode: 'CBA',
        accountNumber: '****1234',
        accountName: 'Business Account',
        status: 'connected',
        connectedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      } as T,
    };
  }

  // Mock statements
  if (endpoint.includes('/statements')) {
    const mockStatements: BankStatement[] = [
      {
        id: 'stmt-1',
        connectionId: 'mock-connection-123',
        accountNumber: '****1234',
        accountName: 'Business Account',
        bankName: 'Commonwealth Bank',
        periodStart: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodEnd: new Date().toISOString().split('T')[0],
        openingBalance: 15000.00,
        closingBalance: 22500.00,
        transactions: generateMockTransactions(50),
        retrievedAt: new Date().toISOString(),
      },
    ];

    return {
      success: true,
      data: mockStatements as T,
    };
  }

  return {
    success: true,
    data: {} as T,
  };
}

function generateMockTransactions(count: number): BankTransaction[] {
  const transactions: BankTransaction[] = [];
  let balance = 15000;

  for (let i = 0; i < count; i++) {
    const isCredit = Math.random() > 0.4;
    const amount = Math.round((Math.random() * 5000 + 100) * 100) / 100;
    balance += isCredit ? amount : -amount;

    transactions.push({
      id: `txn-${i}`,
      date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: isCredit
        ? ['Customer Payment', 'Transfer In', 'Sales Revenue', 'Refund'][Math.floor(Math.random() * 4)]
        : ['Supplier Payment', 'Rent', 'Utilities', 'Equipment', 'Insurance'][Math.floor(Math.random() * 5)],
      amount: isCredit ? amount : -amount,
      type: isCredit ? 'credit' : 'debit',
      balance: Math.round(balance * 100) / 100,
      category: isCredit ? 'income' : 'expense',
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// =====================================================
// Connection Functions
// =====================================================

/**
 * Initiate bank connection flow
 * Returns auth URL to redirect user to
 */
export async function initiateConnection(
  request: ConnectBankRequest
): Promise<ConnectBankResponse> {
  const result = await bankstatementsFetch<{ authUrl: string; connectionId: string }>('/v1/connect', {
    method: 'POST',
    body: JSON.stringify({
      applicationId: request.applicationId,
      redirectUrl: request.redirectUrl,
      bankCode: request.bankCode,
    }),
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    authUrl: result.data?.authUrl,
    connectionId: result.data?.connectionId,
  };
}

/**
 * Get connection status
 */
export async function getConnection(connectionId: string): Promise<BankStatementsResponse<BankConnection>> {
  return bankstatementsFetch<BankConnection>(`/v1/connections/${connectionId}`);
}

/**
 * Revoke bank connection
 */
export async function revokeConnection(connectionId: string): Promise<BankStatementsResponse<void>> {
  return bankstatementsFetch<void>(`/v1/connections/${connectionId}`, {
    method: 'DELETE',
  });
}

// =====================================================
// Statement Functions
// =====================================================

/**
 * Fetch bank statements for a connection
 */
export async function fetchStatements(
  request: FetchStatementsRequest
): Promise<FetchStatementsResponse> {
  const months = request.months || 6;

  const result = await bankstatementsFetch<BankStatement[]>(
    `/v1/connections/${request.connectionId}/statements?months=${months}`
  );

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    statements: result.data,
  };
}

/**
 * Get a specific statement
 */
export async function getStatement(statementId: string): Promise<BankStatementsResponse<BankStatement>> {
  return bankstatementsFetch<BankStatement>(`/v1/statements/${statementId}`);
}

/**
 * Download statement as PDF
 */
export async function downloadStatementPDF(statementId: string): Promise<BankStatementsResponse<{ url: string }>> {
  return bankstatementsFetch<{ url: string }>(`/v1/statements/${statementId}/pdf`);
}

// =====================================================
// Webhook Handling
// =====================================================

export interface BankStatementsWebhookEvent {
  event: string;
  connectionId: string;
  data: {
    status?: string;
    statementId?: string;
    error?: string;
    [key: string]: unknown;
  };
  timestamp: string;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const webhookSecret = process.env.BANKSTATEMENTS_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('BANKSTATEMENTS_WEBHOOK_SECRET not configured');
    return true; // Skip verification if not configured
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Check if bank statements API is configured
 */
export function isConfigured(): boolean {
  return !!process.env.BANKSTATEMENTS_API_KEY;
}

/**
 * Test bank statements API connection
 */
export async function testConnection(): Promise<BankStatementsResponse<boolean>> {
  if (!isConfigured()) {
    return {
      success: false,
      error: 'Bank Statements API key not configured',
    };
  }

  try {
    // Try to hit a health endpoint
    const result = await bankstatementsFetch<{ status: string }>('/v1/health');
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

/**
 * Get list of supported banks
 */
export async function getSupportedBanks(): Promise<BankStatementsResponse<{ code: string; name: string }[]>> {
  // Mock list of Australian banks
  const mockBanks = [
    { code: 'CBA', name: 'Commonwealth Bank' },
    { code: 'NAB', name: 'National Australia Bank' },
    { code: 'WBC', name: 'Westpac' },
    { code: 'ANZ', name: 'ANZ Bank' },
    { code: 'BOQ', name: 'Bank of Queensland' },
    { code: 'BEN', name: 'Bendigo Bank' },
    { code: 'SUN', name: 'Suncorp Bank' },
    { code: 'MAC', name: 'Macquarie Bank' },
    { code: 'ING', name: 'ING' },
    { code: 'UB', name: 'Ubank' },
  ];

  const useMock = process.env.USE_MOCK_BANKSTATEMENTS === 'true' || process.env.NODE_ENV === 'development';

  if (useMock) {
    return {
      success: true,
      data: mockBanks,
    };
  }

  return bankstatementsFetch<{ code: string; name: string }[]>('/v1/banks');
}
