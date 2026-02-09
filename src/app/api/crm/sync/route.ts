/**
 * CRM Sync API
 *
 * POST /api/crm/sync
 * Sync an application to Findesk CRM
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  syncApplicationToFindesk,
  isConfigured,
  type ApplicationSyncData,
} from '@/lib/findesk';

// =====================================================
// Types
// =====================================================

interface SyncRequest {
  applicationId: number;
}

interface SyncResponse {
  success: boolean;
  data?: {
    organisationId: string;
    personId: string;
    applicationId: string;
  };
  error?: string;
}

// =====================================================
// API Handler
// =====================================================

export async function POST(request: NextRequest): Promise<NextResponse<SyncResponse>> {
  try {
    // Check if Findesk is configured
    if (!isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Findesk CRM is not configured. Set FINDESK_BEARER_TOKEN and FINDESK_ENTERPRISE_ID.',
        },
        { status: 503 }
      );
    }

    // Parse request body
    const body: SyncRequest = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'applicationId is required',
        },
        { status: 400 }
      );
    }

    // Fetch application data from database
    const applicationResult = await query(
      `SELECT
        a.*,
        c.first_name as applicant_first_name,
        c.last_name as applicant_last_name,
        c.email as applicant_email,
        c.phone as applicant_phone,
        c.title as applicant_title
      FROM applications a
      LEFT JOIN contacts c ON c.application_id = a.id AND c.contact_type = 'applicant'
      WHERE a.id = $1`,
      [applicationId]
    );

    if (applicationResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Application ${applicationId} not found`,
        },
        { status: 404 }
      );
    }

    const app = applicationResult.rows[0];

    // Check if already synced
    if (app.crm_record_id) {
      return NextResponse.json(
        {
          success: false,
          error: `Application ${applicationId} already synced to Findesk (CRM ID: ${app.crm_record_id})`,
        },
        { status: 409 }
      );
    }

    // Prepare sync data
    const syncData: ApplicationSyncData = {
      businessName: app.business_name || app.entity_name,
      abn: app.abn,
      tradingName: app.trading_name,
      businessPhone: app.business_phone,
      businessEmail: app.business_email,
      businessAddress: app.business_street ? {
        street: app.business_street,
        city: app.business_city,
        state: app.business_state,
        postcode: app.business_postcode,
      } : undefined,
      applicantFirstName: app.applicant_first_name || '',
      applicantLastName: app.applicant_last_name || '',
      applicantEmail: app.applicant_email || app.email,
      applicantPhone: app.applicant_phone,
      applicantTitle: app.applicant_title,
      loanAmount: parseFloat(app.loan_amount) || 0,
      deposit: app.deposit ? parseFloat(app.deposit) : undefined,
      purchasePrice: app.purchase_price ? parseFloat(app.purchase_price) : undefined,
      term: app.loan_term,
      productType: app.product_type,
    };

    // Sync to Findesk
    const syncResult = await syncApplicationToFindesk(syncData);

    if (!syncResult.success) {
      // Log failed sync
      await query(
        `INSERT INTO crm_sync_log (application_id, sync_direction, status, error_message)
         VALUES ($1, 'to_crm', 'failed', $2)`,
        [applicationId, syncResult.error]
      );

      return NextResponse.json(
        {
          success: false,
          error: syncResult.error,
        },
        { status: 500 }
      );
    }

    // Update application with CRM record ID
    await query(
      `UPDATE applications
       SET crm_record_id = $1, crm_synced_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [syncResult.applicationId, applicationId]
    );

    // Log successful sync
    await query(
      `INSERT INTO crm_sync_log (application_id, sync_direction, status, crm_record_id)
       VALUES ($1, 'to_crm', 'success', $2)`,
      [applicationId, syncResult.applicationId]
    );

    return NextResponse.json({
      success: true,
      data: {
        organisationId: syncResult.organisationId!,
        personId: syncResult.personId!,
        applicationId: syncResult.applicationId!,
      },
    });

  } catch (error) {
    console.error('CRM sync error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to sync to CRM';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
