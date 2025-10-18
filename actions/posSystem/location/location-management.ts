"use server"

import { db } from "@/prisma/db"
import type {
  LocationConfig,
  TaxConfiguration,
  PaymentMethodConfig,
  ReceiptTemplate,
  LoyaltyProgramConfig,
  InventoryConfig,
  PricingConfig,
  PaymentMethod
} from "../types/pos-system-types"

export class LocationManagement {

  /**
   * Get location-specific POS configuration
   */
  static async getLocationConfig(locationId: string): Promise<{
    success: boolean
    data?: LocationConfig
    error?: string
  }> {
    try {
      const location = await db.location.findUnique({
        where: { id: locationId },
        include: {
          organization: true
        }
      })

      if (!location) {
        return {
          success: false,
          error: 'Location not found'
        }
      }

      // Get or create location configuration
      let config = await db.locationConfig.findUnique({
        where: { locationId }
      })

      if (!config) {
        config = await this.createDefaultLocationConfig(locationId, location.organizationId)
      }

      const locationConfig: LocationConfig = {
        id: config.id,
        locationId,
        timezone: config.timezone || 'America/New_York',
        currency: config.currency || 'USD',
        taxConfiguration: this.parseTaxConfiguration(config.taxConfiguration),
        paymentMethods: this.parsePaymentMethodsConfig(config.paymentMethodsConfig),
        receiptTemplate: this.parseReceiptTemplate(config.receiptTemplate),
        loyaltyProgram: this.parseLoyaltyProgram(config.loyaltyProgramConfig),
        inventory: this.parseInventoryConfig(config.inventoryConfig),
        pricing: this.parsePricingConfig(config.pricingConfig)
      }

      return {
        success: true,
        data: locationConfig
      }

    } catch (error) {
      console.error('Error fetching location config:', error)
      return {
        success: false,
        error: 'Failed to fetch location configuration'
      }
    }
  }

  /**
   * Update location configuration
   */
  static async updateLocationConfig(
    locationId: string,
    updates: Partial<LocationConfig>
  ): Promise<{
    success: boolean
    data?: LocationConfig
    error?: string
  }> {
    try {
      const configData: any = {}

      if (updates.timezone) configData.timezone = updates.timezone
      if (updates.currency) configData.currency = updates.currency
      if (updates.taxConfiguration) configData.taxConfiguration = updates.taxConfiguration
      if (updates.paymentMethods) configData.paymentMethodsConfig = updates.paymentMethods
      if (updates.receiptTemplate) configData.receiptTemplate = updates.receiptTemplate
      if (updates.loyaltyProgram) configData.loyaltyProgramConfig = updates.loyaltyProgram
      if (updates.inventory) configData.inventoryConfig = updates.inventory
      if (updates.pricing) configData.pricingConfig = updates.pricing

      const updatedConfig = await db.locationConfig.upsert({
        where: { locationId },
        update: configData,
        create: {
          locationId,
          ...configData
        }
      })

      // Return updated configuration
      const result = await this.getLocationConfig(locationId)
      return result

    } catch (error) {
      console.error('Error updating location config:', error)
      return {
        success: false,
        error: 'Failed to update location configuration'
      }
    }
  }

