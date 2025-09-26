"use server";
import { db } from "@/prisma/db";
import { CategoryResponse } from "@/types/category";

const getOrgCategories = async (organizationId:string): Promise<CategoryResponse> => {
 
  try {
    // Validate the organizationId
    const rawCategories = await db.category.findMany({
      where: {
        organizationId: organizationId,
        },
     
      orderBy: {
        title: "desc",
      },
    });

    const categories = rawCategories.map(category => ({
      ...category,
      imageUrls: typeof category.imageUrl === "string"
        ? category.imageUrl
        : Array.isArray(category.imageUrl)
          ? (category.imageUrl as string[]).join(",")
          : "",
    }));

    return {
      success: true,
      data: categories,
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

export default getOrgCategories