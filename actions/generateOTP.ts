/**
 * Generates a 6-digit OTP code
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
