// Centralized pricing configuration.
// These values are the single source of truth for fee calculations across
// the basket, checkout, and server-side finalize logic. Keep them in sync
// with the server-side calculation in src/app/api/bookings/finalize/route.ts.

export const TAX_RATE = 0.1; // 10% taxes & fees
export const SERVICE_FEE_RATE = 0.02; // 2% service fee
export const DEFAULT_CURRENCY = 'NGN';

export interface PriceBreakdown {
  subtotal: number;
  taxesAndFees: number;
  serviceFee: number;
  grandTotal: number;
}

/**
 * Compute the price breakdown for a given subtotal.
 * Uses Math.floor to match the server-side calculation exactly.
 */
export function computePriceBreakdown(subtotal: number, addOns = 0): PriceBreakdown {
  const base = subtotal + addOns;
  const taxesAndFees = Math.floor(base * TAX_RATE);
  const serviceFee = Math.floor(base * SERVICE_FEE_RATE);
  const grandTotal = base + taxesAndFees + serviceFee;
  return { subtotal, taxesAndFees, serviceFee, grandTotal };
}