"use client";

import { notify } from "@/lib/notifications/notify"
import { createActionItem as createItem } from "@/actions/itemsShow/createActionItem";
import { updateItemById } from "@/actions/itemsShow/updateItemById";
import TextInput from "@/components/FormInputs/TextInput";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { generateSlug } from "@/lib/generateSlug";
import { ItemCreateDTO } from "@/types/item";
import { CheckCircle2, LayoutGrid, Loader2 } from "lucide-react";
import router from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
type ItemFormProps = {
  editingId?: string | undefined;
  initialData?: ItemCreateDTO | undefined | null;
  organizationId: string;
};
const NewItemForm = ({
  editingId,
  initialData,
  organizationId,
}: ItemFormProps) => {

  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<ItemCreateDTO>({
    defaultValues: {
      nameEn: initialData?.nameEn || "",
      nameFr: initialData?.nameFr || "",
      sku: initialData?.sku || "",
      organizationId: organizationId,
      costPrice: initialData?.costPrice || 0,
      sellingPrice: initialData?.sellingPrice || 0,
      // thumbnail: initialData?.thumbnail || "",

    },
  });



  async function onSubmit(data: ItemCreateDTO) {
    setLoading(true);

    try {
      // Convert ItemCreateDTO to UpdateItemPayload
      const payload = {
        ...data,
        slug: generateSlug(data?.nameEn).toLowerCase(),
        organizationId: organizationId,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      };

      if (editingId) {
        // Ensure createdAt is a Date if present
        if (payload.createdAt && !(payload.createdAt instanceof Date)) {
          payload.createdAt = new Date(payload.createdAt);
        }
        await updateItemById({ id: editingId, data: payload });
        setLoading(false);
        notify.success("Updated Successfully!");
        reset();
        router.push("/dashboard/items");
      } else {
        const res = await createItem(payload);
        if (res.success === false) {
          setLoading(false);
          console.log("Error:", res.error);
          return;
        }
        setLoading(false);
        notify.success("Item Created successfully", { description: "Item created" });
        window.location.reload();
        reset();
      }
    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Created some Item
          </span>
          <span className="md:sr-only">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Item creation</DialogTitle>
        </DialogHeader>
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Create New Item</CardTitle>
          </CardHeader>
          <form className="space-y-1 m-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2  items-center justify-between w-full gap-3 mb-3 ">
              <TextInput
                register={register}
                errors={errors}
                label="English Item Name"
                name="nameEn"
                placeholder="Product Name"
                isRequired
              />

              <TextInput
                register={register}
                errors={errors}
                label="French Item Name"
                name="nameFr"
                placeholder="Nom du produit"
              />

              <TextInput
                register={register}
                errors={errors}
                label="SKU"
                name="sku"
                isRequired={true}
              />

              <TextInput
                register={register}
                errors={errors}
                label="Cost Price"
                name="costPrice"
                isRequired={true}
                type="number"
              />


              <TextInput
                register={register}
                errors={errors}
                label="Selling Price"
                name="sellingPrice"
                isRequired={true}
                type="number"

              />
            </div>
            <div className="grid auto-rows-max items-start ">

              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-6 w-6" />
                  Please wait...
                </Button>
              ) : (
                <Button type="submit" className="w-full" disabled={loading}>

                  <CheckCircle2 className="mr-2 h-6 w-6" /> Save Item
                </Button>
              )}
            </div>
          </form>
        </Card>

      </DialogContent>
    </Dialog>
  );
}

export default NewItemForm
