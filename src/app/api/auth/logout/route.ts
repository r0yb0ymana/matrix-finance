/**
 * Logout API
 *
 * POST /api/auth/logout
 *
 * Destroys the current session
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, SESSION_COOKIE_NAME, createDeletionCookie } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      // Delete session from database
      await deleteSession(sessionToken);
    }

    // Clear session cookie
    const deletionCookie = createDeletionCookie(SESSION_COOKIE_NAME);

    const response = NextResponse.json({
      success: true,
      message: 'Successfully logged out',
    });

    response.headers.set('Set-Cookie', deletionCookie);

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to logout',
      },
      { status: 500 }
    );
  }
}
