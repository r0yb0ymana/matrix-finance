/**
 * Get Session API
 *
 * GET /api/auth/session
 *
 * Returns the current session information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSessionActivity, SESSION_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Get session from database
    const session = await getSession(sessionToken);

    if (!session) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    // Update last activity
    await updateSessionActivity(sessionToken);

    return NextResponse.json({
      success: true,
      session: {
        email: session.email,
        application_id: session.application_id,
        is_staff: !!session.staff_user_id,
        expires_at: session.expires_at,
      },
    });
  } catch (error) {
    console.error('Get session error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get session',
      },
      { status: 500 }
    );
  }
}
