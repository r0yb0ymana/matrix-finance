/**
 * useSession Hook
 *
 * React hook for client-side session management
 *
 * @module hooks/useSession
 */

'use client';

import { useState, useEffect } from 'react';
import type { ClientSession } from '@/lib/middleware';

interface UseSessionReturn {
  session: ClientSession | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get current session on the client side
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { session, loading } = useSession();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!session) return <div>Please log in</div>;
 *
 *   return <div>Welcome {session.email}</div>;
 * }
 * ```
 */
export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/session');

      if (!response.ok) {
        if (response.status === 401) {
          setSession(null);
          return;
        }
        throw new Error('Failed to fetch session');
      }

      const data = await response.json();
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return {
    session,
    loading,
    error,
    refetch: fetchSession,
  };
}

/**
 * Hook to require authentication (redirects if not logged in)
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { session, loading } = useRequireAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return <div>Protected content for {session.email}</div>;
 * }
 * ```
 */
export function useRequireAuth(): Omit<UseSessionReturn, 'session'> & { session: ClientSession } {
  const { session, loading, error, refetch } = useSession();

  useEffect(() => {
    if (!loading && !session) {
      window.location.href = '/login';
    }
  }, [session, loading]);

  return {
    session: session as ClientSession,
    loading,
    error,
    refetch,
  };
}
