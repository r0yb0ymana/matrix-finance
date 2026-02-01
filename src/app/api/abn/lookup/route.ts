/**
 * ABN Lookup API
 *
 * POST /api/abn/lookup
 * Lookup business details by ABN from Australian Business Register
 */

import { NextRequest, NextResponse } from 'next/server';
import { lookupABN, mockLookupABN, isValidABNFormat, isValidABNChecksum, type ABNLookupResult } from '@/lib/abn-lookup';

// =====================================================
// Request/Response Types
// =====================================================

interface ABNLookupRequest {
  abn: string;
}

interface ABNLookupResponse {
  success: boolean;
  data?: ABNLookupResult;
  error?: string;
}

// =====================================================
// API Handler
// =====================================================

export async function POST(request: NextRequest): Promise<NextResponse<ABNLookupResponse>> {
  try {
    const body = await request.json() as ABNLookupRequest;
    const { abn } = body;

    // Validate request
    if (!abn || typeof abn !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'ABN is required',
        },
        { status: 400 }
      );
    }

    // Clean ABN (remove spaces)
    const cleanedABN = abn.replace(/\s/g, '');

    // Validate ABN format
    if (!isValidABNFormat(cleanedABN)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid ABN format. ABN must be 11 digits.',
        },
        { status: 400 }
      );
    }

    // Validate ABN checksum
    if (!isValidABNChecksum(cleanedABN)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid ABN. Please check the number and try again.',
        },
        { status: 400 }
      );
    }

    // Lookup ABN (use mock in development if no API key configured)
    let result: ABNLookupResult;

    if (process.env.ABR_GUID) {
      result = await lookupABN(cleanedABN);
    } else {
      console.warn('ABR_GUID not configured, using mock data');
      result = await mockLookupABN(cleanedABN);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('ABN lookup error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to lookup ABN';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
