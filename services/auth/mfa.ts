/**
 * TOTP-based multi-factor authentication.
 *
 * Library: `otplib` (small, well-maintained, RFC 6238). Secrets are
 * encrypted at rest with AES-256-GCM using `MFA_ENCRYPTION_KEY`. Backup
 * codes are bcrypt-hashed.
 *
 * Source of truth for "MFA is enabled":
 *   user.mfaEnabledAt !== null
 *
 * Presence of `mfaSecret` alone is NOT enough — a user can have started
 * enrolment (secret generated) without confirming it. Sign-in must require
 * a code only when `mfaEnabledAt` is set.
 */
import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto"

import * as bcrypt from "bcryptjs"
import { authenticator } from "otplib"
import QRCode from "qrcode"

const ALGO = "aes-256-gcm"
const IV_LEN = 12 // AES-GCM standard
const TAG_LEN = 16
const BACKUP_CODE_COUNT = 10
const BACKUP_CODE_LEN = 10 // alphanumeric chars

// Configure otplib: 30s step, ±1 window (60-90s effective validity).
authenticator.options = { step: 30, window: 1, digits: 6 }

function getKey(): Buffer {
  const hex = process.env.MFA_ENCRYPTION_KEY
  if (!hex || !/^[a-f0-9]{64}$/.test(hex)) {
    throw new Error("MFA_ENCRYPTION_KEY is not set or is malformed (need 32-byte hex)")
  }
  return Buffer.from(hex, "hex")
}

/**
 * Encrypts a TOTP secret. Format: `<iv-hex>:<tag-hex>:<ciphertext-hex>`.
 * The IV is unique per call so encrypting the same secret yields different
 * ciphertexts.
 */
export function encryptSecret(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, key, iv)
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`
}

export function decryptSecret(payload: string): string {
  const key = getKey()
  const [ivHex, tagHex, ctHex] = payload.split(":")
  if (!ivHex || !tagHex || !ctHex) throw new Error("Malformed encrypted MFA secret")
  const iv = Buffer.from(ivHex, "hex")
  const tag = Buffer.from(tagHex, "hex")
  if (iv.length !== IV_LEN || tag.length !== TAG_LEN) {
    throw new Error("Malformed encrypted MFA secret (iv/tag length)")
  }
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(Buffer.from(ctHex, "hex")), decipher.final()]).toString(
    "utf8",
  )
}

export type EnrollmentSecret = {
  /** Plaintext TOTP secret — DO NOT persist. Encrypt via `encryptSecret`. */
  secret: string
  /** otpauth:// URL for QR-code authenticator-app onboarding. */
  otpauthUrl: string
  /** PNG-data-URL QR code for the user to scan. */
  qrDataUrl: string
}

/**
 * Generates a fresh TOTP enrolment. The plaintext secret is intentionally
 * returned — the caller encrypts and stores it ONLY after the user proves
 * possession via `confirmMfaEnrollment`.
 */
export async function generateMfaEnrollment(opts: {
  userEmail: string
  issuer?: string
}): Promise<EnrollmentSecret> {
  const secret = authenticator.generateSecret()
  const otpauthUrl = authenticator.keyuri(
    opts.userEmail,
    opts.issuer ?? "StockFlow",
    secret,
  )
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl)
  return { secret, otpauthUrl, qrDataUrl }
}

/**
 * Verifies a 6-digit TOTP code against a (decrypted) secret. Uses otplib's
 * built-in constant-time comparison + window tolerance.
 */
export function verifyTotpCode(secretPlain: string, code: string): boolean {
  if (!/^\d{6}$/.test(code)) return false
  return authenticator.verify({ token: code, secret: secretPlain })
}

/**
 * Generates `BACKUP_CODE_COUNT` plaintext backup codes plus their bcrypt
 * hashes. Plaintext is shown to the user once at enrolment; only the hash
 * array is persisted in `User.mfaBackupCodes`.
 */
export async function generateBackupCodes(): Promise<{ plain: string[]; hashes: string[] }> {
  const plain: string[] = []
  const hashes: string[] = []
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    const code = randomBytes(BACKUP_CODE_LEN)
      .toString("base64url")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, BACKUP_CODE_LEN)
      .toUpperCase()
    plain.push(code)
    hashes.push(await bcrypt.hash(code, 10))
  }
  return { plain, hashes }
}

/**
 * Consume a single-use backup code. Returns the new hash array with the
 * matched code removed, or null if no code matches.
 */
export async function consumeBackupCode(
  code: string,
  existingHashes: string[],
): Promise<string[] | null> {
  for (let i = 0; i < existingHashes.length; i++) {
    if (await bcrypt.compare(code, existingHashes[i])) {
      return existingHashes.filter((_, idx) => idx !== i)
    }
  }
  return null
}
