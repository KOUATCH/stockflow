import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { authenticator } from "otplib"

import {
  consumeBackupCode,
  decryptSecret,
  encryptSecret,
  generateBackupCodes,
  generateMfaEnrollment,
  verifyTotpCode,
} from "./mfa"

const TEST_KEY = "a".repeat(64) // 32 bytes of 0xAA hex
const ORIGINAL_KEY = process.env.MFA_ENCRYPTION_KEY

beforeAll(() => {
  process.env.MFA_ENCRYPTION_KEY = TEST_KEY
})
afterAll(() => {
  if (ORIGINAL_KEY !== undefined) process.env.MFA_ENCRYPTION_KEY = ORIGINAL_KEY
  else delete process.env.MFA_ENCRYPTION_KEY
})

describe("encrypt/decryptSecret", () => {
  it("round-trips a secret", () => {
    const secret = "JBSWY3DPEHPK3PXP" // sample base32 secret
    const enc = encryptSecret(secret)
    expect(enc).not.toBe(secret)
    expect(enc.split(":")).toHaveLength(3)
    expect(decryptSecret(enc)).toBe(secret)
  })

  it("yields different ciphertext per call (random IV)", () => {
    const s = "JBSWY3DPEHPK3PXP"
    expect(encryptSecret(s)).not.toBe(encryptSecret(s))
  })

  it("throws on a malformed payload", () => {
    expect(() => decryptSecret("garbage")).toThrow()
    expect(() => decryptSecret("aa:bb:cc")).toThrow()
  })

  it("throws when MFA_ENCRYPTION_KEY is missing", () => {
    const prev = process.env.MFA_ENCRYPTION_KEY
    delete process.env.MFA_ENCRYPTION_KEY
    try {
      expect(() => encryptSecret("x")).toThrow(/MFA_ENCRYPTION_KEY/)
    } finally {
      process.env.MFA_ENCRYPTION_KEY = prev
    }
  })
})

describe("TOTP enrolment + verification", () => {
  it("generateMfaEnrollment returns a secret + otpauth url + QR data url", async () => {
    const e = await generateMfaEnrollment({ userEmail: "alice@example.com" })
    expect(e.secret).toMatch(/^[A-Z2-7]+$/) // base32
    // otplib URL-encodes the account label, so @ becomes %40.
    expect(e.otpauthUrl).toMatch(/^otpauth:\/\/totp\/StockFlow:alice(@|%40)example\.com\?secret=/)
    expect(e.qrDataUrl).toMatch(/^data:image\/png;base64,/)
  })

  it("verifyTotpCode accepts a code generated from the same secret", () => {
    const secret = authenticator.generateSecret()
    const code = authenticator.generate(secret)
    expect(verifyTotpCode(secret, code)).toBe(true)
  })

  it("verifyTotpCode rejects a wrong code", () => {
    const secret = authenticator.generateSecret()
    expect(verifyTotpCode(secret, "000000")).toBe(false)
  })

  it("verifyTotpCode rejects malformed input", () => {
    const secret = authenticator.generateSecret()
    expect(verifyTotpCode(secret, "12345")).toBe(false) // too short
    expect(verifyTotpCode(secret, "abcdef")).toBe(false) // non-digits
    expect(verifyTotpCode(secret, "")).toBe(false)
  })
})

describe("backup codes", () => {
  it("generates 10 plaintext + 10 hashes, hashes differ from plaintext", async () => {
    const { plain, hashes } = await generateBackupCodes()
    expect(plain).toHaveLength(10)
    expect(hashes).toHaveLength(10)
    for (let i = 0; i < 10; i++) {
      expect(plain[i]).toMatch(/^[A-Z0-9]{10}$/)
      expect(hashes[i]).not.toBe(plain[i])
      expect(hashes[i]).toMatch(/^\$2[aby]?\$/) // bcrypt signature
    }
  })

  it("consumeBackupCode returns shorter array on match", async () => {
    const { plain, hashes } = await generateBackupCodes()
    const remaining = await consumeBackupCode(plain[2], hashes)
    expect(remaining).not.toBeNull()
    expect(remaining).toHaveLength(9)
  })

  it("consumeBackupCode returns null on no match (single-use guarantee)", async () => {
    const { hashes } = await generateBackupCodes()
    const remaining = await consumeBackupCode("WRONGCODE0", hashes)
    expect(remaining).toBeNull()
  })

  it("consuming the same code twice succeeds first, fails second", async () => {
    const { plain, hashes } = await generateBackupCodes()
    const afterFirst = await consumeBackupCode(plain[0], hashes)
    expect(afterFirst).not.toBeNull()
    const afterSecond = await consumeBackupCode(plain[0], afterFirst!)
    expect(afterSecond).toBeNull()
  })
})
