"use server"

import { db } from "@/prisma/db"
import { startOfDay, subDays, addHours, addMinutes } from "date-fns"

export interface SampleDataConfig {
  organizationId: string
  locationId?: string
  numberOfDays?: number
  salesPerDay?: number
  itemsPerSale?: number
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function generateSampleSalesData(config: SampleDataConfig) {
  try {
    const {
      organizationId,
      locationId,
      numberOfDays = 7,
      salesPerDay = 10,
      itemsPerSale = 3
    } = config

    console.log("🧪 Generating sample sales data:", config)

    // Get organization
    const organization = await db.organization.findUnique({
      where: { id: organizationId }
    })

    if (!organization) {
      throw new Error("Organization not found")
    }

    // Get location (or create default)
    let location
    if (locationId) {
      location = await db.location.findFirst({
        where: { id: locationId, organizationId }
      })
    } else {
      location = await db.location.findFirst({
        where: { organizationId }
      })
    }

    if (!location) {
      // Create a default location
      location = await db.location.create({
        data: {
          name: "Main Store",
          code: "MAIN",
          organizationId,
          address: "Sample Address",
          isActive: true
        }
      })
      console.log("✅ Created default location:", location.name)
    }

    // Get or create items
    let items = await db.item.findMany({
      where: { organizationId, isActive: true },
      take: 20
    })

    if (items.length === 0) {
      // Create sample items
      const sampleItems = [
        { nameEn: "Premium Coffee Beans", sku: "COFFEE-001", costPrice: 12.50, sellingPrice: 18.99 },
        { nameEn: "Artisan Croissant", sku: "PASTRY-002", costPrice: 1.20, sellingPrice: 3.50 },
        { nameEn: "Fresh Bagel", sku: "BREAD-003", costPrice: 0.80, sellingPrice: 2.25 },
        { nameEn: "Organic Tea", sku: "TEA-004", costPrice: 8.00, sellingPrice: 12.99 },
        { nameEn: "Chocolate Muffin", sku: "PASTRY-005", costPrice: 1.50, sellingPrice: 4.25 },
        { nameEn: "Sandwich Combo", sku: "COMBO-006", costPrice: 4.50, sellingPrice: 9.99 },
        { nameEn: "Fresh Salad", sku: "SALAD-007", costPrice: 3.20, sellingPrice: 7.50 },
        { nameEn: "Fruit Smoothie", sku: "DRINK-008", costPrice: 2.50, sellingPrice: 5.99 },
        { nameEn: "Energy Bar", sku: "SNACK-009", costPrice: 1.10, sellingPrice: 2.99 },
        { nameEn: "Greek Yogurt", sku: "DAIRY-010", costPrice: 1.80, sellingPrice: 4.50 }
      ]

      // Get or create category
      let category = await db.category.findFirst({
        where: { organizationId }
      })

      if (!category) {
        category = await db.category.create({
          data: {
            titleEn: "Food & Beverages",
            slug: "food-beverages",
            organizationId
          }
        })
      }

      for (const itemData of sampleItems) {
        const item = await db.item.create({
          data: {
            ...itemData,
            slug: slugify(`${itemData.nameEn}-${itemData.sku}`),
            imageUrls: [],
            organizationId,
            categoryId: category.id,
            isActive: true
          }
        })

        // Create inventory level
        await db.inventoryLevel.create({
          data: {
            itemId: item.id,
            locationId: location.id,
            quantityOnHand: Math.floor(Math.random() * 100) + 50,
            averageCost: itemData.costPrice
          }
        })
      }

      items = await db.item.findMany({
        where: { organizationId, isActive: true }
      })

      console.log(`✅ Created ${items.length} sample items`)
    }

    // Get or create a customer
    let customer = await db.customer.findFirst({
      where: { organizationId }
    })

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: "Sample Customer",
          email: "sample@example.com",
          phone: "+1234567890",
          organizationId
        }
      })
    }

    // Generate sales data for the specified number of days
    let totalSalesCreated = 0

    for (let dayOffset = 0; dayOffset < numberOfDays; dayOffset++) {
      const saleDate = subDays(startOfDay(new Date()), dayOffset)

      for (let saleIndex = 0; saleIndex < salesPerDay; saleIndex++) {
        // Random time during business hours (8 AM - 8 PM)
        const saleTime = addMinutes(
          addHours(saleDate, 8 + Math.floor(Math.random() * 12)),
          Math.floor(Math.random() * 60)
        )

        // Create sales order
        const salesOrder = await db.salesOrder.create({
          data: {
            orderNumber: `SO-${Date.now()}-${saleIndex}`,
            organizationId,
            locationId: location.id,
            customerId: customer.id,
            status: "COMPLETED",
            subtotal: 0,
            taxAmount: 0,
            total: 0,
            createdAt: saleTime,
            updatedAt: saleTime
          }
        })

        let orderTotal = 0

        // Add random items to the sale
        const numberOfItems = Math.floor(Math.random() * itemsPerSale) + 1
        const selectedItems = items
          .sort(() => 0.5 - Math.random())
          .slice(0, numberOfItems)

        for (const item of selectedItems) {
          const quantity = Math.floor(Math.random() * 3) + 1
          const unitPrice = Math.max(0, Number(item.sellingPrice) + (Math.random() * 2 - 1)) // Small price variation
          const lineTotal = quantity * unitPrice

          await db.salesOrderLine.create({
            data: {
              salesOrderId: salesOrder.id,
              itemId: item.id,
              quantity,
              unitPrice,
              lineTotal
            }
          })

          orderTotal += lineTotal
        }

        // Update order totals
        const taxAmount = orderTotal * 0.08 // 8% tax
        const finalTotal = orderTotal + taxAmount

        await db.salesOrder.update({
          where: { id: salesOrder.id },
          data: {
            subtotal: orderTotal,
            taxAmount,
            total: finalTotal
          }
        })

        // Create payment
        await db.payment.create({
          data: {
            paymentNumber: `PAY-${Date.now()}-${saleIndex}`,
            organizationId,
            salesOrderId: salesOrder.id,
            method: ["CASH", "CARD", "MOBILE_MONEY"][Math.floor(Math.random() * 3)] as "CASH" | "CARD" | "MOBILE_MONEY",
            amount: finalTotal,
            status: "PAID"
          }
        })

        totalSalesCreated++
      }
    }

    console.log(`✅ Generated ${totalSalesCreated} sample sales orders`)

    return {
      success: true,
      message: `Generated ${totalSalesCreated} sample sales orders over ${numberOfDays} days`,
      data: {
        organization: organization.name,
        location: location.name,
        itemsCount: items.length,
        salesCount: totalSalesCreated,
        dateRange: `${subDays(new Date(), numberOfDays - 1).toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`
      }
    }

  } catch (error) {
    console.error("❌ Error generating sample sales data:", error)
    throw error
  }
}

export async function cleanupSampleData(organizationId: string) {
  try {
    console.log("🧹 Cleaning up sample data for organization:", organizationId)

    // Delete in correct order to respect foreign key constraints
    await db.payment.deleteMany({
      where: {
        salesOrder: { organizationId }
      }
    })

    await db.salesOrderLine.deleteMany({
      where: {
        salesOrder: { organizationId }
      }
    })

    await db.salesOrder.deleteMany({
      where: { organizationId }
    })

    await db.inventoryLevel.deleteMany({
      where: {
        item: { organizationId }
      }
    })

    await db.item.deleteMany({
      where: { organizationId }
    })

    await db.category.deleteMany({
      where: { organizationId }
    })

    await db.customer.deleteMany({
      where: { organizationId }
    })

    console.log("✅ Sample data cleanup completed")

    return {
      success: true,
      message: "Sample data cleaned up successfully"
    }

  } catch (error) {
    console.error("❌ Error cleaning up sample data:", error)
    throw error
  }
}
