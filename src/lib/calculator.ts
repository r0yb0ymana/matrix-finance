/**
 * Finance Calculator Business Logic
 *
 * Implements Matrix Equipment Finance calculation logic:
 * - Payment Calculator: Invoice amount → Monthly payment
 * - Rate Calculator: Desired payment → Effective rate
 * - Loan Amount Calculator: Desired payment → Max loan amount
 *
 * @module lib/calculator
 */

import 'server-only';
import { PMT, RATE, PV, roundCurrency, roundRate } from './financial';
import { query } from './db';
import type { RateBand } from '@/types/database.types';

// =====================================================
// Constants (from spec)
// =====================================================

export const DEFAULT_APPLICATION_FEE = 495.00;
export const MIN_LOAN_AMOUNT = 10000;
export const MAX_LOAN_AMOUNT = 500000;
export const AVAILABLE_TERMS = [24, 36, 48, 60]; // months
export const DEFAULT_BALLOON = 0; // No balloon payment
export const PAYMENT_TIMING = 1; // Advance (beginning of period)

// Default rate bands (matches database seed data)
const DEFAULT_RATE_BANDS = [
  { min_amount: 5000, max_amount: 20000, annual_rate: 0.1595 },
  { min_amount: 20000.01, max_amount: 75000, annual_rate: 0.1165 },
  { min_amount: 75000.01, max_amount: 150000, annual_rate: 0.1070 },
  { min_amount: 150000.01, max_amount: 250000, annual_rate: 0.1030 },
  { min_amount: 250000.01, max_amount: 500000, annual_rate: 0.0995 },
];

// =====================================================
// Rate Band Lookup
// =====================================================

/**
 * Get rate bands from database or use defaults
 */
export async function getRateBands(): Promise<RateBand[]> {
  try {
    const result = await query<RateBand>(
      `SELECT * FROM rate_bands
       WHERE is_active = true
       AND (effective_from IS NULL OR effective_from <= CURRENT_DATE)
       AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
       ORDER BY min_amount ASC`
    );

    if (result.rows.length > 0) {
      return result.rows;
    }
  } catch (error) {
    console.warn('Failed to fetch rate bands from database, using defaults:', error);
  }

  // Return defaults if database query fails or no active bands
  return DEFAULT_RATE_BANDS as RateBand[];
}

/**
 * Find applicable rate for a given invoice amount
 *
 * @param invoiceAmount - Equipment invoice amount
 * @returns Annual interest rate (as decimal, e.g., 0.1165 for 11.65%)
 */
export async function getApplicableRate(invoiceAmount: number): Promise<number> {
  const rateBands = await getRateBands();

  for (const band of rateBands) {
    if (invoiceAmount >= band.min_amount && invoiceAmount <= band.max_amount) {
      return band.annual_rate;
    }
  }

  // If no band matches, throw error
  throw new Error(
    `Invoice amount $${invoiceAmount} is outside valid range ($${MIN_LOAN_AMOUNT} - $${MAX_LOAN_AMOUNT})`
  );
}

/**
 * Find applicable rate band for a given invoice amount
 */
export async function getApplicableRateBand(invoiceAmount: number): Promise<RateBand | null> {
  const rateBands = await getRateBands();

  for (const band of rateBands) {
    if (invoiceAmount >= band.min_amount && invoiceAmount <= band.max_amount) {
      return band;
    }
  }

  return null;
}

// =====================================================
// Calculator Functions
// =====================================================

export interface PaymentCalculatorInput {
  invoiceAmount: number;
  termMonths: number;
  applicationFee?: number;
  balloonAmount?: number;
}

export interface PaymentCalculatorOutput {
  invoiceAmount: number;
  applicationFee: number;
  amountFinanced: number;
  termMonths: number;
  annualRate: number;
  monthlyRate: number;
  monthlyPayment: number;
  totalPayable: number;
  totalInterest: number;
  balloonAmount: number;
  rateBand?: RateBand;
}

/**
 * Payment Calculator
 *
 * Given invoice amount and term, calculate monthly payment
 *
 * Formula: PMT(rate/12, term, -(invoice + fee), balloon, 1)
 */
