"use client";

import { notify } from "@/lib/notifications/notify"
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextInput from "@/components/FormInputs/TextInput";
import Logo from "@/components/global/Logo";
import { ItemCreateDTO } from "@/types/item";
import { getLocaleFromPathname, localizePath } from "@/i18n/routing";
import { DEFAULT_LOCALE } from "@/types/bilingual";
import { Headset, Loader2, Mail, User, WarehouseIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
const ItemFormModal = (orgId: string) => {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE;
  const localizedHref = (href: string) => localizePath(href, locale);


  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<ItemCreateDTO>();

  async function onSubmit(data: ItemCreateDTO) {
    setLoading(true);

    try {
      const res = await createOrgItem(data);
      console.log({ res })
      if (res.status === 200) {
        setLoading(false);
        notify.success("Item Created successfully", { description: "Your item has been created." });
        reset();
      } else {
        setLoading(false);
        notify.error("Something went wrong", { description: "Error during Account creation, Please try again" });
      }
    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
      notify.error("Its seems something is wrong, try again");
    }
  }
  return (
    <div className="w-full lg:grid h-screen lg:min-h-[600px] lg:grid-cols-2 relative ">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid  gap-6 mt-10 md:mt-0">
          <div className="absolute left-1/3 top-14 md:top-5 md:left-5">
            <Logo />
          </div>
          <div className="grid gap-2 text-center mt-10 md:mt-0">
            <h1 className="text-3xl font-bold">Create a Product</h1>
            <p className="text-muted-foreground text-sm">
              Create  Item
            </p>
          </div>
          <div className="">
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="First Name"
                  name="firstName"
                  icon={User}
                  placeholder="first Name"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Last Name"
                  name="lastName"
                  icon={User}
                  placeholder="last Name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Phone"
                  name="phone"
                  icon={Headset}
                  placeholder="phone"
                />
                <div className="">
                  <TextInput
                    type="email"
                    register={register}
                    errors={errors}
                    label="Email Address"
                    name="email"
                    icon={Mail}
                    placeholder="email"
                    isRequired={false}
                  />
                </div>
                <div className="">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Company"
                    name="organizationName"
                    icon={WarehouseIcon}
                    placeholder="Company name"
                  // isRequired={false}
                  />
                </div>

              </div>

              <div>
                <SubmitButton
                  title="Sign Up"
                  loadingTitle="Creating Please wait.."
                  loading={loading}
                  className="w-full"
                  loaderIcon={Loader2}
                  showIcon={false}
                />
              </div>
            </form>
            <div className="flex items-center py-4 justify-center space-x-1 text-slate-900">
              <div className="h-[1px] w-full bg-slate-200"></div>
              <div className="uppercase">Or</div>
              <div className="h-[1px] w-full bg-slate-200"></div>
            </div>


            <p className="mt-6 text-sm text-gray-500">
              Already Registered ?{" "}
              <Link
                href={localizedHref("/login")}
                className="font-semibold leading-6 text-rose-600 hover:text-rose-500"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* <FormFooter
        href="/dashboard/inventory/Items"
        editingId={undefined}
        loading={loading}
        title="Items"
        parent=""
      /> */}
    </div>
  );
}
export default ItemFormModal
