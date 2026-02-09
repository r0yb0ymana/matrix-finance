/**
 * CRM Webhook API
 *
 * POST /api/crm/webhook
 * Receive webhook events from Findesk CRM
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// =====================================================
// Types
// =====================================================

interface FindeskWebhookEvent {
  event: string;
  data: {
    id: string;
    type: 'lead' | 'application' | 'person' | 'organisation';
    status?: string;
    [key: string]: unknown;
  };
  timestamp: string;
}

interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// =====================================================
// Webhook Verification
// =====================================================

function verifyWebhookSignature(request: NextRequest, body: string): boolean {
  const webhookSecret = process.env.WEBHOOK_SECRET;

  // If no secret configured, skip verification (not recommended for production)
  if (!webhookSecret) {
    console.warn('WEBHOOK_SECRET not configured - skipping signature verification');
    return true;
  }

  const signature = request.headers.get('x-findesk-signature');

  if (!signature) {
    console.warn('Missing webhook signature header');
    return false;
  }

  // Simple HMAC verification (adjust based on Findesk's actual signature method)
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  return signature === expectedSignature;
}

// =====================================================
// Event Handlers
// =====================================================

async function handleApplicationStatusChange(data: FindeskWebhookEvent['data']): Promise<void> {
  const { id: crmRecordId, status } = data;

  if (!crmRecordId || !status) {
    console.warn('Missing crmRecordId or status in webhook data');
    return;
  }

  // Find local application by CRM record ID
  const result = await query(
    `SELECT id FROM applications WHERE crm_record_id = $1`,
    [crmRecordId]
  );

  if (result.rows.length === 0) {
    console.warn(`No local application found for CRM record ${crmRecordId}`);
    return;
  }

  const applicationId = result.rows[0].id;

  // Map Findesk status to local status
  const statusMap: Record<string, string> = {
    'New': 'draft',
    'In Progress': 'submitted',
    'Under Review': 'review',
    'Approved': 'approved',
    'Declined': 'declined',
    'Withdrawn': 'withdrawn',
    'Settled': 'settled',
  };

  const localStatus = statusMap[status] || status.toLowerCase();

  // Update local application status
  await query(
    `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2`,
    [localStatus, applicationId]
  );

  // Log the sync
  await query(
    `INSERT INTO crm_sync_log (application_id, sync_direction, status, crm_record_id)
     VALUES ($1, 'from_crm', 'success', $2)`,
    [applicationId, crmRecordId]
  );

  console.log(`Updated application ${applicationId} status to ${localStatus} from CRM`);
}

async function handleLeadCreated(data: FindeskWebhookEvent['data']): Promise<void> {
  // Handle lead created event if needed
  console.log('Lead created in CRM:', data.id);
}

async function handleApplicationCreated(data: FindeskWebhookEvent['data']): Promise<void> {
  // Handle application created in CRM (if created externally)
  console.log('Application created in CRM:', data.id);
}

// =====================================================
// API Handler
// =====================================================

export async function POST(request: NextRequest): Promise<NextResponse<WebhookResponse>> {
  try {
    const bodyText = await request.text();

    // Verify webhook signature
    if (!verifyWebhookSignature(request, bodyText)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid webhook signature',
        },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const event: FindeskWebhookEvent = JSON.parse(bodyText);

    console.log(`Received Findesk webhook: ${event.event}`, {
      type: event.data.type,
      id: event.data.id,
    });

    // Handle different event types
    switch (event.event) {
      case 'application.status_changed':
        await handleApplicationStatusChange(event.data);
        break;

      case 'application.created':
        await handleApplicationCreated(event.data);
        break;

      case 'lead.created':
        await handleLeadCreated(event.data);
        break;

      case 'lead.converted':
        // Lead converted to application
        console.log('Lead converted:', event.data.id);
        break;

      default:
        console.log(`Unhandled webhook event: ${event.event}`);
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

// Allow GET for webhook verification (if Findesk requires it)
export async function GET(request: NextRequest): Promise<NextResponse> {
  const challenge = request.nextUrl.searchParams.get('challenge');

  if (challenge) {
    // Return challenge for webhook verification
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({
    message: 'Findesk CRM webhook endpoint',
    status: 'active',
  });
}