  /**
   * Create default location configuration
   */
  private static async createDefaultLocationConfig(locationId: string, organizationId: string) {
    const defaultTaxConfig: TaxConfiguration = {
      salesTax: 8.5,
      cityTax: 1.0,
      stateTax: 6.5,
      federalTax: 0,
      taxInclusive: false,
      exemptCategories: []
    }

    const defaultPaymentMethods: PaymentMethodConfig[] = [
      {
        method: 'CASH',
        enabled: true,
        minimumAmount: 0,
        maximumAmount: 10000,
        fees: { fixedFee: 0, percentageFee: 0 }
      },
      {
        method: 'CARD',
        enabled: true,
        minimumAmount: 0,
        maximumAmount: 50000,
        fees: { fixedFee: 0.30, percentageFee: 2.9 }
      },
      {
        method: 'CHECK',
        enabled: false,
        minimumAmount: 10,
        maximumAmount: 5000,
        fees: { fixedFee: 1.00, percentageFee: 0 }
      },
      {
        method: 'GIFT_CARD',
        enabled: true,
        minimumAmount: 0,
        maximumAmount: 1000,
        fees: { fixedFee: 0, percentageFee: 0 }
      },
      {
        method: 'STORE_CREDIT',
        enabled: true,
        minimumAmount: 0,
        maximumAmount: 5000,
        fees: { fixedFee: 0, percentageFee: 0 }
      },
      {
        method: 'DIGITAL_WALLET',
        enabled: true,
        minimumAmount: 0,
        maximumAmount: 10000,
        fees: { fixedFee: 0, percentageFee: 2.9 }
      }
    ]

    const defaultReceiptTemplate: ReceiptTemplate = {
      header: 'Thank you for shopping with us!',
      footer: 'Please come again!',
      showBarcode: true,
      showQRCode: true,
      customFields: [
        {
          name: 'return_policy',
          label: 'Return Policy',
          value: 'Returns accepted within 30 days with receipt',
          type: 'TEXT',
          position: 'FOOTER'
        }
      ]
    }

    const defaultLoyaltyProgram: LoyaltyProgramConfig = {
      enabled: true,
      pointsPerDollar: 1,
      dollarPerPoint: 0.01,
      tierLevels: [
        {
          name: 'Bronze',
          minimumSpend: 0,
          discountPercentage: 0,
          bonusPointsMultiplier: 1
        },
        {
          name: 'Silver',
          minimumSpend: 500,
          discountPercentage: 5,
          bonusPointsMultiplier: 1.5
        },
        {
          name: 'Gold',
          minimumSpend: 1500,
          discountPercentage: 10,
          bonusPointsMultiplier: 2
        },
        {
          name: 'Platinum',
          minimumSpend: 5000,
          discountPercentage: 15,
          bonusPointsMultiplier: 3
        }
      ]
    }

    const defaultInventoryConfig: InventoryConfig = {
      trackInventory: true,
      allowNegative: false,
      lowStockThreshold: 10,
      autoReorder: false,
      reorderPoint: 20,
      reorderQuantity: 50
    }

    const defaultPricingConfig: PricingConfig = {
      defaultPriceLevel: 'STANDARD',
      allowPriceOverride: true,
      requireManagerApproval: false,
      maxDiscountPercentage: 15
    }

    return await db.locationConfig.create({
      data: {
        locationId,
        timezone: 'America/New_York',
        currency: 'USD',
        taxConfiguration: defaultTaxConfig,
        paymentMethodsConfig: defaultPaymentMethods,
        receiptTemplate: defaultReceiptTemplate,
        loyaltyProgramConfig: defaultLoyaltyProgram,
        inventoryConfig: defaultInventoryConfig,
        pricingConfig: defaultPricingConfig
      }
    })
  }

  /**
   * Get location-specific tax rates
   */
  static async getLocationTaxRates(locationId: string): Promise<{
    success: boolean
    data?: TaxConfiguration
    error?: string
  }> {
    try {
      const config = await this.getLocationConfig(locationId)

      if (!config.success || !config.data) {
        return {
          success: false,
          error: 'Failed to get location configuration'
        }
      }

      return {
        success: true,
        data: config.data.taxConfiguration
      }

    } catch (error) {
      console.error('Error fetching tax rates:', error)
      return {
        success: false,
        error: 'Failed to fetch tax rates'
      }
    }
  }

