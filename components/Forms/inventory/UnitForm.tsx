"use client";

import { notify } from "@/lib/notifications/notify"
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

import createUnits from "@/actions/units/createActionUnit";
import updateUnitById from "@/actions/units/updateUnitById";
import TextArea from "@/components/FormInputs/TextAreaInput";
import TextInput from "@/components/FormInputs/TextInput";
import FormFooter from "@/components/Forms/FormFooter";
import FormHeader from "@/components/Forms/FormHeader";
import { UnitProps } from "@/types/types";
import { Unit } from "@prisma/client";
export type SelectOptionProps = {
  label: string;
  value: string;
};
type UnitsFormProps = {
  editingId?: string | undefined;
  initialData?: Unit | undefined | null;
  organizationId: string;
  organizationName: string;
};
const UnitForm = ({
  editingId,
  initialData,
  organizationId,
}: UnitsFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitProps>({
    defaultValues: {
      nameEn: initialData?.nameEn || "",
      nameFr: initialData?.nameFr || "",
      symbol: initialData?.symbol || "",
      organizationId: initialData?.organizationId || organizationId,
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function saveUnits(data: UnitProps) {
    try {
      setLoading(true);

      if (editingId) {
        await updateUnitById(editingId, data);
        setLoading(false);
        notify.success("Updated Successfully!", { description: " Unit Updated successfully" });
        window.location.reload();
        reset()
      } else {
        await createUnits(data);
        setLoading(false);
        // Toast
        notify.success("Successfully Created!", { description: " Unit Created successfully" });
        window.location.reload();
        reset()
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(saveUnits)}>
      <FormHeader
        href="/Units"
        parent=""
        title="Units"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Create unit</CardTitle>
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
                    label="English Unit Name"
                    name="nameEn"
                  />
                </div>
                <div className="grid gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="French Unit Name"
                    name="nameFr"
                  />
                </div>
                <div className="grid gap-3">
                  <TextArea
                    register={register}
                    errors={errors}
                    label="Symbol"
                    name="symbol"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
      <FormFooter
        href="/dashboard/inventory/Units"
        editingId={editingId}
        loading={loading}
        title="Units"
        parent=""
      />
    </form>
  );
}
export default UnitForm
