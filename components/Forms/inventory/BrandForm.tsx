"use client";

import { notify } from "@/lib/notifications/notify"
import createBrand from "@/actions/brands/createBrands";
import updateBrandById from "@/actions/brands/updateBrandById";
import TextArea from "@/components/FormInputs/TextAreaInput";
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
import type { BrandCreateDTO, BrandDTO } from "@/types/brand";
import { CheckCircle2, LayoutGrid, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
type BrandFormValues = BrandCreateDTO & { slug?: string };
type BrandsFormProps = {
  editingId?: string | undefined;
  initialData?: Partial<BrandDTO> | undefined | null;
  organizationId: string;
};
const BrandForm = ({
  editingId,
  initialData,
  organizationId,
}: BrandsFormProps) => {

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<BrandFormValues>({
    defaultValues: {
      brandName: initialData?.brandName || initialData?.nameEn || "",
      nameEn: initialData?.nameEn || initialData?.brandName || "",
      slug: initialData?.slug || "",
      organizationId: organizationId,

    },
  });



  async function onSubmit(data: BrandFormValues) {
    setLoading(true);

    try {
      const brandName = data.brandName || data.nameEn || "";
      const slug = generateSlug(brandName).toLowerCase();
      const payload: BrandCreateDTO = {
        brandName,
        nameEn: brandName,
        organizationId: data.organizationId ?? organizationId,
      };

      if (editingId) {
        await updateBrandById(editingId, {
          id: editingId,
          ...payload,
          slug,
        });
        setLoading(false);
        // Toast
        notify.success("Updated Successfully!");
        //reset
        reset();
        //router
        router.push("/dashboard/brands");
      } else {
        const res = await createBrand(payload);
        if (res.success === false) {
          setLoading(false);
          console.log("Error:", { description: res.error });
          notify.error("Error", { description: "Brand not created" });
          return;
        }
        setLoading(false);
        notify.success("Brand Created successfully", { description: "Brand created" });
        // window.location.reload();
        // reset()

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
            Create Brand
          </span>
          <span className="md:sr-only">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Brand creation</DialogTitle>
        </DialogHeader>
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Create New Brand</CardTitle>
          </CardHeader>
          <form className="space-y-1" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col w-full">
              <div className="grid grid-cols-1  gap-4 mb-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Brand Name"
                  name="brandName"
                  placeholder="Brand Name"
                  isRequired
                />


                <div className="grid gap-3">
                  <TextArea
                    register={register}
                    errors={errors}
                    label="Slug"
                    name="slug"
                    isRequired={true}
                  />
                </div>
              </div>

              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-6 w-6" />
                  Please wait...
                </Button>
              ) : (
                <Button type="submit">
                  <CheckCircle2 className="mr-2 h-6 w-6" /> Save Brand
                </Button>
              )}
            </div>
          </form>
        </Card>

      </DialogContent>
    </Dialog>
  );
}

export default BrandForm
