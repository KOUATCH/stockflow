

"use server";
import { db } from "@/prisma/db";


export async function deleteProduct(id: string) {

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
     
const product= await tx.item.findUnique({
  where:{id},
})

if(!product){
 return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
}
   const deletedProduct=  await tx.item.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return {
      ok: true,
  data:deletedProduct
    };

    })
} catch (error) {
    console.error("Error deleting product:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
}}