export async function calculatePayment(
  input: PaymentCalculatorInput
): Promise<PaymentCalculatorOutput> {
  const {
    invoiceAmount,
    termMonths,
    applicationFee = DEFAULT_APPLICATION_FEE,
    balloonAmount = DEFAULT_BALLOON,
  } = input;

  // Validate inputs
  if (invoiceAmount < MIN_LOAN_AMOUNT || invoiceAmount > MAX_LOAN_AMOUNT) {
    throw new Error(
      `Invoice amount must be between $${MIN_LOAN_AMOUNT.toLocaleString()} and $${MAX_LOAN_AMOUNT.toLocaleString()}`
    );
  }

  if (!AVAILABLE_TERMS.includes(termMonths)) {
    throw new Error(`Term must be one of: ${AVAILABLE_TERMS.join(', ')} months`);
  }

  // Get applicable rate
  const annualRate = await getApplicableRate(invoiceAmount);
  const monthlyRate = annualRate / 12;

  // Calculate amount financed
  const amountFinanced = invoiceAmount + applicationFee;

  // Calculate monthly payment using PMT function
  // Note: PV is negative (outflow), balloon is positive (inflow), type=1 (advance)
  const monthlyPayment = roundCurrency(
    PMT(monthlyRate, termMonths, -amountFinanced, balloonAmount, PAYMENT_TIMING)
  );

  // Calculate totals
  const totalPayable = monthlyPayment * termMonths + balloonAmount;
  const totalInterest = totalPayable - amountFinanced;

  // Get rate band for reference
  const rateBand = await getApplicableRateBand(invoiceAmount);

  return {
    invoiceAmount: roundCurrency(invoiceAmount),
    applicationFee: roundCurrency(applicationFee),
    amountFinanced: roundCurrency(amountFinanced),
    termMonths,
    annualRate: roundRate(annualRate),
    monthlyRate: roundRate(monthlyRate),
    monthlyPayment,
    totalPayable: roundCurrency(totalPayable),
    totalInterest: roundCurrency(totalInterest),
    balloonAmount: roundCurrency(balloonAmount),
    rateBand: rateBand || undefined,
  };
}

export interface RateCalculatorInput {
  invoiceAmount: number;
  termMonths: number;
  desiredPayment: number;
  applicationFee?: number;
  balloonAmount?: number;
}

export interface RateCalculatorOutput {
  invoiceAmount: number;
  applicationFee: number;
  amountFinanced: number;
  termMonths: number;
  desiredPayment: number;
  effectiveAnnualRate: number;
  effectiveMonthlyRate: number;
  standardAnnualRate: number;
  rateDifference: number;
  balloonAmount: number;
}

/**
 * Rate Calculator
 *
 * Given invoice amount, term, and desired payment, calculate effective rate
 *
 * Formula: RATE(term, -payment, invoice+fee, balloon, 1) * 12
 */
export async function calculateRate(
  input: RateCalculatorInput
): Promise<RateCalculatorOutput> {
  const {
    invoiceAmount,
    termMonths,
    desiredPayment,
    applicationFee = DEFAULT_APPLICATION_FEE,
    balloonAmount = DEFAULT_BALLOON,
  } = input;

  // Validate inputs
  if (invoiceAmount < MIN_LOAN_AMOUNT || invoiceAmount > MAX_LOAN_AMOUNT) {
    throw new Error(
      `Invoice amount must be between $${MIN_LOAN_AMOUNT.toLocaleString()} and $${MAX_LOAN_AMOUNT.toLocaleString()}`
    );
  }

  if (!AVAILABLE_TERMS.includes(termMonths)) {
    throw new Error(`Term must be one of: ${AVAILABLE_TERMS.join(', ')} months`);
  }

  // Calculate amount financed
  const amountFinanced = invoiceAmount + applicationFee;

  // Get standard rate for comparison
  const standardAnnualRate = await getApplicableRate(invoiceAmount);

  // Calculate effective rate using RATE function
  // Note: PMT is negative (outflow), PV is positive (inflow), type=1 (advance)
  const effectiveMonthlyRate = RATE(
    termMonths,
    -desiredPayment,
    amountFinanced,
    balloonAmount,
    PAYMENT_TIMING,
    standardAnnualRate / 12 // Use standard rate as initial guess
  );

  const effectiveAnnualRate = effectiveMonthlyRate * 12;
  const rateDifference = effectiveAnnualRate - standardAnnualRate;

  return {
    invoiceAmount: roundCurrency(invoiceAmount),
    applicationFee: roundCurrency(applicationFee),
    amountFinanced: roundCurrency(amountFinanced),
    termMonths,
    desiredPayment: roundCurrency(desiredPayment),
    effectiveAnnualRate: roundRate(effectiveAnnualRate),
    effectiveMonthlyRate: roundRate(effectiveMonthlyRate),
    standardAnnualRate: roundRate(standardAnnualRate),
    rateDifference: roundRate(rateDifference),
    balloonAmount: roundCurrency(balloonAmount),
  };
}

export interface LoanAmountCalculatorInput {
  desiredPayment: number;
  termMonths: number;
  annualRate?: number; // If not provided, we'll iterate through rate bands
  applicationFee?: number;
  balloonAmount?: number;
}

