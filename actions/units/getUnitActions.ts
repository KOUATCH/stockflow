"use server";

import { db } from "@/prisma/db";

export interface UnitDTO {
  id: string;
  nameEn: string;
  nameFr?: string | null;
  name: string;
  symbol: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemByUnitDTO {
  id: string;
  nameEn: string;
  nameFr?: string | null;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  thumbnail: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    titleEn: string;
    titleFr?: string | null;
    title: string;
  } | null;
  brand: {
    id: string;
    brandName: string;
  } | null;
}

export interface UnitDetailsDTO extends UnitDTO {
  _count: {
    items: number;
  };
  items?: ItemByUnitDTO[];
}

export async function getUnitById(unitId: string, organizationId: string): Promise<{
  success: boolean;
  data?: UnitDetailsDTO;
  error?: string;
}> {
  try {
    if (!unitId || !organizationId) {
      return {
        success: false,
        error: "Unit ID and Organization ID are required"
      };
    }

    const unit = await db.unit.findUnique({
      where: {
        id: unitId,
        organizationId: organizationId,
      },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    if (!unit) {
      return {
        success: false,
        error: "Unit not found"
      };
    }

    const formattedUnit: UnitDetailsDTO = {
      id: unit.id,
      nameEn: unit.nameEn,
      nameFr: unit.nameFr,
      name: unit.nameEn,
      symbol: unit.symbol,
      organizationId: unit.organizationId,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      _count: unit._count,
    };

    return {
      success: true,
      data: formattedUnit,
    };
  } catch (error) {
    console.error("Error fetching unit:", error);
    return {
      success: false,
      error: "Failed to fetch unit",
    };
  }
}

export async function getItemsByUnit(unitId: string, organizationId: string): Promise<{
  success: boolean;
  data?: ItemByUnitDTO[];
  error?: string;
}> {
  try {
    if (!unitId || !organizationId) {
      return {
        success: false,
        error: "Unit ID and Organization ID are required"
      };
    }

    const items = await db.item.findMany({
      where: {
        unitId: unitId,
        organizationId: organizationId,
        isActive: true,
      },
      select: {
        id: true,
        nameEn: true,
        nameFr: true,
        sku: true,
        costPrice: true,
        sellingPrice: true,
        thumbnail: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedItems: ItemByUnitDTO[] = items.map(item => ({
      id: item.id,
      nameEn: item.nameEn,
      nameFr: item.nameFr,
      name: item.nameEn,
      sku: item.sku,
      costPrice: Number(item.costPrice),
      sellingPrice: Number(item.sellingPrice),
      thumbnail: item.thumbnail,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      category: item.category
        ? {
            ...item.category,
            title: item.category.titleEn,
          }
        : null,
      brand: item.brand
        ? {
            ...item.brand,
            brandName: item.brand.nameEn,
          }
        : null,
    }));

    return {
      success: true,
      data: formattedItems,
    };
  } catch (error) {
    console.error("Error fetching items by unit:", error);
    return {
      success: false,
      error: "Failed to fetch items by unit",
    };
  }
}
