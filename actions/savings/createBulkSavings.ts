import { SavingProps } from "@/types/types";
import createSaving from "./createSaving";

export const createBulkSavings = async (savings: SavingProps[]) => {
  try {
    for (const saving of savings) {
      await createSaving(saving);
    }
  } catch (error) {
    console.log(error);
  }
}
