// Unmock the generateSKU function for this test file
jest.unmock('@/lib/generateSKU')

import { generateSimpleSKU } from '@/lib/generateSKU'

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toStartWith(expected: string): R
    }
  }
}

expect.extend({
  toStartWith(received: string, expected: string) {
    const pass = received.startsWith(expected)
    return {
      message: () =>
        pass
          ? `expected ${received} not to start with ${expected}`
          : `expected ${received} to start with ${expected}`,
      pass,
    }
  },
})

describe('generateSimpleSKU', () => {
  describe('Basic Functionality', () => {
    it('generates SKU with correct length', () => {
      const sku = generateSimpleSKU(8, '')

      expect(sku).toHaveLength(8)
      expect(sku).toMatch(/^[A-Z0-9]{8}$/)
    })

    it('includes prefix and generates additional characters', () => {
      const prefix = 'TEST'
      const additionalLength = 6
      const sku = generateSimpleSKU(additionalLength, prefix)

      expect(sku).toStartWith(prefix)
      expect(sku).toHaveLength(prefix.length + additionalLength)
      expect(sku).toMatch(/^TEST[A-Z0-9]{6}$/)
    })

    it('generates different SKUs on consecutive calls', () => {
      const sku1 = generateSimpleSKU(8, 'TEST')
      const sku2 = generateSimpleSKU(8, 'TEST')

      expect(sku1).not.toBe(sku2)
    })

    it('handles minimum length correctly', () => {
      const sku = generateSimpleSKU(1, 'T')

      expect(sku).toHaveLength(1)
      expect(sku).toBe('T')
    })

    it('handles empty prefix', () => {
      const sku = generateSimpleSKU(8, '')

      expect(sku).toHaveLength(8)
      expect(sku).toMatch(/^[A-Z0-9]{8}$/)
    })
  })

  describe('Edge Cases', () => {
    it('handles prefix longer than desired length', () => {
      const longPrefix = 'VERYLONGPREFIX'
      const sku = generateSimpleSKU(8, longPrefix)

      // Function generates prefix + additional characters
      expect(sku).toHaveLength(8 + longPrefix.length)
      expect(sku).toStartWith('VERYLONGPREFIX')
    })

    it('generates maximum length SKUs', () => {
      const sku = generateSimpleSKU(50, 'TEST')

      expect(sku).toHaveLength(50 + 4) // length + prefix length
      expect(sku).toStartWith('TEST')
    })

    it('handles numeric prefixes', () => {
      const sku = generateSimpleSKU(8, '123')

      expect(sku).toStartWith('123')
      expect(sku).toHaveLength(8 + 3) // length + prefix length
    })

    it('handles mixed case prefixes as-is (no case conversion)', () => {
      const sku = generateSimpleSKU(8, 'test')

      expect(sku).toStartWith('test')
      expect(sku).toHaveLength(8 + 4) // length + prefix length
    })
  })

  describe('Randomness and Distribution', () => {
    it('generates sufficiently random SKUs', () => {
      const skus = new Set()
      const iterations = 100

      for (let i = 0; i < iterations; i++) {
        skus.add(generateSimpleSKU(12, 'TEST'))
      }

      // Should generate mostly unique SKUs
      expect(skus.size).toBeGreaterThan(iterations * 0.95)
    })

    it('uses both letters and numbers', () => {
      const skus = []
      for (let i = 0; i < 20; i++) {
        skus.push(generateSimpleSKU(20, ''))
      }

      const allSkus = skus.join('')
      expect(allSkus).toMatch(/[A-Z]/)
      expect(allSkus).toMatch(/[0-9]/)
    })

    it('maintains consistent format across multiple generations', () => {
      const skus = []
      for (let i = 0; i < 10; i++) {
        skus.push(generateSimpleSKU(10, 'PRD'))
      }

      skus.forEach(sku => {
        expect(sku).toHaveLength(10)
        expect(sku).toStartWith('PRD')
        expect(sku).toMatch(/^PRD[A-Z0-9]{7}$/)
      })
    })
  })

  describe('Performance', () => {
    it('generates SKUs quickly for reasonable lengths', () => {
      const start = performance.now()

      for (let i = 0; i < 1000; i++) {
        generateSimpleSKU(15, 'PERF')
      }

      const end = performance.now()
      const duration = end - start

      // Should complete 1000 generations in less than 100ms
      expect(duration).toBeLessThan(100)
    })

    it('handles very long SKUs without performance issues', () => {
      const start = performance.now()
      const sku = generateSimpleSKU(1000, 'LONG')
      const end = performance.now()

      expect(sku).toHaveLength(1000)
      expect(end - start).toBeLessThan(50)
    })
  })

  describe('Character Set Validation', () => {
    it('only uses valid characters (A-Z, 0-9)', () => {
      const skus = []
      for (let i = 0; i < 50; i++) {
        skus.push(generateSimpleSKU(20, ''))
      }

      const allChars = skus.join('')
      expect(allChars).toMatch(/^[A-Z0-9]*$/)
    })

    it('excludes potentially confusing characters', () => {
      const skus = []
      for (let i = 0; i < 50; i++) {
        skus.push(generateSimpleSKU(20, ''))
      }

      const allChars = skus.join('')
      // Should not contain potentially confusing characters
      expect(allChars).not.toMatch(/[O0IL1]/) // Depending on implementation
    })
  })

  describe('Integration with Form Workflows', () => {
    it('generates SKUs suitable for database storage', () => {
      const sku = generateSimpleSKU(128, 'DBTEST') // Max database field length

      expect(sku).toHaveLength(128)
      expect(sku).not.toContain(' ')
      expect(sku).not.toContain('-')
      expect(sku).not.toContain('_')
    })

    it('generates SKUs compatible with barcode systems', () => {
      const sku = generateSimpleSKU(13, 'BAR') // Barcode-compatible length

      expect(sku).toHaveLength(13)
      expect(sku).toMatch(/^[A-Z0-9]{13}$/)
    })

    it('maintains consistency for inventory tracking', () => {
      const batchSize = 100
      const skus = []

      for (let i = 0; i < batchSize; i++) {
        skus.push(generateSimpleSKU(12, 'INV'))
      }

      // All should have same format
      skus.forEach(sku => {
        expect(sku).toMatch(/^INV[A-Z0-9]{9}$/)
      })

      // All should be unique
      const uniqueSkus = new Set(skus)
      expect(uniqueSkus.size).toBe(batchSize)
    })
  })

  describe('Error Handling and Validation', () => {
    it('handles zero length gracefully', () => {
      const sku = generateSimpleSKU(0, '')

      expect(sku).toBe('')
    })

    it('handles negative length by treating as zero', () => {
      const sku = generateSimpleSKU(-5, 'NEG')

      expect(sku).toBe('')
    })

    it('handles special characters in prefix', () => {
      const sku = generateSimpleSKU(10, 'SP@C!AL')

      // Should include special characters as-is
      expect(sku).toStartWith('SP@C!AL')
      expect(sku).toHaveLength(10 + 7) // length + prefix length
    })

    it('handles Unicode characters in prefix', () => {
      const sku = generateSimpleSKU(10, 'ÜNÏ')

      expect(sku).toStartWith('ÜNÏ')
      expect(sku).toHaveLength(10 + 3) // length + prefix length
    })
  })

  describe('Collision Probability', () => {
    it('has reasonable collision probability for small sample', () => {
      const skuSet = new Set()
      const testSize = 100 // Reduced test size for reasonable collision rate

      for (let i = 0; i < testSize; i++) {
        skuSet.add(generateSimpleSKU(12, 'COL'))
      }

      const collisionRate = (testSize - skuSet.size) / testSize
      expect(collisionRate).toBeLessThan(0.50) // Less than 50% collision rate for small sample
    })

    it('generates SKUs with different prefixes', () => {
      const prefixes = ['A', 'B', 'C', 'D', 'E']
      const allSkus = new Set()

      prefixes.forEach(prefix => {
        for (let i = 0; i < 10; i++) {
          allSkus.add(generateSimpleSKU(8, prefix))
        }
      })

      // Should have high uniqueness even if not perfect
      expect(allSkus.size).toBeGreaterThan(40) // At least 80% unique
    })
  })
})