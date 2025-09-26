"use server";

import { db } from "@/prisma/db";

export async function deleteSaving(id: string) {
  try {
    const deleted = await db.saving.delete( {
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deleted,
    };
  } catch (error) {
    console.log(error);
  }
}
export async function deleteSavingsById(id: string) {
  try {
    const deleted = await db.saving.delete({
      where: {
        id,
      },
    });
    return deleted;
  } catch (error) {
    console.log(error);
  }
}
export async function deleteSavingsByIds(ids: string[]) {
  try {
    const deleted = await db.saving.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return deleted;
  } catch (error) {
    console.log(error);
  }
}
// export async function deleteSavingsBySlug(slug: string) {
//   try {
//     const deleted = await db.saving.delete({
//       where: {
//         slug,
//       },
//     });
//     return deleted;
//   } catch (error) {
//     console.log(error);
//   }
// }