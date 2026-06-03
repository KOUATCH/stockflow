"use client";
import createUser from "@/actions/users/createUser";
import countries from "@/contries";
import { getLocaleFromPathname, localizePath } from "@/i18n/routing";
import { generateSlug } from "@/lib/generateSlug";
import { DEFAULT_LOCALE } from "@/types/bilingual";
import { UserProps, OrgDataProps } from "@/types/types";
import { Headset, Loader2, Lock, Mail, User, WarehouseIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNotifications } from "../notifications/NotificationProvider";
import FormSelectInput from "../FormInputs/FormSelectInput";
import PasswordInput from "../FormInputs/PasswordInput";
import SubmitButton from "../FormInputs/SubmitButton";
import TextInput from "../FormInputs/TextInput";
import CustomCarousel from "../frontend/custom-carousel";
import Logo from "../global/Logo";
export default function RegisterForm() {
  const initialCountryCode = "CM";
  const initialCountry = countries.find((item) => item.code === initialCountryCode);
  const [selectedCountry, setSelectedCountry] = useState<any>(initialCountry);

  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<UserProps>();
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE;
  const localizedHref = (href: string) => localizePath(href, locale);
  const { formError, formSuccess } = useNotifications();

  async function onSubmit(data: UserProps) {
    setLoading(true);
    data.name = `${data.firstName} ${data.lastName}`;
    data.image =
      "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png";
    const orgData: OrgDataProps = {
      name: data.organizationName,
      slug: generateSlug(data.organizationName),
      email: data.email,
      phone: data.phone,
    }
    try {
      const res = await createUser(data, orgData);
      console.log({ res })
      if (res.status === 409) {
        const errorMessage = res.error ?? "Email address is already in use";
        setLoading(false);
        setEmailErr(errorMessage);
        formError("Registration", errorMessage, "Email address is already in use");
      } else if (res.status === 200) {
        setLoading(false);
        formSuccess("Registration", "Your account has been created pending verification");
        router.push(localizedHref(`/verify/${res?.data?.id}?email=${res?.data?.email}`));

      } else {
        setLoading(false);
        formError("Registration", "Error during Account creation, Please try again", "Something went wrong during registration");
      }
    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
      formError("Registration", "It seems something is wrong, try again", "Network connection error occurred");
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
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground text-sm">
              Create your <span className="text-blue-600">Personal account</span>{" "}
              today to get started
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
                <div className="">
                  <FormSelectInput
                    label="country"
                    options={countries}
                    option={selectedCountry}
                    setOption={setSelectedCountry}
                  />

                </div>
              </div>

              <PasswordInput
                register={register}
                errors={errors}
                label="Password"
                name="password"
                icon={Lock}
                placeholder="password"
                type="password"
              />
              <div className="">
                {emailErr && (
                  <p className="text-red-500 text-xs mt-2">{emailErr}</p>
                )}
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

            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Button
                onClick={() => signIn("google")}
                variant={"outline"}
                className="w-full"
              >
                <FaGoogle className="mr-2 w-6 h-6 text-red-500" />
                Login with Google
              </Button>
              <Button
                onClick={() => signIn("github")}
                variant={"outline"}
                className="w-full"
              >
                <FaGithub className="mr-2 w-6 h-6 text-slate-900 dark:text-white" />
                Login with Github
              </Button>
            </div> */}
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
      <div className="hidden bg-muted lg:block relative">
        <CustomCarousel />
      </div>
    </div>
  );
}
