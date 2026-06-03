"use server";

import { db } from "@/prisma/db";

export interface UnitDTO {
  id: string;
  nameEn: string;
  nameFr?: string | null;
  name: string;
  symbol: string;
  type?: string | null;
  baseUnit?: string | null;
  conversionRate?: string | null;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getOrgUnits(organizationId: string): Promise<{
  success: boolean;
  data?: UnitDTO[];
  error?: string;
}> {
  try {
    if (!organizationId) {
      return {
        success: false,
        error: "Organization ID is required"
      };
    }

    const units = await db.unit.findMany({
      where: {
        organizationId: organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedUnits: UnitDTO[] = units.map(unit => ({
      id: unit.id,
      nameEn: unit.nameEn,
      nameFr: unit.nameFr,
      name: unit.nameEn,
      symbol: unit.symbol,
      type: unit.type,
      baseUnit: unit.baseUnit,
      conversionRate: unit.conversionRate?.toString() ?? null,
      isActive: unit.isActive,
      organizationId: unit.organizationId,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    }));

    return {
      success: true,
      data: formattedUnits,
    };
  } catch (error) {
    console.error("Error fetching units:", error);
    return {
      success: false,
      error: "Failed to fetch units",
    };
  }
}

export async function createUnit(data: {
  organizationId: string;
  nameEn: string;
  nameFr?: string | null;
  symbol: string;
}): Promise<{
  success: boolean;
  data?: UnitDTO;
  error?: string;
}> {
  try {
    const unit = await db.unit.create({
      data: {
        organizationId: data.organizationId,
        nameEn: data.nameEn,
        nameFr: data.nameFr ?? null,
        symbol: data.symbol,
      },
    });

    const formattedUnit: UnitDTO = {
      id: unit.id,
      nameEn: unit.nameEn,
      nameFr: unit.nameFr,
      name: unit.nameEn,
      symbol: unit.symbol,
      type: unit.type,
      baseUnit: unit.baseUnit,
      conversionRate: unit.conversionRate?.toString() ?? null,
      isActive: unit.isActive,
      organizationId: unit.organizationId,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };

    return {
      success: true,
      data: formattedUnit,
    };
  } catch (error) {
    console.error("Error creating unit:", error);
    return {
      success: false,
      error: "Failed to create unit",
    };
  }
}

export async function updateUnit(data: {
  id: string;
  organizationId: string;
  nameEn?: string;
  nameFr?: string | null;
  symbol?: string;
}): Promise<{
  success: boolean;
  data?: UnitDTO;
  error?: string;
}> {
  try {
    const unit = await db.unit.update({
      where: {
        id: data.id,
        organizationId: data.organizationId,
      },
      data: {
        ...(data.nameEn && { nameEn: data.nameEn }),
        ...(data.nameFr !== undefined && { nameFr: data.nameFr }),
        ...(data.symbol && { symbol: data.symbol }),
      },
    });

    const formattedUnit: UnitDTO = {
      id: unit.id,
      nameEn: unit.nameEn,
      nameFr: unit.nameFr,
      name: unit.nameEn,
      symbol: unit.symbol,
      type: unit.type,
      baseUnit: unit.baseUnit,
      conversionRate: unit.conversionRate?.toString() ?? null,
      isActive: unit.isActive,
      organizationId: unit.organizationId,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };

    return {
      success: true,
      data: formattedUnit,
    };
  } catch (error) {
    console.error("Error updating unit:", error);
    return {
      success: false,
      error: "Failed to update unit",
    };
  }
}

export async function deleteUnit(data: {
  id: string;
  organizationId: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await db.unit.delete({
      where: {
        id: data.id,
        organizationId: data.organizationId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting unit:", error);
    return {
      success: false,
      error: "Failed to delete unit",
    };
  }
}
