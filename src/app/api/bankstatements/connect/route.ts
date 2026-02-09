/**
 * Bank Statements Connect API
 *
 * POST /api/bankstatements/connect
 * Initiate Open Banking connection flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { initiateConnection, isConfigured } from '@/lib/bankstatements';

// =====================================================
// Types
// =====================================================

interface ConnectRequest {
  applicationId: string;
  bankCode?: string;
}

interface ConnectResponse {
  success: boolean;
  authUrl?: string;
  connectionId?: string;
  error?: string;
}

// =====================================================
// API Handler
// =====================================================

export async function POST(request: NextRequest): Promise<NextResponse<ConnectResponse>> {
  try {
    // Check if configured (allow mock in development)
    const isDev = process.env.NODE_ENV === 'development';
    if (!isConfigured() && !isDev) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bank Statements API is not configured. Set BANKSTATEMENTS_API_KEY.',
        },
        { status: 503 }
      );
    }

    // Parse request body
    const body: ConnectRequest = await request.json();
    const { applicationId, bankCode } = body;

    if (!applicationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'applicationId is required',
        },
        { status: 400 }
      );
    }

    // Build redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';
    const redirectUrl = `${baseUrl}/api/bankstatements/callback`;

    // Initiate connection
    const result = await initiateConnection({
      applicationId,
      redirectUrl,
      bankCode,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authUrl: result.authUrl,
      connectionId: result.connectionId,
    });

  } catch (error) {
    console.error('Bank connection error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to initiate bank connection';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
