/**
 * Bank Statements Fetch API
 *
 * POST /api/bankstatements/fetch
 * Fetch bank statements for a connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchStatements, getConnection, isConfigured } from '@/lib/bankstatements';
import { query } from '@/lib/db';

// =====================================================
// Types
// =====================================================

interface FetchRequest {
  connectionId: string;
  applicationId?: string;
  months?: number;
}

interface FetchResponse {
  success: boolean;
  statements?: Array<{
    id: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    periodStart: string;
    periodEnd: string;
    openingBalance: number;
    closingBalance: number;
    transactionCount: number;
  }>;
  error?: string;
}

// =====================================================
// API Handler
// =====================================================

export async function POST(request: NextRequest): Promise<NextResponse<FetchResponse>> {
  try {
    // Check if configured (allow mock in development)
    const isDev = process.env.NODE_ENV === 'development';
    if (!isConfigured() && !isDev) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bank Statements API is not configured.',
        },
        { status: 503 }
      );
    }

    // Parse request body
    const body: FetchRequest = await request.json();
    const { connectionId, applicationId, months = 6 } = body;

    if (!connectionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'connectionId is required',
        },
        { status: 400 }
      );
    }

    // Verify connection is still valid
    const connectionResult = await getConnection(connectionId);

    if (!connectionResult.success || connectionResult.data?.status !== 'connected') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bank connection is not active. Please reconnect.',
        },
        { status: 400 }
      );
    }

    // Fetch statements
    const result = await fetchStatements({
      connectionId,
      months,
    });

    if (!result.success || !result.statements) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch statements',
        },
        { status: 500 }
      );
    }

    // Store statements in database (if we have application ID)
    if (applicationId && result.statements.length > 0) {
      try {
        for (const statement of result.statements) {
          await query(
            `INSERT INTO documents (
              application_id,
              document_type,
              file_name,
              file_url,
              file_size,
              mime_type,
              metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              applicationId,
              'bank_statement',
              `${statement.bankName}_${statement.periodStart}_${statement.periodEnd}.json`,
              statement.fileUrl || '',
              JSON.stringify(statement).length,
              'application/json',
              JSON.stringify({
                statementId: statement.id,
                connectionId: statement.connectionId,
                accountNumber: statement.accountNumber,
                accountName: statement.accountName,
                bankName: statement.bankName,
                periodStart: statement.periodStart,
                periodEnd: statement.periodEnd,
                openingBalance: statement.openingBalance,
                closingBalance: statement.closingBalance,
                transactionCount: statement.transactions.length,
                source: 'open_banking',
              }),
            ]
          );
        }
      } catch (dbError) {
        console.error('Failed to store bank statements:', dbError);
        // Continue even if DB save fails
      }
    }

    // Return summary (without full transaction data)
    const statementSummaries = result.statements.map(s => ({
      id: s.id,
      accountNumber: s.accountNumber,
      accountName: s.accountName,
      bankName: s.bankName,
      periodStart: s.periodStart,
      periodEnd: s.periodEnd,
      openingBalance: s.openingBalance,
      closingBalance: s.closingBalance,
      transactionCount: s.transactions.length,
    }));

    return NextResponse.json({
      success: true,
      statements: statementSummaries,
    });

  } catch (error) {
    console.error('Fetch statements error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to fetch statements';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
