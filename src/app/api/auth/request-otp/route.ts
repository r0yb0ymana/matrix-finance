/**
 * Request OTP API
 *
 * POST /api/auth/request-otp
 *
 * Creates and sends a 4-digit OTP code to the user's email
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOTP, isValidEmail, getClientIP, checkRateLimit } from '@/lib/auth';
import { sendOTP } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check rate limit
    const canProceed = await checkRateLimit(email, 'otp', 5, 60);
    if (!canProceed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in an hour.' },
        { status: 429 }
      );
    }

    // Get client IP
    const ipAddress = getClientIP(request.headers);

    // Create OTP code
    const code = await createOTP(email, ipAddress);

    // Send OTP email
    await sendOTP(email, code);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email address',
    });
  } catch (error) {
    console.error('Request OTP error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send verification code',
      },
      { status: 500 }
    );
  }
}
