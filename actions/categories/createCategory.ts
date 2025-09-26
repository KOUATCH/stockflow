"use server";
import { generateSlug } from "@/lib/generateSlug";
import { db } from "@/prisma/db";
import { CategoryCreateDTO } from "@/types/category";
import { revalidatePath } from "next/cache";


const createCategory = async (data: CategoryCreateDTO) => {
  // const {  symbol, name} = data;
  data.slug = generateSlug(data.title,data.description);
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {

      //check if the category already exists
      const existingCategory = await tx.category.findUnique({
        where: { slug: data?.slug }
      })
      console.log({ existingCategory })
      if (existingCategory) {
        return {
          error: `This Category ${data?.slug} has already been created`,
          success: false,
          data: null,
        };
      }
      // Create new category
      const newCategory = await tx.category.create({ data });
      revalidatePath("/inventory/categories");

      return {
        error: null,
        success: true,
        data:newCategory
      };
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      error: `Something went wrong, Please try again`,
      success: false,
      data: null,
    };
  }
}

export default createCategory

