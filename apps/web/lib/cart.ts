import type { CartLineDto } from '@mini-etsy/shared';

export const MAX_LINE_QUANTITY = 99;

/** The largest quantity a line can be set to: stock, capped at 99. */
export function maxQuantity(line: Pick<CartLineDto, 'stock'>): number {
  return Math.min(line.stock, MAX_LINE_QUANTITY);
}

export function lineTotal(line: CartLineDto): number {
  return line.available ? line.unitPriceCents * line.quantity : 0;
}

/** Totals over the lines that can still be bought. */
export function cartTotals(lines: readonly CartLineDto[]): {
  itemCount: number;
  subtotalCents: number;
} {
  const available = lines.filter((l) => l.available);
  return {
    itemCount: available.reduce((n, l) => n + l.quantity, 0),
    subtotalCents: available.reduce((sum, l) => sum + lineTotal(l), 0),
  };
}
