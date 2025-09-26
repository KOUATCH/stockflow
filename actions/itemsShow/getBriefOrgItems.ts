"use server";
import { db } from "@/prisma/db";
import { CompleteItemResponse, ItemDTO } from "@/types/itemTypes";

const   getBriefOrgItems = async (organizationId:string): Promise<CompleteItemResponse> => {
 
  try {
    // Validate the organizationId
    const rawItems:ItemDTO[] = await db.item.findMany({
      where: {
        organizationId: organizationId,
        },
     
      orderBy: {
        name: "desc",
      },
    });

    // const items = rawItems.map(item => ({
    //   ...item,
    //   imageUrls: typeof item.imageUrls === "string"
    //     ? item.imageUrls
    //     : Array.isArray(item.imageUrls)
    //       ? (item.imageUrls as string[]).join(",")
    //       : "",
    // }));

    return {
      success: true,
      data: rawItems,
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