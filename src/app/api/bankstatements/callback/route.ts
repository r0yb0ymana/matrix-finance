/**
 * Bank Statements OAuth Callback
 *
 * GET /api/bankstatements/callback
 * Handle OAuth callback from bank connection flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/bankstatements';
import { query } from '@/lib/db';

// =====================================================
// API Handler
// =====================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get callback parameters
    const connectionId = searchParams.get('connection_id');
    const status = searchParams.get('status');
    const error = searchParams.get('error');
    const applicationId = searchParams.get('application_id');

    // Handle error from bank
    if (error) {
      console.error('Bank connection error:', error);

      // Redirect to business documents page with error
      const redirectUrl = new URL('/application/business-documents', request.url);
      redirectUrl.searchParams.set('bank_error', error);

      return NextResponse.redirect(redirectUrl);
    }

    // Validate connection ID
    if (!connectionId) {
      const redirectUrl = new URL('/application/business-documents', request.url);
      redirectUrl.searchParams.set('bank_error', 'missing_connection_id');

      return NextResponse.redirect(redirectUrl);
    }

    // Verify connection status
    const connectionResult = await getConnection(connectionId);

    if (!connectionResult.success || connectionResult.data?.status !== 'connected') {
      console.error('Bank connection not successful:', connectionResult);

      const redirectUrl = new URL('/application/business-documents', request.url);
      redirectUrl.searchParams.set('bank_error', 'connection_failed');

      return NextResponse.redirect(redirectUrl);
    }

    // Store connection in database (if we have application ID)
    if (applicationId) {
      try {
        await query(
          `INSERT INTO bank_connections (
            application_id,
            connection_id,
            bank_name,
            bank_code,
            account_number,
            account_name,
            status,
            connected_at,
            expires_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (connection_id) DO UPDATE SET
            status = $7,
            connected_at = $8,
            updated_at = NOW()`,
          [
            applicationId,
            connectionId,
            connectionResult.data.bankName,
            connectionResult.data.bankCode,
            connectionResult.data.accountNumber,
            connectionResult.data.accountName,
            connectionResult.data.status,
            connectionResult.data.connectedAt,
            connectionResult.data.expiresAt,
          ]
        );
      } catch (dbError) {
        console.error('Failed to store bank connection:', dbError);
        // Continue even if DB save fails - user can still proceed
      }
    }

    // Redirect to business documents page with success
    const redirectUrl = new URL('/application/business-documents', request.url);
    redirectUrl.searchParams.set('bank_connected', 'true');
    redirectUrl.searchParams.set('connection_id', connectionId);

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Bank callback error:', error);

    // Redirect with generic error
    const redirectUrl = new URL('/application/business-documents', request.url);
    redirectUrl.searchParams.set('bank_error', 'callback_failed');

    return NextResponse.redirect(redirectUrl);
  }
}
