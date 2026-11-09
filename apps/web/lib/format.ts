const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/** 1250 -> "$12.50" */
export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
