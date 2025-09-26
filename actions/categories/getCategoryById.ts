"use server";
import { db } from "@/prisma/db";


const getCategoryById= async(id: string)=> {
  try {
    const category = await db.category.findUnique({
      where: {
        id,
      },
    });
    if (!category) {
      return {
        error: `Category not found`,
        success: false,
        data: null,
      };
    }
    // If the category is found, return it
    return{
      error: null,
      success: true,
      data: category,
    };
  } catch (error) {
    console.log(error);
  }
}
 export default getCategoryById;