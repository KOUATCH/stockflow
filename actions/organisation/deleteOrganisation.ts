

"use server";
import { db } from "@/prisma/db";


const  deleteItem=async(id: string)=> {

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
     
const item= await tx.item.findUnique({
  where:{id},
})

if(!item){
 return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
}
   const deletedItem=  await db.item.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
  data:deletedItem
    };

    })
} catch (error) {
    console.error("Error deleting item:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
}}
export default deleteItem
