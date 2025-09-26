"use client";
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
import { BrandCreateDTO } from "@/types/brand";
import { CheckCircle2, LayoutGrid, Loader2 } from "lucide-react";
import router from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type BrandsFormProps = {
  editingId?: string | undefined;
  initialData?: BrandCreateDTO | undefined | null;
  organizationId: string;
};
const BrandForm = ({
  editingId,
  initialData,
  organizationId,
}: BrandsFormProps) => {

  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<BrandCreateDTO>({
    defaultValues: {
      brandName: initialData?.brandName || "",
      slug: initialData?.slug || "",
      organizationId: organizationId,

    },
  });



  async function onSubmit(data: BrandCreateDTO) {
    setLoading(true);

    try {
      data.slug = generateSlug(data.brandName || "").toLowerCase();
      if (editingId) {
        await updateBrandById(editingId, {
          id: editingId,
          brandName: data.brandName,
          slug: data.slug,
          organizationId: data.organizationId,
          createdAt: initialData?.createdAt ?? new Date(),
        });
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //router
        router.push("/dashboard/brands");
      } else {
        const res = await createBrand(data);
        if (res.success === false) {
          setLoading(false);
          console.log("Error:", { description: res.error });
          toast.error("Error", { description: "Brand not created" });
          return;
        }
        setLoading(false);
        toast.success("Brand Created successfully", { description: "Brand created" });
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