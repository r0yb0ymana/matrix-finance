/**
 * Request Magic Link API
 *
 * POST /api/auth/request-link
 *
 * Sends a magic link to the user's email address
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMagicLink, buildMagicLinkURL, isValidEmail, getClientIP, checkRateLimit } from '@/lib/auth';
import { sendMagicLink } from '@/lib/email';

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
    const canProceed = await checkRateLimit(email, 'magic_link', 3, 60);
    if (!canProceed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in an hour.' },
        { status: 429 }
      );
    }

    // Get client IP
    const ipAddress = getClientIP(request.headers);

    // Create magic link token
    const token = await createMagicLink(email, undefined, ipAddress);
    const magicLinkURL = buildMagicLinkURL(token);

    // Send email
    await sendMagicLink(email, magicLinkURL);

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email address',
    });
  } catch (error) {
    console.error('Request magic link error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send magic link',
      },
      { status: 500 }
    );
  }
}
