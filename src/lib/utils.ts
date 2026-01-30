import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = "AUD"): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ABN with spaces
 */
export function formatABN(abn: string): string {
  const cleaned = abn.replace(/\s/g, "");
  if (cleaned.length !== 11) return abn;
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
}

/**
 * Validate ABN (basic check)
 */
export function isValidABN(abn: string): boolean {
  const cleaned = abn.replace(/\s/g, "");
  if (cleaned.length !== 11) return false;
  if (!/^\d+$/.test(cleaned)) return false;
  
  // ABN checksum validation
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const digits = cleaned.split("").map(Number);
  digits[0] -= 1; // Subtract 1 from first digit
  
  const sum = digits.reduce((acc, digit, i) => acc + digit * weights[i], 0);
  return sum % 89 === 0;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