export interface LoanAmountCalculatorOutput {
  desiredPayment: number;
  termMonths: number;
  annualRate: number;
  monthlyRate: number;
  maxInvoiceAmount: number;
  applicationFee: number;
  amountFinanced: number;
  balloonAmount: number;
  rateBand?: RateBand;
}

/**
 * Loan Amount Calculator
 *
 * Given desired payment and term, calculate maximum loan amount
 *
 * Formula: PV(rate/12, term, -payment, balloon, 1) - applicationFee
 */
export async function calculateLoanAmount(
  input: LoanAmountCalculatorInput
): Promise<LoanAmountCalculatorOutput> {
  const {
    desiredPayment,
    termMonths,
    annualRate: providedRate,
    applicationFee = DEFAULT_APPLICATION_FEE,
    balloonAmount = DEFAULT_BALLOON,
  } = input;

  // Validate inputs
  if (!AVAILABLE_TERMS.includes(termMonths)) {
    throw new Error(`Term must be one of: ${AVAILABLE_TERMS.join(', ')} months`);
  }

  // If rate is provided, use it; otherwise, we need to iterate
  let annualRate: number;
  let maxInvoiceAmount: number;
  let rateBand: RateBand | undefined;

  if (providedRate) {
    annualRate = providedRate;
    const monthlyRate = annualRate / 12;

    // Calculate amount financed using PV function
    // Note: PMT is negative (outflow), FV is positive (balloon), type=1 (advance)
    const amountFinanced = PV(
      monthlyRate,
      termMonths,
      -desiredPayment,
      balloonAmount,
      PAYMENT_TIMING
    );

    maxInvoiceAmount = amountFinanced - applicationFee;
  } else {
    // Iterate through rate bands to find the highest loan amount
    // that results in the desired payment
    const rateBands = await getRateBands();
    let bestAmount = 0;
    let bestRate = 0;
    let bestBand: RateBand | undefined;

    for (const band of rateBands) {
      const monthlyRate = band.annual_rate / 12;

      const amountFinanced = PV(
        monthlyRate,
        termMonths,
        -desiredPayment,
        balloonAmount,
        PAYMENT_TIMING
      );

      const invoiceAmount = amountFinanced - applicationFee;

      // Check if this invoice amount falls within the band's range
      if (invoiceAmount >= band.min_amount && invoiceAmount <= band.max_amount) {
        if (invoiceAmount > bestAmount) {
          bestAmount = invoiceAmount;
          bestRate = band.annual_rate;
          bestBand = band;
        }
      }
    }

    if (bestAmount === 0) {
      throw new Error('Could not find a valid loan amount for the desired payment');
    }

    maxInvoiceAmount = bestAmount;
    annualRate = bestRate;
    rateBand = bestBand;
  }

  // Ensure within limits
  maxInvoiceAmount = Math.max(MIN_LOAN_AMOUNT, Math.min(MAX_LOAN_AMOUNT, maxInvoiceAmount));

  const monthlyRate = annualRate / 12;
  const amountFinanced = maxInvoiceAmount + applicationFee;

  // Get rate band if not already set
  if (!rateBand) {
    rateBand = (await getApplicableRateBand(maxInvoiceAmount)) || undefined;
  }

  return {
    desiredPayment: roundCurrency(desiredPayment),
    termMonths,
    annualRate: roundRate(annualRate),
    monthlyRate: roundRate(monthlyRate),
    maxInvoiceAmount: roundCurrency(maxInvoiceAmount),
    applicationFee: roundCurrency(applicationFee),
    amountFinanced: roundCurrency(amountFinanced),
    balloonAmount: roundCurrency(balloonAmount),
    rateBand,
  };
}

// =====================================================
// Validation Helpers
// =====================================================

/**
 * Validate invoice amount is within allowed range
 */
export function isValidInvoiceAmount(amount: number): boolean {
  return amount >= MIN_LOAN_AMOUNT && amount <= MAX_LOAN_AMOUNT;
}

/**
 * Validate term is in available terms
 */
export function isValidTerm(months: number): boolean {
  return AVAILABLE_TERMS.includes(months);
}

/**
 * Get validation error message for invoice amount
 */
export function getInvoiceAmountError(amount: number): string | null {
  if (amount < MIN_LOAN_AMOUNT) {
    return `Minimum loan amount is $${MIN_LOAN_AMOUNT.toLocaleString()}`;
  }
  if (amount > MAX_LOAN_AMOUNT) {
    return `Maximum loan amount is $${MAX_LOAN_AMOUNT.toLocaleString()}`;
  }
  return null;
}
