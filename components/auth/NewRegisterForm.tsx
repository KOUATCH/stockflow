"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getLocaleFromPathname, localizePath } from "@/i18n/routing";
import { DEFAULT_LOCALE } from "@/types/bilingual";
import { RegisterUserProps } from "@/types/types";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Lock,
  Mail,
  Plus,
  User,
  Users,
  Globe,
  Phone,
  MapPin,
  Shield,
  Activity
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import Logo from "../global/Logo";
import { useNotifications } from "../notifications/NotificationProvider";

// Form steps definition
const FORM_STEPS = [
  { id: 'personal', title: 'Personal Info', icon: User, description: 'Your basic information' },
  { id: 'company', title: 'Company', icon: Building2, description: 'Company details' },
  { id: 'security', title: 'Security', icon: Lock, description: 'Password setup' },
] as const;

type FormStep = typeof FORM_STEPS[number]['id'];

// Company size options
const companySizes = [
  { value: "1-10", label: "1-10 employees", icon: User },
  { value: "11-50", label: "11-50 employees", icon: Users },
  { value: "51-200", label: "51-200 employees", icon: Building2 },
  { value: "201+", label: "201+ employees", icon: Globe },
];

export default function NewRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set());

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    trigger,
    getValues,
  } = useForm<RegisterUserProps>();

  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE;
  const localizedHref = (href: string) => localizePath(href, locale);
  const { formError, formSuccess, info, warning } = useNotifications();

  // Watch password for confirmation matching
  const password = watch("password");

  // Calculate progress based on completed steps
  const calculateProgress = useCallback(() => {
    let progress = 0;
    const stepProgress = 100 / FORM_STEPS.length;

    FORM_STEPS.forEach((step) => {
      if (completedSteps.has(step.id)) {
        progress += stepProgress;
      }
    });

    return Math.min(progress, 100);
  }, [completedSteps]);

  // Validate current step
  const validateCurrentStep = useCallback(async () => {
    let fieldsToValidate: (keyof RegisterUserProps)[] = [];
    let isValid = false;

    switch (currentStep) {
      case 'personal':
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];
        break;
      case 'company':
        fieldsToValidate = ['companyName', 'companySize'];
        break;
      case 'security':
        fieldsToValidate = ['password', 'confirmPassword', 'termsAccepted'];
        break;
    }

    isValid = await trigger(fieldsToValidate);

    if (isValid && !completedSteps.has(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      formSuccess("Step Completed", `${FORM_STEPS.find(s => s.id === currentStep)?.title} completed successfully!`);
    }

    return isValid;
  }, [currentStep, trigger, completedSteps, formSuccess]);

  // Navigation handlers
  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      warning("Incomplete Step", "Please complete all required fields before proceeding.");
      return;
    }

    const currentIndex = FORM_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < FORM_STEPS.length - 1) {
      setCurrentStep(FORM_STEPS[currentIndex + 1].id);
    }
  }, [currentStep, validateCurrentStep, warning]);

  const handlePrevious = useCallback(() => {
    const currentIndex = FORM_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(FORM_STEPS[currentIndex - 1].id);
    }
  }, [currentStep]);

  const handleStepClick = useCallback(async (stepId: FormStep) => {
    if (stepId === currentStep) return;

    const currentIndex = FORM_STEPS.findIndex(step => step.id === currentStep);
    const targetIndex = FORM_STEPS.findIndex(step => step.id === stepId);

    if (targetIndex < currentIndex || completedSteps.has(stepId)) {
      setCurrentStep(stepId);
    } else {
      const isValid = await validateCurrentStep();
      if (isValid) {
        setCurrentStep(stepId);
      } else {
        warning("Complete Current Step", "Please complete the current step before jumping ahead.");
      }
    }
  }, [currentStep, completedSteps, validateCurrentStep, warning]);

  const progress = calculateProgress();

  const onSubmit = async (data: RegisterUserProps) => {
    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setLoading(false);
        formSuccess("Account Created", "Welcome to StockFlow! Please check your email to verify your account.");
        reset();
        router.push(localizedHref("/verify-email"));
      } else {
        setLoading(false);
        const errorData = await response.json();
        formError("Registration Failed", errorData.message || "Unable to create account.", "Please try again");
      }
    } catch (error) {
      setLoading(false);
      formError("Network Error", "Unable to create account. Please check your connection.", "Registration failed");
    }
  };

  return (
    <TooltipProvider>
      {/* Enhanced Header matching PO style */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 rounded-2xl shadow-xl border border-emerald-200/60 dark:border-slate-600/60 backdrop-blur-sm mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
            <Plus className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
              Create Account
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Join thousands of businesses using StockFlow
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm">
                <Activity className="h-4 w-4 text-emerald-500" />
                {Math.round(progress)}% Complete
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 font-medium bg-white/80 backdrop-blur-sm">
                Step {FORM_STEPS.findIndex(s => s.id === currentStep) + 1} of {FORM_STEPS.length}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Progress and Steps */}
      <div className="mb-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Progress</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FORM_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.has(step.id);
            const isAccessible = index === 0 || completedSteps.has(FORM_STEPS[index - 1].id);

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={!isAccessible && !isCompleted}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 backdrop-blur-sm",
                  isActive && "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:bg-emerald-950/50 shadow-lg transform scale-105",
                  isCompleted && !isActive && "border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 dark:bg-emerald-950/50 shadow-md",
                  !isActive && !isCompleted && isAccessible && "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 bg-white/80 dark:bg-slate-800/80",
                  !isAccessible && !isCompleted && "border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed bg-white/50 dark:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg shadow-sm",
                    isActive && "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
                    isCompleted && !isActive && "bg-gradient-to-br from-emerald-500 to-green-500 text-white",
                    !isActive && !isCompleted && "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-semibold text-sm",
                      isActive && "text-emerald-700 dark:text-emerald-300",
                      isCompleted && !isActive && "text-emerald-700 dark:text-emerald-300",
                      !isActive && !isCompleted && "text-slate-700 dark:text-slate-300"
                    )}>
                      {step.title}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{step.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Registration Form Card */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-2xl border-white/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Logo />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" />
                {FORM_STEPS.find(s => s.id === currentStep)?.title}
              </CardTitle>
              <CardDescription>
                {FORM_STEPS.find(s => s.id === currentStep)?.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step Content */}
                {currentStep === 'personal' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Personal Information</h3>
                        <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          className="h-12 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          {...register("firstName", {
                            required: "First name is required",
                            minLength: { value: 2, message: "First name must be at least 2 characters" }
                          })}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          className="h-12 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          {...register("lastName", {
                            required: "Last name is required",
                            minLength: { value: 2, message: "Last name must be at least 2 characters" }
                          })}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        className="h-12 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email address"
                          }
                        })}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="h-12 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        {...register("phone", {
                          required: "Phone number is required"
                        })}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 'company' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Company Information</h3>
                        <p className="text-sm text-muted-foreground">Tell us about your business</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Company Name */}
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Company Name
                        </Label>
                        <Input
                          id="companyName"
                          type="text"
                          placeholder="Acme Corporation"
                          className="h-12 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          {...register("companyName", {
                            required: "Company name is required"
                          })}
                        />
                        {errors.companyName && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.companyName.message}
                          </p>
                        )}
                      </div>

                      {/* Company Size */}
                      <div className="space-y-2">
                        <Label htmlFor="companySize" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Company Size
                        </Label>
                        <Select {...register("companySize", { required: "Please select company size" })}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            {companySizes.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                <div className="flex items-center gap-2">
                                  <size.icon className="h-4 w-4" />
                                  {size.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.companySize && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.companySize.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'security' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                        <Lock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Security Setup</h3>
                        <p className="text-sm text-muted-foreground">Create a secure password and accept terms</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a secure password"
                            className="h-12 pr-10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            {...register("password", {
                              required: "Password is required",
                              minLength: { value: 8, message: "Password must be at least 8 characters" },
                              pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                message: "Password must contain uppercase, lowercase, and numbers"
                              }
                            })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="h-12 pr-10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            {...register("confirmPassword", {
                              required: "Please confirm your password",
                              validate: (value) => value === password || "Passwords do not match"
                            })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="terms"
                          className="mt-1 rounded border-gray-300"
                          {...register("termsAccepted", {
                            required: "You must accept the terms and conditions"
                          })}
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                          I agree to the{" "}
                          <Link href={localizedHref("/terms")} className="text-emerald-600 hover:text-emerald-500">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href={localizedHref("/privacy")} className="text-emerald-600 hover:text-emerald-500">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                      {errors.termsAccepted && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.termsAccepted.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-2xl border-white/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl sticky top-24 hover:shadow-3xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex gap-3">
                {currentStep !== 'personal' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                {currentStep !== 'security' ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                    onClick={handleSubmit(onSubmit)}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href={localizedHref("/login")}
                className="text-emerald-600 hover:text-emerald-500 font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
