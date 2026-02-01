/**
 * Loan Amount Calculator API
 *
 * POST /api/calculator/loan-amount
 *
 * Calculate maximum loan amount given desired payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateLoanAmount, isValidTerm } from '@/lib/calculator';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { desiredPayment, termMonths, annualRate, applicationFee, balloonAmount } = body;

    // Validate required fields
    if (!desiredPayment || !termMonths) {
      return NextResponse.json(
        { error: 'Desired payment and term are required' },
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

    // Calculate loan amount
    const result = await calculateLoanAmount({
      desiredPayment: parseFloat(desiredPayment),
      termMonths: parseInt(termMonths),
      annualRate: annualRate ? parseFloat(annualRate) : undefined,
      applicationFee: applicationFee ? parseFloat(applicationFee) : undefined,
      balloonAmount: balloonAmount ? parseFloat(balloonAmount) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Loan amount calculator error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Calculation failed',
      },
      { status: 500 }
    );
  }
}
