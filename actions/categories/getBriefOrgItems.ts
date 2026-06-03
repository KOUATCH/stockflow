"use server";
import { db } from "@/prisma/db";
import { CompleteItemResponse, ItemDTO } from "@/types/itemTypes";

const getBriefOrgItems = async (organizationId:string): Promise<CompleteItemResponse> => {
 
  try {
    // Validate the organizationId
    const rawItems = await db.item.findMany({
      where: {
        organizationId: organizationId,
        },
     
      orderBy: {
        nameEn: "desc",
      },
    });

    const items: ItemDTO[] = rawItems.map((item) => ({
      id: item.id,
      nameEn: item.nameEn,
      nameFr: item.nameFr,
      sku: item.sku,
      barcode: item.barcode,
      descriptionEn: item.descriptionEn,
      descriptionFr: item.descriptionFr,
      dimensions: item.dimensions,
      upc: item.upc,
      ean: item.ean,
      slug: item.slug,
      mpn: item.mpn,
      isbn: item.isbn,
      thumbnail: item.thumbnail,
      organizationId: item.organizationId,
      categoryId: item.categoryId,
      taxRateId: item.taxRateId,
      brandId: item.brandId,
      unitId: item.unitId,
      costPrice: Number(item.costPrice),
      weight: item.weight === null ? null : Number(item.weight),
      sellingPrice: Number(item.sellingPrice),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      minStockLevel: Number(item.minStockLevel),
      maxStockLevel: item.maxStockLevel === null ? null : Number(item.maxStockLevel),
      isActive: item.isActive,
      imageUrls: item.imageUrls.join(","),
      name: item.nameEn,
      description: item.descriptionEn ?? undefined,
    }));

    return {
      success: true,
      data: items,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching the count:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
    };
};

export default getBriefOrgItems
