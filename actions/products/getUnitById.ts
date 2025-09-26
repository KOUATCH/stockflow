"use server";
import { db } from "@/prisma/db";


const getUnitById= async(id: string)=> {
  try {
    const unit = await db.unit.findUnique({
      where: {
        id,
      },
    });
    return unit;
  } catch (error) {
    console.log(error);
  }
}
 export default getUnitById