/**
 * Health Check API Endpoint
 *
 * Tests database connectivity and system health
 * GET /api/health
 */

import { NextRequest, NextResponse } from 'next/server';
import { healthCheck } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Test database connection
    const dbHealthy = await healthCheck();

    if (!dbHealthy) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'failed',
          },
          message: 'Database connection failed',
        },
        { status: 503 }
      );
    }

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
        },
        responseTime: `${responseTime}ms`,
        version: process.env.npm_package_version || '0.1.0',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'error',
        },
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
