"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import createCategory from "@/actions/categories/createCategory";
import updateCategoryById from "@/actions/categories/updateCategoryById";
import { generateSlug } from "@/lib/generateSlug";
import { CategoryProps } from "@/types/types";
import { Category } from "@prisma/client";
import { toast } from "sonner";
import ImageInput from "../FormInputs/ImageInput";
import TextArea from "../FormInputs/TextAreaInput";
import TextInput from "../FormInputs/TextInput";
import FormFooter from "./FormFooter";
import FormHeader from "./FormHeader";

export type SelectOptionProps = {
  label: string;
  value: string;
};

type CategoryFormProps = {
  editingId?: string | undefined;
  initialData?: Category | undefined | null;
};

export default function CategoryForm({
  editingId,
  initialData,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryProps>({
    defaultValues: {
      title: initialData?.title,
      description: initialData?.description || "",
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const initialImage = initialData?.imageUrl || "/images/slide-2.jpg";
  const [imageUrl, setImageUrl] = useState(initialImage);

  async function saveCategory(data: CategoryProps) {
    try {
      setLoading(true);
      data.slug = generateSlug(data.title);
      data.imageUrl = imageUrl;

      if (editingId) {
        await updateCategoryById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!",{description:"Category Successfully updated"});
        //reset
        reset();
        //route
        router.push("/dashboard/inventory/categories");
        setImageUrl("/placeholder.svg");
      } else {
        await createCategory(data);
        setLoading(false);
        // Toast
        toast.success("Successfully Created!",{description:"Category Successfully Created"});
        //reset
        reset();
        setImageUrl("/placeholder.svg");
        //route
        router.push("/dashboard/inventory/categories");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  

  return (
    <form className="" onSubmit={handleSubmit(saveCategory)}>
      <FormHeader
        href="/inventory/categories"
        parent=""
        title="Category"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Category Title</CardTitle>
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
                    label="Category Title"
                    name="title"
                  />
                </div>
                <div className="grid gap-3">
                  <TextArea
                    register={register}
                    errors={errors}
                    label="Description"
                    name="description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-full ">
          <div className="grid auto-rows-max items-start gap-4 ">
            <ImageInput
              title="Category Image"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              endpoint="categoryImage"
            />
          </div>
        </div>
      </div>
      <FormFooter
        href="/dashboard/inventory/categories"
        editingId={editingId}
        loading={loading}
        title="Category"
        parent=""
      />
    </form>
  );
}
