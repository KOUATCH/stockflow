import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { ItemCreateDTO } from "@/types/item";
import { revalidatePath } from "next/cache";

const DEFAULT_IMAGE_URL =
  "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd";

const formatItemData = (data: ItemCreateDTO, organizationId: string) => ({
  ...data,
  organizationId,
  costPrice: Number(data.costPrice ?? 0),
  sellingPrice: Number(data.sellingPrice ?? 0),
  imageUrls: data.imageUrls?.[0] ?? DEFAULT_IMAGE_URL,
});

const createOldItem = async (data: ItemCreateDTO, organizationId:string) => {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.organizationId) {
      return {
        success: false,
        error: "User not found or not associated with an organization",
        data: null,
      };
    }

    return await db.$transaction(async (tx) => {
      const existingItem = await tx.item.findUnique({
        where: {
          organizationId_name: {
            organizationId:organizationId,
            name: data.name ?? "",
          },
        },
      });

      if (existingItem) {
        return {
          success: false,
          error: `Item "${data.name}" already exists for this organization`,
          data: null,
        };
      }

      const newItem = await tx.item.create({
        data: formatItemData(data,organizationId),
      });

      revalidatePath("/inventory/items");

      return {
        success: true,
        error: null,
        data: newItem,
      };
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return {
      success: false,
      error: "Something went wrong. Item was not created. Please try again.",
      data: null,
    };
  }
};

export default createOldItem;
