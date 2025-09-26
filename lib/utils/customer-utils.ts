// app/lib/utils/customer-utils.ts
export function formatCustomerCode(code: string | null): string {
  if (!code) return 'N/A';
  return code.toUpperCase();
}

export function formatCreditLimit(amount: number | null): string {
  if (!amount) return 'Unlimited';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getCustomerStatusBadgeVariant(isActive: boolean): 'success' | 'secondary' {
  return isActive ? 'success' : 'secondary';
}