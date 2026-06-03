import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { db } from "@/prisma/db";
import { ItemCreateDTO } from "@/types/item";
import { revalidatePath } from "next/cache";

const DEFAULT_IMAGE_URL =
  "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd";

const formatItemData = (data: ItemCreateDTO, organizationId: string) => ({
  nameEn: data.nameEn,
  nameFr: data.nameFr ?? null,
  descriptionEn: data.descriptionEn ?? null,
  descriptionFr: data.descriptionFr ?? null,
  slug: data.slug || data.nameEn.toLowerCase().replace(/\s+/g, "-"),
  sku: data.sku,
  thumbnail: data.thumbnail ?? null,
  organizationId,
  costPrice: Number(data.costPrice ?? 0),
  sellingPrice: Number(data.sellingPrice ?? 0),
  imageUrls: data.imageUrls ? [data.imageUrls] : [DEFAULT_IMAGE_URL],
});

export const createOldItem = inventoryAction(
  async (data: ItemCreateDTO & { organizationId?: string }): Promise<ServerActionResult<any>> => {
    const user = await getAuthenticatedUser();
    const organizationId = data.organizationId ?? user.organizationId;

    if (!organizationId) {
      throw new Error("User not found or not associated with an organization");
    }

    const result = await db.$transaction(async (tx) => {
      const existingItem = await tx.item.findFirst({
        where: {
          organizationId,
          nameEn: data.nameEn,
        },
      });

      if (existingItem) {
        throw new Error(`Item "${data.nameEn}" already exists for this organization`);
      }

      const newItem = await tx.item.create({
        data: formatItemData(data, organizationId),
      });

      revalidatePath("/inventory/items");

      return newItem;
    });

    return {
      success: true,
      data: result,
    };
  },
  {
    actionName: 'createOldItem',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'create',
      resourceType: 'item'
    }
  }
)
