// Server-only argon2 wrapper to avoid client-side bundling issues
import { cache } from 'react'

// Dynamic import to avoid bundling issues
const getArgon2 = cache(async () => {
  if (typeof window !== 'undefined') {
    throw new Error('argon2 can only be used on the server side')
  }

  try {
    const argon2 = await import('argon2')
    return argon2
  } catch (error) {
    console.error('Failed to import argon2:', error)
    throw new Error('argon2 is not available')
  }
})

// Argon2id configuration optimized for security and performance
const ARGON2_CONFIG = {
  memoryCost: 2 ** 16, // 64 MB - good balance of security and performance
  timeCost: 3,         // 3 iterations - recommended minimum
  parallelism: 1,      // Single thread to avoid timing attacks
}

/**
 * Hash a password using Argon2id (server-side only)
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('Password hashing must be done on the server side')
  }

  try {
    const argon2 = await getArgon2()
    return await argon2.hash(password, {
      type: argon2.argon2id,
      ...ARGON2_CONFIG,
    })
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Verify a password against its hash using Argon2id (server-side only)
 * @param hash - The stored password hash
 * @param password - Plain text password to verify
 * @returns Promise<boolean> - True if password matches, false otherwise
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    throw new Error('Password verification must be done on the server side')
  }

  try {
    // Only support Argon2 hashes
    if (!hash.startsWith('$argon2')) {
      console.error('Legacy password hash detected. Please reset your password.')
      return false
    }

    const argon2 = await getArgon2()
    return await argon2.verify(hash, password)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}


/**
 * Check if a hash needs to be rehashed (server-side only)
 * @param hash - The stored password hash
 * @returns Promise<boolean> - True if hash should be regenerated
 */
export async function needsRehash(hash: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    return false
  }

  try {
    const argon2 = await getArgon2()
    return argon2.needsRehash(hash, ARGON2_CONFIG)
  } catch (error) {
    console.error('Error checking rehash need:', error)
    return false
  }
}