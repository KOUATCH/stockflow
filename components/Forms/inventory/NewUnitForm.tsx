"use client";
import createUnit from "@/actions/units/createUnit22";
import updateUnitById from "@/actions/units/updateUnitById";
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
import { UnitProps } from "@/types/types";
import { UpdateUnitPayload } from "@/types/unit";
import { Unit } from "@prisma/client";
import { CheckCircle2, LayoutGrid, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type UnitsFormProps = {
  editingId?: string | undefined;
  initialData?: Unit | undefined | null;
  organizationId: string;
};
const NewUnitForm = ({
  editingId,
  initialData,
  organizationId,
}: UnitsFormProps) => {

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<UnitProps>({
    defaultValues: {
      name: initialData?.name,
      symbol: initialData?.symbol || "",
    },
  });



  async function onSubmit(data: UnitProps) {

    setLoading(true);

    try {
      const unitPayload = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const res = await createUnit(unitPayload);
      console.log({ res })
      if (!res.success) {
        setLoading(false);
        toast.error(res.error, { description: "Unit not created" });
        setErr(res.error ?? "Something went wrong, Please try again")
        return;
      }
      setLoading(false);
      toast.success("Unit Created successfully", { description: "Unit created" });
      window.location.reload();
      reset()
    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
      toast.error("Its seems something is wrong, try again");
    }
  }


  async function saveUnits(data: UpdateUnitPayload) {
    try {
      setLoading(true);

      if (editingId) {
        await updateUnitById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!", { description: " Unit Updated successfully" });
        window.location.reload();
        reset()
      } else {
        await createUnit(data);
        setLoading(false);
        // Toast
        toast.success("Successfully Created!", { description: " Unit Created successfully" });
        window.location.reload();
        reset()
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create Unit
          </span>
          <span className="md:sr-only">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Unit creation</DialogTitle>
        </DialogHeader>
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Create New Unit</CardTitle>
          </CardHeader>
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col w-full gap-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Unit Name"
                  name="name"
                  placeholder="eg, Kilogram"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Symbol"
                  name="symbol"
                  placeholder="Symbol"
                />
              </div>
              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-6 w-6" />
                  Please wait...
                </Button>
              ) : (
                <Button type="submit">
                  <CheckCircle2 className="mr-2 h-7 w-7" /> Save Unit
                </Button>
              )}
            </div>
          </form>
        </Card>

      </DialogContent>
    </Dialog>
  );
}

export default NewUnitForm