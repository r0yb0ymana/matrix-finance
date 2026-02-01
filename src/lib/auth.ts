/**
 * Authentication Utilities
 *
 * Helpers for OTP generation, token creation, and session management
 *
 * @module lib/auth
 */

import crypto from 'crypto';
import { query, transaction } from './db';
import type { OTPCode, MagicLink, Session } from '@/types/database.types';

// =====================================================
// Configuration
// =====================================================

const OTP_LENGTH = 4;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
const MAGIC_LINK_EXPIRY_HOURS = parseInt(process.env.MAGIC_LINK_EXPIRY_HOURS || '24');
const SESSION_TIMEOUT_MINUTES = parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30');
const MAX_OTP_ATTEMPTS_PER_HOUR = parseInt(process.env.MAX_OTP_ATTEMPTS_PER_HOUR || '5');

// =====================================================
// OTP Generation
// =====================================================

/**
 * Generate a random 4-digit OTP code
 */
export function generateOTP(): string {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  return code;
}

/**
 * Create and store OTP code in database
 */
export async function createOTP(
  email: string,
  ipAddress?: string
): Promise<string> {
  // Check rate limit
  const recentAttempts = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM otp_codes
     WHERE email = $1
       AND created_at > NOW() - INTERVAL '1 hour'`,
    [email]
  );

  const attemptCount = parseInt(recentAttempts.rows[0]?.count || '0');
  if (attemptCount >= MAX_OTP_ATTEMPTS_PER_HOUR) {
    throw new Error('Too many OTP requests. Please try again in an hour.');
  }

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await query(
    `INSERT INTO otp_codes (email, code, expires_at, ip_address)
     VALUES ($1, $2, $3, $4)`,
    [email, code, expiresAt, ipAddress]
  );

  return code;
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  email: string,
  code: string
): Promise<boolean> {
  const result = await query<OTPCode>(
    `SELECT * FROM otp_codes
     WHERE email = $1
       AND code = $2
       AND expires_at > NOW()
       AND used_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [email, code]
  );

  const otpRecord = result.rows[0];
  if (!otpRecord) {
    return false;
  }

  // Mark OTP as used
  await query(
    `UPDATE otp_codes
     SET used_at = NOW()
     WHERE id = $1`,
    [otpRecord.id]
  );

  return true;
}

// =====================================================
// Magic Link Generation
// =====================================================

/**
 * Generate a cryptographically secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Create and store magic link token
 */
export async function createMagicLink(
  email: string,
  applicationId?: string,
  ipAddress?: string
): Promise<string> {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_HOURS * 60 * 60 * 1000);

  await query(
    `INSERT INTO magic_links (token, email, application_id, expires_at, ip_address)
     VALUES ($1, $2, $3, $4, $5)`,
    [token, email, applicationId, expiresAt, ipAddress]
  );

  return token;
}

/**
 * Verify magic link token
 */
export async function verifyMagicLink(
  token: string
): Promise<{ email: string; application_id?: string } | null> {
  const result = await query<MagicLink>(
    `SELECT * FROM magic_links
     WHERE token = $1
       AND expires_at > NOW()
       AND used_at IS NULL
     LIMIT 1`,
    [token]
  );

  const magicLink = result.rows[0];
  if (!magicLink) {
    return null;
  }

  // Mark magic link as used
  await query(
    `UPDATE magic_links
     SET used_at = NOW()
     WHERE id = $1`,
    [magicLink.id]
  );

  return {
    email: magicLink.email,
    application_id: magicLink.application_id,
  };
}

/**
 * Build magic link URL
 */
export function buildMagicLinkURL(token: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/auth/verify?token=${token}`;
}

// =====================================================
// Session Management
// =====================================================

/**
 * Create a new session
 */
export async function createSession(
  email: string,
  applicationId?: string,
  staffUserId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const sessionToken = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TIMEOUT_MINUTES * 60 * 1000);

  await query(
    `INSERT INTO sessions (
      session_token, email, application_id, staff_user_id,
      expires_at, ip_address, user_agent
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [sessionToken, email, applicationId, staffUserId, expiresAt, ipAddress, userAgent]
  );

  return sessionToken;
}

/**
 * Get session by token
 */
export async function getSession(
  sessionToken: string
): Promise<Session | null> {
  const result = await query<Session>(
    `SELECT * FROM sessions
     WHERE session_token = $1
       AND expires_at > NOW()`,
    [sessionToken]
  );

  return result.rows[0] || null;
}

/**
 * Update session last activity timestamp
 */
export async function updateSessionActivity(
  sessionToken: string
): Promise<void> {
  const newExpiresAt = new Date(Date.now() + SESSION_TIMEOUT_MINUTES * 60 * 1000);

  await query(
    `UPDATE sessions
     SET last_activity_at = NOW(),
         expires_at = $2
     WHERE session_token = $1`,
    [sessionToken, newExpiresAt]
  );
}

/**
 * Delete session (logout)
 */
export async function deleteSession(sessionToken: string): Promise<void> {
  await query(
    `DELETE FROM sessions WHERE session_token = $1`,
    [sessionToken]
  );
}

/**
 * Clean up expired sessions (call this periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await query(
    `DELETE FROM sessions WHERE expires_at < NOW()`
  );

  return result.rowCount || 0;
}

/**
 * Clean up old OTP codes (call this periodically)
 */
export async function cleanupOldOTPCodes(): Promise<number> {
  const result = await query(
    `DELETE FROM otp_codes WHERE created_at < NOW() - INTERVAL '7 days'`
  );

  return result.rowCount || 0;
}

/**
 * Clean up old magic links (call this periodically)
 */
export async function cleanupOldMagicLinks(): Promise<number> {
  const result = await query(
    `DELETE FROM magic_links WHERE created_at < NOW() - INTERVAL '7 days'`
  );

  return result.rowCount || 0;
}

// =====================================================
// Cookie Helpers (for Next.js)
// =====================================================

export const SESSION_COOKIE_NAME = 'matrix_session';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

/**
 * Get session cookie options
 */
export function getSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TIMEOUT_MINUTES * 60, // seconds
    path: '/',
  };
}

/**
 * Serialize cookie (for Set-Cookie header)
 */
export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `SameSite=${options.sameSite}`,
  ];

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

/**
 * Create deletion cookie (for logout)
 */
export function createDeletionCookie(name: string): string {
  return `${name}=; Path=/; Max-Age=0`;
}

// =====================================================
// Validation Helpers
// =====================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate OTP code format
 */
export function isValidOTP(code: string): boolean {
  return /^\d{4}$/.test(code);
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(headers: Headers): string | undefined {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    undefined
  );
}

/**
 * Rate limit check helper
 */
export async function checkRateLimit(
  email: string,
  action: 'otp' | 'magic_link',
  maxAttempts: number = 5,
  windowMinutes: number = 60
): Promise<boolean> {
  const table = action === 'otp' ? 'otp_codes' : 'magic_links';

  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM ${table}
     WHERE email = $1
       AND created_at > NOW() - INTERVAL '${windowMinutes} minutes'`,
    [email]
  );

  const count = parseInt(result.rows[0]?.count || '0');
  return count < maxAttempts;
}
