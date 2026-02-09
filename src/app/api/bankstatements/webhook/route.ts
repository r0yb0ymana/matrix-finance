/**
 * Bank Statements Webhook API
 *
 * POST /api/bankstatements/webhook
 * Receive webhook events from bankstatements.com.au
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  verifyWebhookSignature,
  fetchStatements,
  type BankStatementsWebhookEvent,
} from '@/lib/bankstatements';

// =====================================================
// Types
// =====================================================

interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// =====================================================
// Event Handlers
// =====================================================

async function handleConnectionCompleted(event: BankStatementsWebhookEvent): Promise<void> {
  const { connectionId, data } = event;

  // Update connection status in database
  await query(
    `UPDATE bank_connections
     SET status = 'connected', updated_at = NOW()
     WHERE connection_id = $1`,
    [connectionId]
  );

  // Optionally auto-fetch statements
  if (data.autoFetch) {
    try {
      await fetchStatements({ connectionId, months: 6 });
    } catch (error) {
      console.error('Auto-fetch statements failed:', error);
    }
  }
}

async function handleConnectionExpired(event: BankStatementsWebhookEvent): Promise<void> {
  const { connectionId } = event;

  // Update connection status in database
  await query(
    `UPDATE bank_connections
     SET status = 'expired', updated_at = NOW()
     WHERE connection_id = $1`,
    [connectionId]
  );
}

async function handleConnectionFailed(event: BankStatementsWebhookEvent): Promise<void> {
  const { connectionId, data } = event;

  console.error(`Bank connection failed: ${connectionId}`, data.error);

  // Update connection status in database
  await query(
    `UPDATE bank_connections
     SET status = 'failed', error_message = $2, updated_at = NOW()
     WHERE connection_id = $1`,
    [connectionId, data.error || 'Unknown error']
  );
}

async function handleStatementsReady(event: BankStatementsWebhookEvent): Promise<void> {
  const { connectionId, data } = event;

  // Fetch the statements
  try {
    const result = await fetchStatements({ connectionId, months: 6 });

    // Statements fetched successfully
  } catch (error) {
    console.error('Failed to fetch statements after webhook:', error);
  }
}

// =====================================================
// API Handler
// =====================================================

export async function POST(request: NextRequest): Promise<NextResponse<WebhookResponse>> {
  try {
    const bodyText = await request.text();

    // Verify webhook signature
    const signature = request.headers.get('x-bankstatements-signature') || '';

    if (!verifyWebhookSignature(bodyText, signature)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid webhook signature',
        },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const event: BankStatementsWebhookEvent = JSON.parse(bodyText);

    // Handle different event types
    switch (event.event) {
      case 'connection.completed':
        await handleConnectionCompleted(event);
        break;

      case 'connection.expired':
        await handleConnectionExpired(event);
        break;

      case 'connection.failed':
        await handleConnectionFailed(event);
        break;

      case 'statements.ready':
        await handleStatementsReady(event);
        break;

      case 'statements.updated':
        break;

      default:
        console.warn(`Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({
      success: true,
      message: `Processed event: ${event.event}`,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to process webhook';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Allow GET for webhook verification
export async function GET(request: NextRequest): Promise<NextResponse> {
  const challenge = request.nextUrl.searchParams.get('challenge');

  if (challenge) {
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({
    message: 'Bank Statements webhook endpoint',
    status: 'active',
  });
}
