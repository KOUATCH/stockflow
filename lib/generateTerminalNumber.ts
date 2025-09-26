import { randomBytes } from 'crypto'

interface DatabaseAdapter {
  findUnique(query: { where: { terminalNumber: string } }): Promise<any>
}

interface GeneratorOptions {
  prefix?: string
  part1Length?: number
  part2Length?: number
  maxAttempts?: number
  separator?: string
}

class TerminalNumberGenerationError extends Error {
  constructor(message: string, public readonly attempts: number) {
    super(message)
    this.name = 'TerminalNumberGenerationError'
  }
}

/**
 * Generates a cryptographically secure random numeric string of specified length
 */
function generateSecureNumericString(length: number): string {
  const bytes = randomBytes(Math.ceil(length / 2))
  return Array.from(bytes)
    .map(byte => byte.toString().padStart(3, '0'))
    .join('')
    .slice(0, length)
}

/**
 * Generates a unique terminal number with format: PREFIX-XXXXXX-XXXX
 * Uses cryptographically secure random generation and includes collision handling
 * 
 * @param db - Database adapter with findUnique method
 * @param options - Configuration options for generation
 * @returns Promise<string> - Unique terminal number
 * @throws TerminalNumberGenerationError - When max attempts exceeded
 */
async function generateUniqueTerminalNumber(
  db: DatabaseAdapter,
  options: GeneratorOptions = {}
): Promise<string> {
  const {
    prefix = 'POS',
    part1Length = 6,
    part2Length = 4,
    // maxAttempts = 100,
    maxAttempts = 10,
    separator = '-'
  } = options

  // Validate inputs
  if (!db?.findUnique) {
    throw new Error('Database adapter must have a findUnique method')
  }

  if (part1Length < 1 || part2Length < 1) {
    throw new Error('Part lengths must be positive integers')
  }

  if (maxAttempts < 1) {
    throw new Error('Max attempts must be a positive integer')
  }

  let attempts = 0
  const startTime = Date.now()

  while (attempts < maxAttempts) {
    attempts++
    
    try {
      // Generate cryptographically secure random parts
      const part1 = generateSecureNumericString(part1Length)
      const part2 = generateSecureNumericString(part2Length)
      const terminalNumber = `${prefix}${separator}${part1}${separator}${part2}`

      // Check uniqueness in database
      const existing = await db.findUnique({
        where: { terminalNumber },
      })

      if (!existing) {
        const generationTime = Date.now() - startTime
        console.log(`Terminal number generated in ${generationTime}ms after ${attempts} attempt(s): ${terminalNumber}`)
        return terminalNumber
      }

      // Log collision for monitoring (consider using proper logging in production)
      console.warn(`Terminal number collision detected: ${terminalNumber} (attempt ${attempts})`)
      
    } catch (error) {
      console.error(`Error during terminal number generation attempt ${attempts}:`, error)
      
      // If it's a database error, we might want to retry
      // If it's a crypto error, we should probably fail fast
      if (error instanceof Error && error.message.includes('crypto')) {
        throw error
      }
      
      // Continue with retry for database errors
    }
  }

  // Max attempts exceeded
  throw new TerminalNumberGenerationError(
    `Failed to generate unique terminal number after ${maxAttempts} attempts`,
    attempts
  )
}

// Alternative implementation using UUID for even better uniqueness guarantees
import { randomUUID } from 'crypto'

/**
 * Generates a terminal number using UUID for guaranteed uniqueness
 * Format: POS-XXXXXXXX-XXXX (first 8 and last 4 hex chars of UUID)
 */
async function generateUniqueTerminalNumberUUID(
  db: DatabaseAdapter,
  options: Pick<GeneratorOptions, 'prefix' | 'separator' | 'maxAttempts'> = {}
): Promise<string> {
  const {
    prefix = 'POS',
    separator = '-',
    maxAttempts = 10 // Much lower since UUID collisions are extremely rare
  } = options

  let attempts = 0

  while (attempts < maxAttempts) {
    attempts++
    
    const uuid = randomUUID().replace(/-/g, '') // Remove hyphens
    const part1 = uuid.slice(0, 8).toUpperCase()
    const part2 = uuid.slice(-4).toUpperCase()
    const terminalNumber = `${prefix}${separator}${part1}${separator}${part2}`

    const existing = await db.findUnique({
      where: { terminalNumber },
    })

    if (!existing) {
      return terminalNumber
    }
  }

  throw new TerminalNumberGenerationError(
    `Failed to generate unique UUID-based terminal number after ${maxAttempts} attempts`,
    attempts
  )
}

// Usage examples:
export {
  generateUniqueTerminalNumber,
  generateUniqueTerminalNumberUUID,
  TerminalNumberGenerationError,
  type DatabaseAdapter,
  type GeneratorOptions
}

// Example usage:
/*
// Basic usage
const terminalNumber = await generateUniqueTerminalNumber(db)

// Custom configuration
const customTerminalNumber = await generateUniqueTerminalNumber(db, {
  prefix: 'TERMINAL',
  part1Length: 8,
  part2Length: 6,
  separator: '_',
  maxAttempts: 50
})

// UUID-based (recommended for high-volume systems)
const uuidTerminalNumber = await generateUniqueTerminalNumberUUID(db, {
  prefix: 'POS',
  maxAttempts: 5
})
*/