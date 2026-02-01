/**
 * Authentication Middleware
 *
 * Utilities for protecting routes and validating sessions
 *
 * @module lib/middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession, updateSessionActivity, SESSION_COOKIE_NAME } from './auth';
import type { Session } from '@/types/database.types';

// =====================================================
// Session Validation
// =====================================================

/**
 * Get current session from request
 */
export async function getCurrentSession(request?: NextRequest): Promise<Session | null> {
  try {
    // Get session token from cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    // Get session from database
    const session = await getSession(sessionToken);

    if (!session) {
      return null;
    }

    // Update last activity
    await updateSessionActivity(sessionToken);

    return session;
  } catch (error) {
    console.error('Get current session error:', error);
    return null;
  }
}

/**
 * Require authentication for API routes
 *
 * Usage in API route:
 * ```ts
 * const session = await requireAuth(request);
 * if (!session) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * ```
 */
export async function requireAuth(request: NextRequest): Promise<Session | null> {
  return await getCurrentSession(request);
}

/**
 * Require staff authentication for admin routes
 */
export async function requireStaffAuth(request: NextRequest): Promise<Session | null> {
  const session = await getCurrentSession(request);

  if (!session || !session.staff_user_id) {
    return null;
  }

  return session;
}

// =====================================================
// API Route Helpers
// =====================================================

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Protect API route (HOC pattern)
 *
 * Usage:
 * ```ts
 * export const POST = protectRoute(async (request, session) => {
 *   // Your protected route logic here
 *   // session is guaranteed to exist
 * });
 * ```
 */
export function protectRoute(
  handler: (request: NextRequest, session: Session) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const session = await requireAuth(request);

    if (!session) {
      return unauthorizedResponse('Please log in to continue');
    }

    return handler(request, session);
  };
}

/**
 * Protect staff-only route
 */
export function protectStaffRoute(
  handler: (request: NextRequest, session: Session) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const session = await requireStaffAuth(request);

    if (!session) {
      return forbiddenResponse('Staff access required');
    }

    return handler(request, session);
  };
}

// =====================================================
// Server Component Helpers
// =====================================================

/**
 * Get session for server components
 *
 * Usage in Server Component:
 * ```tsx
 * export default async function Page() {
 *   const session = await getServerSession();
 *
 *   if (!session) {
 *     redirect('/login');
 *   }
 *
 *   return <div>Welcome {session.email}</div>;
 * }
 * ```
 */
export async function getServerSession(): Promise<Session | null> {
  return await getCurrentSession();
}

/**
 * Require session in server component (throws redirect if not authenticated)
 */
export async function requireServerSession(): Promise<Session> {
  const session = await getServerSession();

  if (!session) {
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }

  return session;
}

/**
 * Require staff session in server component
 */
export async function requireServerStaffSession(): Promise<Session> {
  const session = await getServerSession();

  if (!session || !session.staff_user_id) {
    const { redirect } = await import('next/navigation');
    redirect('/staff/login');
  }

  return session;
}

// =====================================================
// Client-Side Session Hook (for use with React)
// =====================================================

/**
 * Session data for client-side use
 */
export interface ClientSession {
  email: string;
  application_id?: string;
  is_staff: boolean;
  expires_at: Date;
}

/**
 * Fetch current session from API
 * (to be used in client components)
 */
export async function fetchSession(): Promise<ClientSession | null> {
  try {
    const response = await fetch('/api/auth/session');

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('Fetch session error:', error);
    return null;
  }
}
