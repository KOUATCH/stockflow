"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth-server";
import { db } from "@/prisma/db";

type ProductProps = {
  name?: string;
  nameEn?: string;
  nameFr?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  sku?: string;
  barcode?: string | null;
  imageUrls?: string[];
  thumbnail?: string | null;
  costPrice?: number;
  sellingPrice?: number;
  categoryId?: string | null;
  brandId?: string | null;
  unitId?: string | null;
};

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "product"
  );
}

const createProduct = async (data: ProductProps) => {
  const user = await getAuthenticatedUser();

  try {
    return await db.$transaction(async (tx) => {
      const organizationId = user.organizationId;
      const nameEn = data.nameEn ?? data.name;

      if (!nameEn) {
        return {
          error: "Product name is required",
          status: 400,
          data: null,
        };
      }

      const sku = data.sku ?? `SKU-${Date.now().toString(36).toUpperCase()}`;
      const existingItem = await tx.item.findUnique({
        where: {
          organizationId_sku: {
            organizationId,
            sku,
          },
        },
      });

      if (existingItem) {
        return {
          error: `This product SKU ${sku} is already in use for this organisation`,
          status: 409,
          data: null,
        };
      }

      const newProduct = await tx.item.create({
        data: {
          organizationId,
          slug: `${slugify(nameEn)}-${Date.now().toString(36)}`,
          sku,
          barcode: data.barcode ?? null,
          nameEn,
          nameFr: data.nameFr ?? null,
          descriptionEn: data.descriptionEn ?? data.description ?? null,
          descriptionFr: data.descriptionFr ?? data.description ?? null,
          imageUrls: data.imageUrls ?? [],
          thumbnail: data.thumbnail ?? null,
          costPrice: data.costPrice ?? 0,
          sellingPrice: data.sellingPrice ?? 0,
          categoryId: data.categoryId ?? null,
          brandId: data.brandId ?? null,
          unitId: data.unitId ?? null,
        },
      });

      revalidatePath("/dashboard/inventory/products");
      revalidatePath("/dashboard/inventory/items");

      return {
        status: 200,
        error: null,
        data: newProduct,
      };
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      error: "Something went wrong, please try again",
      status: 500,
      data: null,
    };
  }
};

export default createProduct;
