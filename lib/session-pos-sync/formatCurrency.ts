// Utility function to format currency values
export function formatCurrency(amount: number, currency = "USD", locale = "en-US"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    // Fallback formatting if Intl is not available
    return `$${amount.toFixed(2)}`
  }
}

// Helper function to parse currency string back to number
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and parse as float
  const cleanString = currencyString.replace(/[^0-9.-]+/g, "")
  return Number.parseFloat(cleanString) || 0
}

// Format currency without symbol (for calculations)
export function formatCurrencyValue(amount: number): string {
  return amount.toFixed(2)
}

// Format percentage
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}
