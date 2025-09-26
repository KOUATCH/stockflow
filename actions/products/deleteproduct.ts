

"use server";
import { db } from "@/prisma/db";


export async function deleteProduct(id: string) {

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
     
const product= await tx.product.findUnique({
  where:{id},
})

if(!product){
 return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
}
   const deletedProduct=  await db.product.delete({
      where: {
        id,
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

