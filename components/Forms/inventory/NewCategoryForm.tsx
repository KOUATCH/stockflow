"use client";
import createCategory from "@/actions/categories/createCategory";
import updateCategoryById from "@/actions/categories/updateCategoryById";
import ImageInput from "@/components/FormInputs/ImageInput";
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
import { CategoryProps } from "@/types/types";
import { Category } from "@prisma/client";
import { CheckCircle2, LayoutGrid, Loader2 } from "lucide-react";
import router from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type CategoriesFormProps = {
  editingId?: string | undefined;
  initialData?: Category | undefined | null;
  organizationId: string;
};
const NewCategoryForm = ({
  editingId,
  initialData,
  organizationId,
}: CategoriesFormProps) => {

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const initialImage = initialData?.imageUrl || "/images/slide-2.jpg";
  const [imageUrl, setImageUrl] = useState(initialImage);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<CategoryProps>({
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      imageUrl: initialImage,
      description: initialData?.description || "",
      organizationId: organizationId,

    },
  });



  async function onSubmit(data: CategoryProps) {

    setLoading(true);

    try {
      data.slug = generateSlug(data.title).toLowerCase();
      data.imageUrl = imageUrl;
      if (editingId) {
        await updateCategoryById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //router
        router.push("/dashboard/categories");
      } else {
        const res = await createCategory(data);
        if (res.status !== 200) {
          setLoading(false);
          console.log("Error:", res.error);
          // toast.error(res.error, { description: "Category not created" });
          // setErr(res.error ?? "Something went wrong, Please try again")
          return;
        }
        setLoading(false);
        toast.success("Category Created successfully", { description: "Category created" });
        window.location.reload();
        reset()

      }

    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
      // toast.error("Its seems something is wrong, try again");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create Category
          </span>
          <span className="md:sr-only">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Category creation</DialogTitle>
        </DialogHeader>
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Create New Category</CardTitle>
          </CardHeader>
          <form className="space-y-1 m-4 flex-col " onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1   items-center justify-between w-full gap-3 mb-3">
              <TextInput
                register={register}
                errors={errors}
                label="Category Name"
                name="title"
                placeholder="Category Name"
                isRequired
              />


              <div className="grid gap-3">
                <TextArea
                  register={register}
                  errors={errors}
                  label="Description"
                  name="description"
                  isRequired={true}
                />
              </div>
            </div>
            <div className="grid grid-cols-1   items-center justify-between w-full gap-3 mb-3">
              <ImageInput
                title="Category Image"
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                endpoint="categoryImage"
              />

              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-6 w-6" />
                  Please wait...
                </Button>
              ) : (
                <Button type="submit">
                  <CheckCircle2 className="mr-2 h-6 w-6" /> Save Category
                </Button>
              )}
            </div>
          </form>
        </Card>

      </DialogContent>
    </Dialog >
  );
}

export default NewCategoryForm