/**
 * Verify Magic Link API
 *
 * GET /api/auth/verify-link?token=xxx
 *
 * Verifies the magic link token and sends an OTP code
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink, createOTP, getClientIP } from '@/lib/auth';
import { sendOTP } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify magic link
    const verification = await verifyMagicLink(token);
    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired magic link' },
        { status: 401 }
      );
    }

    // Get client IP
    const ipAddress = getClientIP(request.headers);

    // Generate and send OTP
    const otpCode = await createOTP(verification.email, ipAddress);
    await sendOTP(verification.email, otpCode);

    return NextResponse.json({
      success: true,
      email: verification.email,
      application_id: verification.application_id,
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    console.error('Verify magic link error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to verify magic link',
      },
      { status: 500 }
    );
  }
}
