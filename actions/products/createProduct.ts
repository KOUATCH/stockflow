"use server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { db } from "@/prisma/db";
import { ProductProps } from "@/types/types";
import { revalidatePath } from "next/cache";


const createProduct=async(data: ProductProps)=> {
  const user = await  getAuthenticatedUser();
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
   const orgId= user.organizationId;
      //check if the product already exists for the Organization
     
      const existingOrgProduct = await tx.product.findUnique({
        where: {
          name_organizationId: {
            name: data?.name,
            organizationId: orgId,
          },
        },
      })
console.log({existingOrgProduct})
      if (existingOrgProduct) {
        return {
          error: `This Product ${data?.name} is already in use for this orgnisation`,
          status: 409,
          data: null,
        };
      }
      // Create product
      const newProduct = await tx.product.create({
        data:{
        ...data,
        organizationId:orgId,
       }}); 

console.log({data})
revalidatePath("/dashboard/inventory/products")
      // Check if the product was created successfully   
      return {
          status: 200,
          error: null,
          data: newProduct,
        };
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}

export default createProduct

