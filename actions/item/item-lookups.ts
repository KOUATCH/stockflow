'use server'

import { db } from '@/prisma/db';
import { z } from 'zod';

const orgSchema = z.object({ organizationId: z.string().min(1) })

type Result<T> = { success: true; data: T } | { success: false; error: string }

export async function listBrandsAction(input: unknown): Promise<Result<Array<{ id: string; brandName: string }>>> {
  try {
    const { organizationId } = orgSchema.parse(input)
    const data = await db.brand.findMany({
      where: { organizationId },
      select: { id: true, brandName: true },
      orderBy: { brandName: 'asc' },
    })
    return { success: true, data }
  } catch (e) {
    return { success: false, error: 'Failed to load brands' }
  }
}

export async function listCategoriesAction(
  input: unknown
): Promise<Result<Array<{ id: string; title: string }>>> {
  try {
    const { organizationId } = orgSchema.parse(input)
    const data = await db.category.findMany({
      where: { organizationId },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    })
    return { success: true, data }
  } catch (e) {
    return { success: false, error: 'Failed to load categories' }
  }
}

export async function listUnitsAction(input: unknown): Promise<Result<Array<{ id: string; name: string; }>>> {
  try {
    const { organizationId } = orgSchema.parse(input)
    const data = await db.unit.findMany({
      where: { organizationId },
      select: { id: true, name: true},
      orderBy: { name: 'asc' },
    })
    return { success: true, data }
  } catch (e) {
    return { success: false, error: 'Failed to load units' }
  }
}

export async function listTaxRatesAction(
  input: unknown
): Promise<Result<Array<{ id: string; taxRateName: string; rate: number }>>> {
  try {
    const { organizationId } = orgSchema.parse(input)
    const data = await db.taxRate.findMany({
      where: { organizationId },
      select: { id: true, taxRateName: true, rate: true },
      orderBy: { taxRateName: 'asc' },
    })
    return { success: true, data }
  } catch (e) {
    return { success: false, error: 'Failed to load tax rates' }
  }
}
