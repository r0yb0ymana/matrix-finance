/**
 * CRM Test API
 *
 * GET /api/crm/test
 * Test Findesk CRM connection
 */

import { NextResponse } from 'next/server';
import { isConfigured, testConnection } from '@/lib/findesk';

interface TestResponse {
  success: boolean;
  configured: boolean;
  connected?: boolean;
  error?: string;
}

export async function GET(): Promise<NextResponse<TestResponse>> {
  // Check if configured
  if (!isConfigured()) {
    return NextResponse.json({
      success: false,
      configured: false,
      error: 'Findesk CRM credentials not configured. Set FINDESK_BEARER_TOKEN and FINDESK_ENTERPRISE_ID.',
    });
  }

  // Test connection
  const result = await testConnection();

  return NextResponse.json({
    success: result.success,
    configured: true,
    connected: result.success,
    error: result.error,
  });
}
