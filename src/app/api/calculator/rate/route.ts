/**
 * Rate Calculator API
 *
 * POST /api/calculator/rate
 *
 * Calculate effective interest rate given desired payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateRate, isValidInvoiceAmount, isValidTerm } from '@/lib/calculator';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceAmount, termMonths, desiredPayment, applicationFee, balloonAmount } = body;

    // Validate required fields
    if (!invoiceAmount || !termMonths || !desiredPayment) {
      return NextResponse.json(
        { error: 'Invoice amount, term, and desired payment are required' },
        { status: 400 }
      );
    }

    // Validate invoice amount
    if (!isValidInvoiceAmount(invoiceAmount)) {
      return NextResponse.json(
        { error: `Invoice amount must be between $10,000 and $500,000` },
        { status: 400 }
      );
    }

    // Validate term
    if (!isValidTerm(termMonths)) {
      return NextResponse.json(
        { error: 'Term must be 24, 36, 48, or 60 months' },
        { status: 400 }
      );
    }

    // Calculate rate
    const result = await calculateRate({
      invoiceAmount: parseFloat(invoiceAmount),
      termMonths: parseInt(termMonths),
      desiredPayment: parseFloat(desiredPayment),
      applicationFee: applicationFee ? parseFloat(applicationFee) : undefined,
      balloonAmount: balloonAmount ? parseFloat(balloonAmount) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Rate calculator error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Calculation failed',
      },
      { status: 500 }
    );
  }
}