  /**
   * Update location tax configuration
   */
  static async updateLocationTaxRates(
    locationId: string,
    taxConfig: TaxConfiguration
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      await this.updateLocationConfig(locationId, {
        taxConfiguration: taxConfig
      })

      return { success: true }

    } catch (error) {
      console.error('Error updating tax rates:', error)
      return {
        success: false,
        error: 'Failed to update tax rates'
      }
    }
  }

  /**
   * Get enabled payment methods for location
   */
  static async getLocationPaymentMethods(locationId: string): Promise<{
    success: boolean
    data?: PaymentMethodConfig[]
    error?: string
  }> {
    try {
      const config = await this.getLocationConfig(locationId)

      if (!config.success || !config.data) {
        return {
          success: false,
          error: 'Failed to get location configuration'
        }
      }

      const enabledMethods = config.data.paymentMethods.filter(method => method.enabled)

      return {
        success: true,
        data: enabledMethods
      }

    } catch (error) {
      console.error('Error fetching payment methods:', error)
      return {
        success: false,
        error: 'Failed to fetch payment methods'
      }
    }
  }

  /**
   * Get location pricing configuration
   */
  static async getLocationPricing(locationId: string): Promise<{
    success: boolean
    data?: PricingConfig
    error?: string
  }> {
    try {
      const config = await this.getLocationConfig(locationId)

      if (!config.success || !config.data) {
        return {
          success: false,
          error: 'Failed to get location configuration'
        }
      }

      return {
        success: true,
        data: config.data.pricing
      }

    } catch (error) {
      console.error('Error fetching pricing config:', error)
      return {
        success: false,
        error: 'Failed to fetch pricing configuration'
      }
    }
  }

  /**
   * Sync location configurations across organization
   */
  static async syncLocationConfigurations(
    organizationId: string,
    sourceLocationId: string,
    targetLocationIds: string[],
    configTypes: Array<'tax' | 'payment' | 'receipt' | 'loyalty' | 'inventory' | 'pricing'>
  ): Promise<{
    success: boolean
    syncedConfigs?: number
    error?: string
  }> {
    try {
      const sourceConfig = await this.getLocationConfig(sourceLocationId)

      if (!sourceConfig.success || !sourceConfig.data) {
        return {
          success: false,
          error: 'Failed to get source location configuration'
        }
      }

      let syncedConfigs = 0

      for (const targetLocationId of targetLocationIds) {
        const updates: Partial<LocationConfig> = {}

        if (configTypes.includes('tax')) {
          updates.taxConfiguration = sourceConfig.data.taxConfiguration
        }
        if (configTypes.includes('payment')) {
          updates.paymentMethods = sourceConfig.data.paymentMethods
        }
        if (configTypes.includes('receipt')) {
          updates.receiptTemplate = sourceConfig.data.receiptTemplate
        }
        if (configTypes.includes('loyalty')) {
          updates.loyaltyProgram = sourceConfig.data.loyaltyProgram
        }
        if (configTypes.includes('inventory')) {
          updates.inventory = sourceConfig.data.inventory
        }
        if (configTypes.includes('pricing')) {
          updates.pricing = sourceConfig.data.pricing
        }

        const result = await this.updateLocationConfig(targetLocationId, updates)
        if (result.success) {
          syncedConfigs++
        }
      }

      return {
        success: true,
        syncedConfigs
      }

    } catch (error) {
      console.error('Error syncing location configurations:', error)
      return {
        success: false,
        error: 'Failed to sync location configurations'
      }
    }
  }

  // Helper methods for parsing configuration data
  private static parseTaxConfiguration(data: any): TaxConfiguration {
    if (!data) {
      return {
        salesTax: 8.5,
        cityTax: 1.0,
        stateTax: 6.5,
        federalTax: 0,
        taxInclusive: false,
        exemptCategories: []
      }
    }
    return data as TaxConfiguration
  }

  private static parsePaymentMethodsConfig(data: any): PaymentMethodConfig[] {
    if (!data || !Array.isArray(data)) {
      return []
    }
    return data as PaymentMethodConfig[]
  }

  private static parseReceiptTemplate(data: any): ReceiptTemplate {
    if (!data) {
      return {
        header: 'Thank you for shopping with us!',
        footer: 'Please come again!',
        showBarcode: true,
        showQRCode: true,
        customFields: []
      }
    }
    return data as ReceiptTemplate
  }

  private static parseLoyaltyProgram(data: any): LoyaltyProgramConfig | undefined {
    if (!data) return undefined
    return data as LoyaltyProgramConfig
  }

  private static parseInventoryConfig(data: any): InventoryConfig {
    if (!data) {
      return {
        trackInventory: true,
        allowNegative: false,
        lowStockThreshold: 10,
        autoReorder: false,
        reorderPoint: 20,
        reorderQuantity: 50
      }
    }
    return data as InventoryConfig
  }

  private static parsePricingConfig(data: any): PricingConfig {
    if (!data) {
      return {
        defaultPriceLevel: 'STANDARD',
        allowPriceOverride: true,
        requireManagerApproval: false,
        maxDiscountPercentage: 15
      }
    }
    return data as PricingConfig
  }
}