

"use server";
import { db } from "@/prisma/db";


export async function deleteUser(id: string) {

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
     
const user= await tx.user.findUnique({
  where:{id},
  select:{
    email:true
  }
})

await tx.invite.delete({
  where:{email:user?.email}
});

   const deletedUser=  await db.user.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
  data:deletedUser
    };

    })
} catch (error) {
    console.error("Error deleting user:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
}}

