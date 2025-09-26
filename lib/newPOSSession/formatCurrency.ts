/**
 * Formats a number as currency (USD)
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "USD", locale = "en-US"): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "$0.00"
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats a number as currency without the currency symbol
 * @param amount - The amount to format
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted number string
 */
export function formatAmount(amount: number, locale = "en-US"): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0.00"
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Parses a currency string back to a number
 * @param currencyString - The currency string to parse
 * @returns Parsed number or 0 if invalid
 */
export function parseCurrency(currencyString: string): number {
  if (typeof currencyString !== "string") {
    return 0
  }

  // Remove currency symbols, spaces, and commas
  const cleanString = currencyString.replace(/[$,\s]/g, "")
  const parsed = Number.parseFloat(cleanString)

  return isNaN(parsed) ? 0 : parsed
}
