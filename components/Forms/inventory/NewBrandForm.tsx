"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useState } from "react";
import { useForm } from "react-hook-form";

import updateBrandById from "@/actions/brands/updateBrandById";
import TextArea from "@/components/FormInputs/TextAreaInput";
import TextInput from "@/components/FormInputs/TextInput";

import createBrand from "@/actions/brands/createBrands";
import { BrandCreateDTO, UpdateBrandPayload } from "@/types/brand";
import { Brand } from "@prisma/client";
import { toast } from "sonner";

export type SelectOptionProps = {
  label: string;
  value: string;
};
type BrandsFormProps = {
  editingId?: string | undefined;
  initialData?: Brand | undefined | null;
  organizationId: string;
  // organizationName: string;
};
const NewBrandForm = ({
  editingId,
  initialData,
  organizationId,
}: BrandsFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandCreateDTO>({
    defaultValues: {
      brandName: initialData?.brandName,
      slug: initialData?.slug || "",
      organizationId: initialData?.organizationId || "",
    },
  });

  const [loading, setLoading] = useState(false);

  async function saveBrands(data: BrandCreateDTO) {
    try {
      setLoading(true);

      if (editingId) {
        const updatePayload: UpdateBrandPayload = {
          id: editingId,
          brandName: data.brandName,
          slug: data.slug,
          organizationId: data.organizationId ?? "",
          createdAt: initialData?.createdAt || new Date(),
        };
        await updateBrandById(editingId, updatePayload);
        setLoading(false);
        toast.success("Updated Successfully!", { description: " Brand Updated successfully" });
        window.location.reload();
        reset()
      } else {
        await createBrand(data);
        setLoading(false);
        // Toast
        toast.success("Successfully Created!", { description: " Brand Created successfully" });
        window.location.reload();
        reset()
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(saveBrands)}>

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Create brand</CardTitle>
              <CardDescription>
                Lipsum dolor sit amet, consectetur adipiscing elit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Brand Name"
                    name="brandName"
                  />
                </div>
                <div className="grid gap-3">
                  <TextArea
                    register={register}
                    errors={errors}
                    label="Slug"
                    name="slug"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </form>
  );
}
export default NewBrandForm