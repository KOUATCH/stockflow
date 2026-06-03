import { faker } from '@faker-js/faker'
import type { ItemCreationFormData } from '@/components/inventory/ModernCreateItemForm'
import type { CreateItemInput, ItemWithRelations } from '@/lib/item/schemas'

export const createMockCategory = () => ({
  id: faker.string.uuid(),
  titleEn: faker.commerce.department(),
  titleFr: faker.commerce.department(),
  descriptionEn: faker.lorem.sentence(),
  descriptionFr: faker.lorem.sentence(),
  organizationId: faker.string.uuid(),
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const createMockBrand = () => ({
  id: faker.string.uuid(),
  brandName: faker.company.name(),
  descriptionEn: faker.lorem.sentence(),
  descriptionFr: faker.lorem.sentence(),
  organizationId: faker.string.uuid(),
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const createMockUnit = () => ({
  id: faker.string.uuid(),
  nameEn: faker.word.noun(),
  nameFr: faker.word.noun(),
  symbol: faker.string.alpha(2).toUpperCase(),
  organizationId: faker.string.uuid(),
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const createMockTaxRate = () => ({
  id: faker.string.uuid(),
  nameEn: faker.word.words(2),
  nameFr: faker.word.words(2),
  rate: faker.number.float({ min: 0, max: 25, fractionDigits: 2 }),
  organizationId: faker.string.uuid(),
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const createMockOrganization = () => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  slug: faker.internet.domainWord(),
  imageUrl: faker.image.url(),
  phone: faker.phone.number(),
  email: faker.internet.email(),
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const createMockItemFormData = (overrides?: Partial<ItemCreationFormData>): ItemCreationFormData => ({
  organizationId: faker.string.uuid(),
  nameEn: faker.commerce.productName(),
  nameFr: faker.commerce.productName(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  descriptionEn: faker.commerce.productDescription(),
  descriptionFr: faker.commerce.productDescription(),
  imageUrls: faker.image.url(),
  thumbnail: faker.image.url(),
  barcode: faker.string.numeric(12),
  dimensions: `${faker.number.int({min: 1, max: 50})} x ${faker.number.int({min: 1, max: 50})} x ${faker.number.int({min: 1, max: 50})} cm`,
  weight: faker.number.float({ min: 0.1, max: 100, fractionDigits: 2 }),
  costPrice: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
  sellingPrice: faker.number.float({ min: 1, max: 1500, fractionDigits: 2 }),
  tax: faker.number.float({ min: 0, max: 25, fractionDigits: 2 }),
  categoryId: faker.string.uuid(),
  brandId: faker.string.uuid(),
  unitId: faker.string.uuid(),
  taxRateId: faker.string.uuid(),
  minStockLevel: faker.number.int({ min: 0, max: 100 }),
  maxStockLevel: faker.number.int({ min: 100, max: 1000 }),
  unitOfMeasure: faker.word.noun(),
  isActive: true,
  isSerialTracked: faker.datatype.boolean(),
  slug: faker.internet.domainWord(),
  initialInventory: {
    locationId: faker.string.uuid(),
    quantity: faker.number.int({ min: 1, max: 100 }),
    unitCost: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
    notes: faker.lorem.sentence(),
    createdById: faker.string.uuid(),
    batchNumber: faker.string.alphanumeric(8),
    serialNumbers: [faker.string.alphanumeric(10)],
    expiryDate: faker.date.future(),
    referenceNumber: faker.string.alphanumeric(10),
  },
  ...overrides,
})

export const createMockCreateItemInput = (overrides?: Partial<CreateItemInput>): CreateItemInput => ({
  organizationId: faker.string.uuid(),
  nameEn: faker.commerce.productName(),
  nameFr: faker.commerce.productName(),
  sku: faker.string.alphanumeric(8).toUpperCase(),
  descriptionEn: faker.commerce.productDescription(),
  descriptionFr: faker.commerce.productDescription(),
  imageUrls: faker.image.url(),
  thumbnail: faker.image.url(),
  barcode: faker.string.numeric(12),
  dimensions: `${faker.number.int({min: 1, max: 50})} x ${faker.number.int({min: 1, max: 50})} x ${faker.number.int({min: 1, max: 50})} cm`,
  weight: faker.number.float({ min: 0.1, max: 100, fractionDigits: 2 }),
  costPrice: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
  sellingPrice: faker.number.float({ min: 1, max: 1500, fractionDigits: 2 }),
  tax: faker.number.float({ min: 0, max: 25, fractionDigits: 2 }),
  categoryId: faker.string.uuid(),
  brandId: faker.string.uuid(),
  unitId: faker.string.uuid(),
  taxRateId: faker.string.uuid(),
  minStockLevel: faker.number.int({ min: 0, max: 100 }),
  maxStockLevel: faker.number.int({ min: 100, max: 1000 }),
  unitOfMeasure: faker.word.noun(),
  isActive: true,
  isSerialTracked: faker.datatype.boolean(),
  slug: faker.internet.domainWord(),
  ...overrides,
})

export const createMockItemWithRelations = (overrides?: Partial<ItemWithRelations>): ItemWithRelations => {
  const category = createMockCategory()
  const brand = createMockBrand()
  const unit = createMockUnit()
  const taxRate = createMockTaxRate()
  const organization = createMockOrganization()

  return {
    id: faker.string.uuid(),
    organizationId: organization.id,
    nameEn: faker.commerce.productName(),
    nameFr: faker.commerce.productName(),
    descriptionEn: faker.commerce.productDescription(),
    descriptionFr: faker.commerce.productDescription(),
    imageUrls: faker.image.url(),
    thumbnail: faker.image.url(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    barcode: faker.string.numeric(12),
    dimensions: `${faker.number.int({min: 1, max: 50})} x ${faker.number.int({min: 1, max: 50})} x ${faker.number.int({min: 1, max: 50})} cm`,
    weight: faker.number.float({ min: 0.1, max: 100, fractionDigits: 2 }),
    costPrice: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
    sellingPrice: faker.number.float({ min: 1, max: 1500, fractionDigits: 2 }),
    categoryId: category.id,
    brandId: brand.id,
    unitId: unit.id,
    taxRateId: taxRate.id,
    minStockLevel: faker.number.int({ min: 0, max: 100 }),
    maxStockLevel: faker.number.int({ min: 100, max: 1000 }),
    isActive: true,
    slug: faker.internet.domainWord(),
    createdAt: new Date(),
    updatedAt: new Date(),
    organization,
    category,
    brand,
    unit,
    taxRate,
    ...overrides,
  } as ItemWithRelations
}

export const createMockFormSubmissionData = () => {
  const formData = new FormData()
  const mockData = createMockItemFormData()

  Object.entries(mockData).forEach(([key, value]) => {
    if (key === 'initialInventory' && value && typeof value === 'object') {
      // Don't add initialInventory to FormData in this mock
      return
    }
    if (value !== null && value !== undefined) {
      formData.append(key, String(value))
    }
  })

  return formData
}

// Mock props for the ModernCreateItemForm component
export const createMockModernCreateItemFormProps = () => {
  const categories = Array.from({ length: 5 }, createMockCategory)
  const brands = Array.from({ length: 5 }, createMockBrand)
  const units = Array.from({ length: 5 }, createMockUnit)
  const taxRates = Array.from({ length: 3 }, createMockTaxRate)

  return {
    organizationId: faker.string.uuid(),
    categories,
    brands,
    units,
    taxRate: taxRates,
    onSubmit: jest.fn(),
    action: jest.fn(),
    isLoading: false,
  }
}

// Mock validation errors
export const createMockValidationErrors = () => ({
  nameEn: { message: 'English name is required' },
  sku: { message: 'SKU is required' },
  costPrice: { message: 'Cost price must be positive' },
  sellingPrice: { message: 'Selling price must be positive' },
})

export const createSuccessfulActionResponse = <T = undefined>(data?: T, message = 'Success') => ({
  success: true as const,
  data,
  message,
})

export const createFailedActionResponse = (error: string) => ({
  success: false as const,
  error,
})
