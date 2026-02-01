/**
 * Financial Calculation Functions
 *
 * TypeScript implementations of Excel financial functions:
 * - PMT: Calculate periodic payment
 * - RATE: Calculate interest rate
 * - PV: Calculate present value
 *
 * @module lib/financial
 */

// =====================================================
// Financial Functions
// =====================================================

/**
 * Calculate periodic payment for a loan (PMT function)
 *
 * @param rate - Interest rate per period (e.g., 0.10/12 for 10% annual rate monthly)
 * @param nper - Total number of payment periods
 * @param pv - Present value (loan amount) - negative for outflow
 * @param fv - Future value (balloon payment) - default 0
 * @param type - Payment timing: 0 = end of period, 1 = beginning of period
 * @returns Monthly payment amount
 *
 * @example
 * // Calculate monthly payment for $50,000 loan at 10% annual rate for 36 months
 * const payment = PMT(0.10/12, 36, -50000, 0, 1);
 * // Returns: ~1,452.45
 */
export function PMT(
  rate: number,
  nper: number,
  pv: number,
  fv: number = 0,
  type: 0 | 1 = 0
): number {
  if (rate === 0) {
    return -(pv + fv) / nper;
  }

  const pvif = Math.pow(1 + rate, nper);
  let payment = (rate * (pv * pvif + fv)) / (pvif - 1);

  if (type === 1) {
    payment = payment / (1 + rate);
  }

  return -payment;
}

/**
 * Calculate interest rate per period (RATE function)
 *
 * Uses Newton-Raphson method to find the rate iteratively
 *
 * @param nper - Total number of payment periods
 * @param pmt - Payment per period
 * @param pv - Present value (loan amount)
 * @param fv - Future value (balloon payment) - default 0
 * @param type - Payment timing: 0 = end of period, 1 = beginning of period
 * @param guess - Initial guess for rate - default 0.1 (10%)
 * @returns Interest rate per period
 *
 * @example
 * // Find monthly rate for $50,000 loan with $1,500 monthly payment for 36 months
 * const monthlyRate = RATE(36, -1500, 50000, 0, 1, 0.01);
 * const annualRate = monthlyRate * 12;
 */
export function RATE(
  nper: number,
  pmt: number,
  pv: number,
  fv: number = 0,
  type: 0 | 1 = 0,
  guess: number = 0.1
): number {
  // Maximum iterations and precision
  const maxIter = 100;
  const precision = 1e-10;

  let rate = guess;

  for (let i = 0; i < maxIter; i++) {
    if (Math.abs(rate) < precision) {
      rate = precision; // Avoid division by zero
    }

    // Calculate present value with current rate
    const f = calculatePV(rate, nper, pmt, fv, type) - pv;

    // If close enough, return the rate
    if (Math.abs(f) < precision) {
      return rate;
    }

    // Calculate derivative
    const df = calculatePVDerivative(rate, nper, pmt, fv, type);

    // Newton-Raphson: new_rate = old_rate - f(rate) / f'(rate)
    const newRate = rate - f / df;

    // Check for convergence
    if (Math.abs(newRate - rate) < precision) {
      return newRate;
    }

    rate = newRate;

    // Ensure rate stays positive and reasonable
    if (rate < 0 || rate > 1) {
      rate = guess; // Reset if diverging
    }
  }

  // If no convergence, return the best guess
  return rate;
}

/**
 * Calculate present value (PV function)
 *
 * @param rate - Interest rate per period
 * @param nper - Total number of payment periods
 * @param pmt - Payment per period
 * @param fv - Future value (balloon payment) - default 0
 * @param type - Payment timing: 0 = end of period, 1 = beginning of period
 * @returns Present value (loan amount)
 *
 * @example
 * // Calculate max loan amount for $1,500/month payment at 10% annual for 36 months
 * const loanAmount = PV(0.10/12, 36, -1500, 0, 1);
 * // Returns: ~50,159
 */
export function PV(
  rate: number,
  nper: number,
  pmt: number,
  fv: number = 0,
  type: 0 | 1 = 0
): number {
  if (rate === 0) {
    return -pmt * nper - fv;
  }

  const pvif = Math.pow(1 + rate, nper);
  let presentValue = (pmt * (1 - pvif) / rate - fv) / pvif;

  if (type === 1) {
    presentValue = presentValue * (1 + rate);
  }

  return -presentValue;
}

// =====================================================
// Helper Functions for RATE calculation
// =====================================================

/**
 * Calculate PV for RATE function iteration
 * @internal
 */
function calculatePV(
  rate: number,
  nper: number,
  pmt: number,
  fv: number,
  type: number
): number {
  if (rate === 0) {
    return -pmt * nper - fv;
  }

  const pvif = Math.pow(1 + rate, nper);
  let pv = (pmt * (1 - pvif) / rate - fv) / pvif;

  if (type === 1) {
    pv = pv * (1 + rate);
  }

  return pv;
}

/**
 * Calculate derivative of PV with respect to rate (for Newton-Raphson)
 * @internal
 */
function calculatePVDerivative(
  rate: number,
  nper: number,
  pmt: number,
  fv: number,
  type: number
): number {
  const delta = 1e-8; // Small change for numerical derivative
  const pv1 = calculatePV(rate - delta, nper, pmt, fv, type);
  const pv2 = calculatePV(rate + delta, nper, pmt, fv, type);
  return (pv2 - pv1) / (2 * delta);
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Round to 2 decimal places (for currency)
 */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Round to 4 decimal places (for rates)
 */
export function roundRate(rate: number): number {
  return Math.round(rate * 10000) / 10000;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]+/g, ''));
}
