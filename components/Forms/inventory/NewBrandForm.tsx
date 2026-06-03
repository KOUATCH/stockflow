"use client";

import { notify } from "@/lib/notifications/notify"
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
type BrandFormValues = BrandCreateDTO & { slug?: string };
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
  } = useForm<BrandFormValues>({
    defaultValues: {
      brandName: initialData?.brandName || initialData?.nameEn || "",
      nameEn: initialData?.nameEn || initialData?.brandName || "",
      slug: initialData?.slug || "",
      organizationId: initialData?.organizationId || organizationId,
    },
  });

  const [loading, setLoading] = useState(false);

  async function saveBrands(data: BrandFormValues) {
    try {
      setLoading(true);
      const brandName = data.brandName || data.nameEn || "";
      const payload: BrandCreateDTO = {
        brandName,
        nameEn: brandName,
        organizationId: data.organizationId ?? organizationId,
      };

      if (editingId) {
        const updatePayload: UpdateBrandPayload = {
          id: editingId,
          ...payload,
          slug: data.slug,
        };
        await updateBrandById(editingId, updatePayload);
        setLoading(false);
        notify.success("Updated Successfully!", { description: " Brand Updated successfully" });
        window.location.reload();
        reset()
      } else {
        await createBrand(payload);
        setLoading(false);
        // Toast
        notify.success("Successfully Created!", { description: " Brand Created successfully" });
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
