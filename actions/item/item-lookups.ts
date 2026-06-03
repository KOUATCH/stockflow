'use server'
import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { db } from '@/prisma/db';
import { z } from 'zod';

const orgSchema = z.object({ organizationId: z.string().min(1) })

export const listBrandsAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<Array<{ id: string; brandName: string }>>> => {
    const { organizationId } = orgSchema.parse(input)
    const brands = await db.brand.findMany({
      where: { organizationId },
      select: { id: true, nameEn: true },
      orderBy: { nameEn: 'asc' },
    })
    const data = brands.map((brand) => ({
      id: brand.id,
      brandName: brand.nameEn,
    }))
    return { success: true, data }
  },
  {
    actionName: 'listBrandsAction',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'read',
      resourceType: 'brand'
    }
  }
)

export const listCategoriesAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<Array<{ id: string; title: string }>>> => {
    const { organizationId } = orgSchema.parse(input)
    const categories = await db.category.findMany({
      where: { organizationId },
      select: { id: true, titleEn: true, titleFr: true },
      orderBy: { titleEn: 'asc' },
    })
    const data = categories.map((category) => ({
      id: category.id,
      title: category.titleEn,
    }))
    return { success: true, data }
  },
  {
    actionName: 'listCategoriesAction',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'read',
      resourceType: 'category'
    }
  }
)

export const listUnitsAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<Array<{ id: string; name: string; }>>> => {
    const { organizationId } = orgSchema.parse(input)
    const units = await db.unit.findMany({
      where: { organizationId },
      select: { id: true, nameEn: true, nameFr: true },
      orderBy: { nameEn: 'asc' },
    })
    const data = units.map((unit) => ({
      id: unit.id,
      name: unit.nameEn,
    }))
    return { success: true, data }
  },
  {
    actionName: 'listUnitsAction',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'read',
      resourceType: 'unit'
    }
  }
)

export const listTaxRatesAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<Array<{ id: string; taxRateName: string; rate: number }>>> => {
    const { organizationId } = orgSchema.parse(input)
    const taxRates = await db.taxRate.findMany({
      where: { organizationId },
      select: { id: true, nameEn: true, rate: true },
      orderBy: { nameEn: 'asc' },
    })
    const data = taxRates.map((taxRate) => ({
      id: taxRate.id,
      taxRateName: taxRate.nameEn,
      rate: Number(taxRate.rate),
    }))
    return { success: true, data }
  },
  {
    actionName: 'listTaxRatesAction',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'read',
      resourceType: 'taxRate'
    }
  }
)
