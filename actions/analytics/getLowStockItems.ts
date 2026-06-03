"use server";
import { db } from "@/prisma/db";

export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  minStockLevel: number;
  stockDeficit: number;
  daysUntilOutOfStock: number | null;
  category: {
    id: string;
    title: string;
  } | null;
  brand: {
    id: string;
    brandName: string;
  } | null;
  unit: {
    id: string;
    name: string;
    symbol: string;
  } | null;
  costPrice: number;
  sellingPrice: number;
  totalValue: number;
  location: {
    id: string;
    name: string;
  };
  lastTransactionAt: Date | null;
  isActive: boolean;
  urgencyLevel: 'critical' | 'warning' | 'low';
}

const getLowStockItems = async (orgId: string) => {
  try {
    console.log('getLowStockItems called with orgId:', orgId);

    // Validate orgId
    if (!orgId) {
      throw new Error("Organization ID is required");
    }

    // Fetch all active items with inventory levels
    const itemsWithInventory = await db.item.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
      },
      include: {
        inventoryLevels: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            titleEn: true,
            titleFr: true,
          }
        },
        brand: {
          select: {
            id: true,
            nameEn: true,
          }
        },
        unit: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
            symbol: true,
          }
        }
      },
      orderBy: {
        inventoryLevels: {
          _count: 'desc'
        }
      }
    });

    console.log('Found items with potential low stock:', itemsWithInventory.length);

    // Transform and filter the data
    const lowStockItems: LowStockItem[] = [];

    for (const item of itemsWithInventory) {
      for (const inventoryLevel of item.inventoryLevels) {
        const currentStock = Number(inventoryLevel.quantityOnHand ?? 0);
        const reorderPoint = Number(inventoryLevel.reorderPoint ?? 0);
        const minStockLevel = Number(item.minStockLevel ?? 0);
        const threshold = Math.max(reorderPoint, minStockLevel);

        // Only include if actually below threshold
        if (currentStock <= threshold) {
          const stockDeficit = threshold - currentStock;

          // Calculate urgency level
          let urgencyLevel: 'critical' | 'warning' | 'low' = 'low';
          if (currentStock === 0) {
            urgencyLevel = 'critical';
          } else if (currentStock <= (threshold * 0.3)) {
            urgencyLevel = 'critical';
          } else if (currentStock <= (threshold * 0.6)) {
            urgencyLevel = 'warning';
          }

          // Estimate days until out of stock (simplified calculation)
          // This would ideally use historical sales data
          let daysUntilOutOfStock: number | null = null;
          if (currentStock > 0) {
            // Rough estimate: if we assume 1 unit per day consumption
            daysUntilOutOfStock = currentStock;
          }

          lowStockItems.push({
            id: item.id,
            name: item.nameEn,
            sku: item.sku || 'N/A',
            currentStock,
            reorderPoint,
            minStockLevel,
            stockDeficit,
            daysUntilOutOfStock,
            category: item.category
              ? {
                  id: item.category.id,
                  title: item.category.titleEn,
                }
              : null,
            brand: item.brand
              ? {
                  id: item.brand.id,
                  brandName: item.brand.nameEn,
                }
              : null,
            unit: item.unit
              ? {
                  id: item.unit.id,
                  name: item.unit.nameEn,
                  symbol: item.unit.symbol,
                }
              : null,
            costPrice: Number(item.costPrice ?? 0),
            sellingPrice: Number(item.sellingPrice ?? 0),
            totalValue: currentStock * Number(item.costPrice ?? 0),
            location: inventoryLevel.location,
            lastTransactionAt: inventoryLevel.lastTransactionAt,
            isActive: item.isActive,
            urgencyLevel
          });
        }
      }
    }

    // Sort by urgency and stock deficit
    const sortedLowStockItems = lowStockItems.sort((a, b) => {
      const urgencyOrder = { critical: 3, warning: 2, low: 1 };
      const urgencyDiff = urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.stockDeficit - a.stockDeficit;
    });

    console.log('Final low stock items:', sortedLowStockItems.length);

    return {
      data: sortedLowStockItems,
      success: true,
      error: null,
      message: `Found ${sortedLowStockItems.length} low stock items`
    };

  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return {
      data: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

export default getLowStockItems;
