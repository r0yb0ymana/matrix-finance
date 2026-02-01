/**
 * Application Submission API
 *
 * POST /api/applications/submit
 * Submit a new equipment finance application
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { EntityType, ApplicationStatus, FinanceProduct } from '@/types/database.types';

// =====================================================
// Request/Response Types
// =====================================================

interface ApplicationSubmitRequest {
  // Business details
  abn?: string;
  tradingName?: string;
  businessName?: string;
  registeredAddress?: {
    line1: string;
    line2?: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  businessAddress?: {
    line1: string;
    line2?: string;
    suburb: string;
    state: string;
    postcode: string;
  };

  // Applicant details
  applicantFirstName?: string;
  applicantLastName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  applicantDateOfBirth?: string;
  applicantDriversLicense?: string;

  // Financial position
  assets?: {
    realEstate?: number;
    motor_vehicles?: number;
    savings?: number;
    shares?: number;
    other?: number;
  };
  liabilities?: {
    home_loan?: number;
    credit_cards?: number;
    personal_loans?: number;
    other?: number;
  };

  // Finance details (optional - may be added later)
  financeProduct?: string;
  invoiceAmount?: number;
  termMonths?: number;
  monthlyPayment?: number;
  annualRate?: number;
}

interface ApplicationSubmitResponse {
  success: boolean;
  data?: {
    applicationId: string;
    applicationNumber: string;
  };
  error?: string;
}

// =====================================================
// Helper Functions
// =====================================================

function generateApplicationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `APP-${timestamp}-${random}`;
}

// =====================================================
// API Handler
// =====================================================

export async function POST(request: NextRequest): Promise<NextResponse<ApplicationSubmitResponse>> {
  try {
    const body = await request.json() as ApplicationSubmitRequest;

    // Validate required fields
    if (!body.abn || !body.businessName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Business details are required',
        },
        { status: 400 }
      );
    }

    if (!body.applicantFirstName || !body.applicantLastName || !body.applicantEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Applicant details are required',
        },
        { status: 400 }
      );
    }

    // Generate application number
    const applicationNumber = generateApplicationNumber();

    // Create application in transaction
    const result = await transaction(async (client) => {
      // 1. Create application record
      const applicationResult = await client.query(
        `INSERT INTO applications (
          application_number,
          status,
          entity_type,
          finance_product,
          invoice_amount,
          term_months,
          monthly_payment,
          annual_rate,
          abn,
          trading_name,
          business_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, application_number`,
        [
          applicationNumber,
          ApplicationStatus.INCOMPLETE, // Start as incomplete
          EntityType.SOLE_TRADER,
          body.financeProduct || null,
          body.invoiceAmount || null,
          body.termMonths || null,
          body.monthlyPayment || null,
          body.annualRate || null,
          body.abn,
          body.tradingName,
          body.businessName,
        ]
      );

      const applicationId = applicationResult.rows[0].id;

      // 2. Create contact record for sole trader (applicant)
      const contactResult = await client.query(
        `INSERT INTO contacts (
          application_id,
          role,
          first_name,
          last_name,
          email,
          phone,
          date_of_birth,
          drivers_license
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          applicationId,
          'sole_trader',
          body.applicantFirstName,
          body.applicantLastName,
          body.applicantEmail,
          body.applicantPhone,
          body.applicantDateOfBirth,
          body.applicantDriversLicense,
        ]
      );

      const contactId = contactResult.rows[0].id;

      // 3. Create address records
      if (body.registeredAddress) {
        await client.query(
          `INSERT INTO addresses (
            application_id,
            address_type,
            line_1,
            line_2,
            suburb,
            state,
            postcode
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            applicationId,
            'registered',
            body.registeredAddress.line1,
            body.registeredAddress.line2 || null,
            body.registeredAddress.suburb,
            body.registeredAddress.state,
            body.registeredAddress.postcode,
          ]
        );
      }

      if (body.businessAddress) {
        await client.query(
          `INSERT INTO addresses (
            application_id,
            address_type,
            line_1,
            line_2,
            suburb,
            state,
            postcode
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            applicationId,
            'business',
            body.businessAddress.line1,
            body.businessAddress.line2 || null,
            body.businessAddress.suburb,
            body.businessAddress.state,
            body.businessAddress.postcode,
          ]
        );
      }

      // 4. Create financial position record
      if (body.assets || body.liabilities) {
        await client.query(
          `INSERT INTO financial_positions (
            contact_id,
            application_id,
            real_estate,
            motor_vehicles,
            savings,
            shares_investments,
            other_assets,
            home_loan,
            credit_cards,
            personal_loans,
            other_liabilities
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            contactId,
            applicationId,
            body.assets?.realEstate || 0,
            body.assets?.motor_vehicles || 0,
            body.assets?.savings || 0,
            body.assets?.shares || 0,
            body.assets?.other || 0,
            body.liabilities?.home_loan || 0,
            body.liabilities?.credit_cards || 0,
            body.liabilities?.personal_loans || 0,
            body.liabilities?.other || 0,
          ]
        );
      }

      return {
        applicationId,
        applicationNumber,
      };
    });

    // TODO: Send confirmation email
    // TODO: Trigger CRM sync
    // TODO: Create audit log entry

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Application submission error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to submit application';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
