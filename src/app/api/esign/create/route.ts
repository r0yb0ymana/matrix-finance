/**
 * E-Signature Creation API
 *
 * POST /api/esign/create
 * Create a Dropbox Sign signature request
 */

import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// =====================================================
// Types
// =====================================================

interface CreateSignatureRequest {
  applicationId: string;
  signerName: string;
  signerEmail: string;
}

interface CreateSignatureResponse {
  success: boolean;
  data?: {
    signatureRequestId: string;
    signUrl: string;
  };
  error?: string;
}

// =====================================================
// Mock Dropbox Sign Integration
// =====================================================

/**
 * Mock Dropbox Sign API call
 * In production, use the actual Dropbox Sign SDK
 */
async function createDropboxSignRequest(
  signerName: string,
  signerEmail: string,
  applicationId: string
): Promise<{ signatureRequestId: string; signUrl: string }> {
  // In production, this would be:
  // const dropboxSign = new DropboxSign.SignatureRequestApi();
  // dropboxSign.apiKey = process.env.DROPBOX_SIGN_API_KEY;
  //
  // const request = new DropboxSign.SignatureRequestSendRequest();
  // request.test_mode = true;
  // request.title = `Equipment Finance Application ${applicationId}`;
  // request.subject = 'Please sign your equipment finance agreement';
  // request.message = 'Please review and sign the attached documents';
  // request.signers = [{ name: signerName, email_address: signerEmail }];
  // request.files = [/* PDF file buffers */];
  //
  // const result = await dropboxSign.signatureRequestSend(request);
  // return {
  //   signatureRequestId: result.body.signature_request.signature_request_id,
  //   signUrl: result.body.signature_request.signing_url,
  // };

  // Mock response for development
  const mockSignatureRequestId = `MOCK_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const mockSignUrl = `https://app.hellosign.com/sign/${mockSignatureRequestId}`;

  return {
    signatureRequestId: mockSignatureRequestId,
    signUrl: mockSignUrl,
  };
}

// =====================================================
// API Handler
// =====================================================

export async function POST(request: NextRequest): Promise<NextResponse<CreateSignatureResponse>> {
  try {
    const body = await request.json() as CreateSignatureRequest;
    const { applicationId, signerName, signerEmail } = body;

    // Validate request
    if (!applicationId || !signerName || !signerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application ID, signer name, and email are required',
        },
        { status: 400 }
      );
    }

    // Create signature request with Dropbox Sign
    const { signatureRequestId, signUrl } = await createDropboxSignRequest(
      signerName,
      signerEmail,
      applicationId
    );

    // Save signature request to database
    await query(
      `INSERT INTO esign_requests (
        application_id,
        signature_request_id,
        signer_email,
        status
      ) VALUES ($1, $2, $3, $4)`,
      [applicationId, signatureRequestId, signerEmail, 'pending']
    );

    return NextResponse.json({
      success: true,
      data: {
        signatureRequestId,
        signUrl,
      },
    });

  } catch (error) {
    console.error('E-signature creation error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to create signature request';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
