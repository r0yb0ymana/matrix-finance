/**
 * E-Signature Status API
 *
 * GET /api/esign/status?signatureRequestId=xxx
 * Check the status of a signature request
 */

import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// =====================================================
// Types
// =====================================================

interface StatusResponse {
  success: boolean;
  data?: {
    signed: boolean;
    signedAt?: string;
  };
  error?: string;
}

// =====================================================
// API Handler
// =====================================================

export async function GET(request: NextRequest): Promise<NextResponse<StatusResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const signatureRequestId = searchParams.get('signatureRequestId');

    if (!signatureRequestId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Signature request ID is required',
        },
        { status: 400 }
      );
    }

    // In production, check status with Dropbox Sign API:
    // const dropboxSign = new DropboxSign.SignatureRequestApi();
    // const result = await dropboxSign.signatureRequestGet(signatureRequestId);
    // const isSigned = result.body.signature_request.is_complete;

    // For mock requests, auto-sign after 5 seconds (for demo)
    if (signatureRequestId.startsWith('MOCK_')) {
      const timestamp = parseInt(signatureRequestId.split('_')[1]);
      const age = Date.now() - timestamp;
      const signed = age > 5000; // Auto-sign after 5 seconds

      if (signed) {
        // Update database
        await query(
          `UPDATE esign_requests
           SET status = $1, signed_at = NOW()
           WHERE signature_request_id = $2`,
          ['signed', signatureRequestId]
        );

        return NextResponse.json({
          success: true,
          data: {
            signed: true,
            signedAt: new Date().toISOString(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          signed: false,
        },
      });
    }

    // Check database for status
    const result = await query(
      `SELECT status, signed_at FROM esign_requests WHERE signature_request_id = $1`,
      [signatureRequestId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Signature request not found',
        },
        { status: 404 }
      );
    }

    const { status, signed_at } = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        signed: status === 'signed',
        signedAt: signed_at || undefined,
      },
    });

  } catch (error) {
    console.error('E-signature status check error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to check signature status';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
