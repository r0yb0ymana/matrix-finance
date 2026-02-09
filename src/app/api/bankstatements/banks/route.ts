/**
 * Supported Banks API
 *
 * GET /api/bankstatements/banks
 * Get list of supported banks for Open Banking
 */

import { NextResponse } from 'next/server';
import { getSupportedBanks } from '@/lib/bankstatements';

// =====================================================
// Types
// =====================================================

interface BanksResponse {
  success: boolean;
  banks?: Array<{
    code: string;
    name: string;
  }>;
  error?: string;
}

// =====================================================
// API Handler
// =====================================================

export async function GET(): Promise<NextResponse<BanksResponse>> {
  try {
    const result = await getSupportedBanks();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch supported banks',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      banks: result.data,
    });

  } catch (error) {
    console.error('Fetch banks error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to fetch supported banks';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
