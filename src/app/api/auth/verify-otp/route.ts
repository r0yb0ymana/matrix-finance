/**
 * Verify OTP API
 *
 * POST /api/auth/verify-otp
 *
 * Verifies the OTP code and creates a session
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyOTP,
  createSession,
  isValidEmail,
  isValidOTP,
  getClientIP,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  serializeCookie,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, application_id } = body;

    // Validate inputs
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!code || !isValidOTP(code)) {
      return NextResponse.json(
        { error: 'Valid 4-digit code is required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = await verifyOTP(email, code);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 401 }
      );
    }

    // Get client info
    const ipAddress = getClientIP(request.headers);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create session
    const sessionToken = await createSession(
      email,
      application_id,
      undefined, // staff_user_id
      ipAddress,
      userAgent
    );

    // Set session cookie
    const cookieOptions = getSessionCookieOptions();
    const cookie = serializeCookie(SESSION_COOKIE_NAME, sessionToken, cookieOptions);

    const response = NextResponse.json({
      success: true,
      email,
      application_id,
      message: 'Successfully authenticated',
    });

    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to verify code',
      },
      { status: 500 }
    );
  }
}
