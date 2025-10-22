"use client";

import { registerUser } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RegisterUserProps } from "@/types/types";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Award,
  Building2,
  CheckCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Heart,
  Loader2,
  Lock,
  Mail,
  Phone,
  Rocket,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Logo from "../global/Logo";
import { useNotifications } from "../notifications/NotificationProvider";

// Form steps definition with emerald/teal color scheme
const FORM_STEPS = [
  {
    id: 'personal',
    title: 'Personal Info',
    icon: User,
    description: 'Your basic information',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    bgGradient: 'from-emerald-50 via-teal-50 to-cyan-50'
  },
  {
    id: 'company',
    title: 'Company',
    icon: Building2,
    description: 'Business details',
    gradient: 'from-teal-500 via-emerald-500 to-green-600',
    bgGradient: 'from-teal-50 via-emerald-50 to-green-50'
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    description: 'Password & terms',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    bgGradient: 'from-emerald-50 via-teal-50 to-cyan-50'
  },
] as const;

type FormStep = typeof FORM_STEPS[number]['id'];

// Company size options with emerald/teal styling
const companySizes = [
  { value: "1-10", label: "1-10 employees", icon: User, color: "text-emerald-600", bg: "bg-emerald-100" },
  { value: "11-50", label: "11-50 employees", icon: Users, color: "text-teal-600", bg: "bg-teal-100" },
  { value: "51-200", label: "51-200 employees", icon: Building2, color: "text-cyan-600", bg: "bg-cyan-100" },
  { value: "201+", label: "201+ employees", icon: Globe, color: "text-green-600", bg: "bg-green-100" },
];

// Floating animations keyframes
const FloatingElement = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <div
    className={cn("animate-pulse", className)}
    style={{
      animationDelay: `${delay}s`,
      animationDuration: '4s',
      animationIterationCount: 'infinite',
      animationDirection: 'alternate'
    }}
  >
    {children}
  </div>
);

export default function BeautifulRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    trigger,
    getValues,
    control,
  } = useForm<RegisterUserProps>();

  const router = useRouter();
  const { formError, formSuccess, info, warning } = useNotifications();

  // Watch password for confirmation matching
  const password = watch("password");

  // Calculate progress with smooth animations
  const calculateProgress = useCallback(() => {
    let progress = 0;
    const stepProgress = 100 / FORM_STEPS.length;

    FORM_STEPS.forEach((step) => {
      if (completedSteps.has(step.id)) {
        progress += stepProgress;
      }
    });

    // Add partial progress for current step
    if (currentStep && !completedSteps.has(currentStep)) {
      progress += stepProgress * 0.3;
    }

    return Math.min(progress, 100);
  }, [completedSteps, currentStep]);

  // Validate current step with enhanced feedback
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
      setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
      formSuccess("Step Completed! ✨", `${FORM_STEPS.find(s => s.id === currentStep)?.title} completed successfully!`);
    }

    return isValid;
  }, [currentStep, trigger, completedSteps, formSuccess]);

  // Enhanced navigation with animations
  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      warning("Complete This Step", "Please fill in all required fields to continue.");
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      const currentIndex = FORM_STEPS.findIndex(step => step.id === currentStep);
      if (currentIndex < FORM_STEPS.length - 1) {
        setCurrentStep(FORM_STEPS[currentIndex + 1].id);
      }
      setIsAnimating(false);
    }, 300);
  }, [currentStep, validateCurrentStep, warning]);

  const handlePrevious = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      const currentIndex = FORM_STEPS.findIndex(step => step.id === currentStep);
      if (currentIndex > 0) {
        setCurrentStep(FORM_STEPS[currentIndex - 1].id);
      }
      setIsAnimating(false);
    }, 300);
  }, [currentStep]);

  const handleStepClick = useCallback(async (stepId: FormStep) => {
    if (stepId === currentStep) return;

    const currentIndex = FORM_STEPS.findIndex(step => step.id === currentStep);
    const targetIndex = FORM_STEPS.findIndex(step => step.id === stepId);

    if (targetIndex < currentIndex || completedSteps.has(stepId)) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(stepId);
        setIsAnimating(false);
      }, 300);
    } else {
      const isValid = await validateCurrentStep();
      if (isValid) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep(stepId);
          setIsAnimating(false);
        }, 300);
      } else {
        warning("Complete Current Step", "Please complete the current step before moving forward.");
      }
    }
  }, [currentStep, completedSteps, validateCurrentStep, warning]);

  const progress = calculateProgress();
  const currentStepData = FORM_STEPS.find(s => s.id === currentStep);

  const onSubmit = async (data: RegisterUserProps) => {
    try {
      setLoading(true);

      // Use custom auth action
      const result = await registerUser(data);

      setLoading(false);

      if (result.error) {
        formError(
          "Registration Failed",
          result.error,
          "Please check your information and try again."
        );
      } else if (result.success) {
        formSuccess(
          "Account Created! 🎉",
          result.message || "Please check your email to verify your account before signing in."
        );
        reset();

        // Redirect to login with success message
        router.push(`/login?registered=true&email=${encodeURIComponent(data.email)}`);
      }

    } catch (error: any) {
      setLoading(false);
      console.error("Registration error:", error);

      // Handle specific error types
      if (error.message?.includes("email")) {
        formError("Registration Failed", "This email is already registered.", "Please use a different email or try logging in");
      } else if (error.message?.includes("rate limit")) {
        formError("Too Many Attempts", "Please wait a moment before trying again.", "Rate limit exceeded");
      } else {
        formError("Network Error", "Unable to create account. Please try again.", "Registration failed");
      }
    }
  };

  return (
    <TooltipProvider>
      {/* Beautiful Animated Background */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingElement delay={0} className="absolute top-16 right-16">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-600/10 rounded-full blur-xl" />
          </FloatingElement>
          <FloatingElement delay={2} className="absolute bottom-24 left-12">
            <div className="w-28 h-28 bg-gradient-to-br from-teal-400/20 to-cyan-600/10 rounded-full blur-2xl" />
          </FloatingElement>
          <FloatingElement delay={4} className="absolute top-1/3 left-1/4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-600/10 rounded-full blur-lg" />
          </FloatingElement>
          <FloatingElement delay={1} className="absolute bottom-1/4 right-1/4">
            <div className="w-22 h-22 bg-gradient-to-br from-cyan-400/20 to-emerald-600/10 rounded-full blur-xl" />
          </FloatingElement>

          {/* Floating Icons */}
          <FloatingElement delay={0.5} className="absolute top-24 left-24">
            <Star className="w-4 h-4 text-emerald-400/30" />
          </FloatingElement>
          <FloatingElement delay={2.5} className="absolute bottom-32 right-32">
            <Sparkles className="w-5 h-5 text-teal-400/30" />
          </FloatingElement>
          <FloatingElement delay={1.5} className="absolute top-2/3 right-1/3">
            <Award className="w-4 h-4 text-emerald-400/30" />
          </FloatingElement>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Compact Header */}
          <div className="relative mb-4">
            <div className={cn(
              "backdrop-blur-xl border border-white/20 rounded-xl p-4 transition-all duration-500",
              `bg-gradient-to-r ${currentStepData?.bgGradient} dark:from-slate-800/80 dark:via-slate-700/80 dark:to-slate-800/80`,
              "shadow-lg hover:shadow-xl"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg shadow-md transition-all duration-500",
                    `bg-gradient-to-br ${currentStepData?.gradient}`,
                    "text-white"
                  )}>
                    {currentStepData && <currentStepData.icon className="h-6 w-6" />}
                  </div>
                  <div>
                    <h1 className={cn(
                      "text-3xl font-bold transition-all duration-500",
                      `bg-gradient-to-r ${currentStepData?.gradient} bg-clip-text text-transparent`
                    )}>
                      Join StockFlow
                    </h1>
                    <p className="text-muted-foreground text-base mt-1">
                      Create your account in {FORM_STEPS.length} simple steps
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 text-xs bg-white/80 backdrop-blur-sm">
                        <Activity className="h-3 w-3 text-emerald-500" />
                        {Math.round(progress)}% Complete
                      </Badge>
                      <Badge variant="secondary" className="px-2 py-1 text-xs font-medium bg-white/80 backdrop-blur-sm">
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
            </div>
          </div>

          {/* Compact Progress Section */}
          <div className="mb-6">
            <div className="relative mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Progress</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{Math.round(progress)}%</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-2 bg-slate-200 dark:bg-slate-700" />
                <div className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stunning Step Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      "group relative p-4 rounded-xl border-2 text-left transition-all duration-500 hover:scale-105",
                      "focus:outline-none focus:ring-4 focus:ring-emerald-500/20 backdrop-blur-sm",
                      "transform hover:-translate-y-1 hover:shadow-lg",
                      isActive && `border-transparent bg-gradient-to-br ${step.bgGradient} shadow-xl scale-105 -translate-y-1`,
                      isCompleted && !isActive && "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 dark:bg-emerald-950/50 shadow-md",
                      !isActive && !isCompleted && isAccessible && "border-slate-200 dark:border-slate-700 hover:border-emerald-300 bg-white/80 dark:bg-slate-800/80",
                      !isAccessible && !isCompleted && "border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed bg-white/50"
                    )}
                  >
                    {/* Background glow effect */}
                    {isActive && (
                      <div className={cn(
                        "absolute inset-0 rounded-2xl opacity-60 blur-xl transition-all duration-500",
                        `bg-gradient-to-br ${step.gradient}`
                      )} />
                    )}

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg shadow-md transition-all duration-500",
                          "group-hover:scale-110 group-hover:rotate-6",
                          isActive && `bg-gradient-to-br ${step.gradient} text-white shadow-lg`,
                          isCompleted && !isActive && "bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-md",
                          !isActive && !isCompleted && "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-emerald-100"
                        )}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 animate-pulse" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className={cn(
                            "font-bold text-base transition-all duration-300",
                            isActive && "text-slate-800 dark:text-white",
                            isCompleted && !isActive && "text-emerald-700 dark:text-emerald-300",
                            !isActive && !isCompleted && "text-slate-700 dark:text-slate-300 group-hover:text-emerald-700"
                          )}>
                            {step.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Step status indicator */}
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium transition-all duration-300",
                          isActive && "bg-white/20 text-slate-700",
                          isCompleted && !isActive && "bg-emerald-100 text-emerald-700",
                          !isActive && !isCompleted && isAccessible && "bg-slate-100 text-slate-600",
                          !isAccessible && "bg-slate-50 text-slate-400"
                        )}>
                          {isCompleted ? "✓ Completed" : isActive ? "In Progress" : isAccessible ? "Ready" : "Locked"}
                        </div>

                        {isActive && (
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Beautiful Form Section */}
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className={cn(
                "shadow-xl border-white/20 backdrop-blur-xl hover:shadow-2xl transition-all duration-500",
                `bg-gradient-to-br ${currentStepData?.bgGradient}/80 dark:bg-slate-800/80`,
                isAnimating && "scale-95 opacity-50"
              )}>
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Logo />
                      <div className="absolute -top-1 -right-1">
                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <CardTitle className="flex items-center justify-center gap-2 text-xl">
                    {currentStepData && <currentStepData.icon className="h-5 w-5 text-emerald-600" />}
                    {currentStepData?.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {currentStepData?.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information Step */}
                    {currentStep === 'personal' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-md">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Personal Information</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">Tell us about yourself</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* First Name */}
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="flex items-center gap-2 text-sm font-semibold">
                              <User className="h-4 w-4 text-emerald-600" />
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              type="text"
                              placeholder="John"
                              className="h-12 text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/80 backdrop-blur-sm"
                              {...register("firstName", {
                                required: "First name is required",
                                minLength: { value: 2, message: "First name must be at least 2 characters" }
                              })}
                            />
                            {errors.firstName && (
                              <p className="text-red-600 flex items-center gap-2 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.firstName.message}
                              </p>
                            )}
                          </div>

                          {/* Last Name */}
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="flex items-center gap-2 text-sm font-semibold">
                              <User className="h-4 w-4 text-emerald-600" />
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              type="text"
                              placeholder="Doe"
                              className="h-12 text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/80 backdrop-blur-sm"
                              {...register("lastName", {
                                required: "Last name is required",
                                minLength: { value: 2, message: "Last name must be at least 2 characters" }
                              })}
                            />
                            {errors.lastName && (
                              <p className="text-red-600 flex items-center gap-2 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold">
                            <Mail className="h-4 w-4 text-emerald-600" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@company.com"
                            className="h-12 text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/80 backdrop-blur-sm"
                            {...register("email", {
                              required: "Email is required",
                              pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Please enter a valid email address"
                              }
                            })}
                          />
                          {errors.email && (
                            <p className="text-red-600 flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              {errors.email.message}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold">
                            <Phone className="h-4 w-4 text-emerald-600" />
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="h-12 text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/80 backdrop-blur-sm"
                            {...register("phone", {
                              required: "Phone number is required"
                            })}
                          />
                          {errors.phone && (
                            <p className="text-red-600 flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              {errors.phone.message}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Company Information Step */}
                    {currentStep === 'company' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg shadow-md">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Company Information</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">Tell us about your business</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Company Name */}
                          <div className="space-y-2">
                            <Label htmlFor="companyName" className="flex items-center gap-2 text-sm font-semibold">
                              <Building2 className="h-4 w-4 text-teal-600" />
                              Company Name
                            </Label>
                            <Input
                              id="companyName"
                              type="text"
                              placeholder="Acme Corporation"
                              className="h-12 text-base focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 bg-white/80 backdrop-blur-sm"
                              {...register("companyName", {
                                required: "Company name is required"
                              })}
                            />
                            {errors.companyName && (
                              <p className="text-red-600 flex items-center gap-2 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.companyName.message}
                              </p>
                            )}
                          </div>

                          {/* Company Size */}
                          <div className="space-y-2">
                            <Label htmlFor="companySize" className="flex items-center gap-2 text-sm font-semibold">
                              <Users className="h-4 w-4 text-teal-600" />
                              Company Size
                            </Label>
                            <Controller
                              name="companySize"
                              control={control}
                              rules={{ required: "Please select company size" }}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-12 text-base bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Select company size" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {companySizes.map((size) => (
                                      <SelectItem key={size.value} value={size.value}>
                                        <div className="flex items-center gap-2 py-1">
                                          <div className={cn("p-1.5 rounded-md", size.bg)}>
                                            <size.icon className={cn("h-4 w-4", size.color)} />
                                          </div>
                                          <span className="text-base">{size.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.companySize && (
                              <p className="text-red-600 flex items-center gap-2 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.companySize.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Security Setup Step */}
                    {currentStep === 'security' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg shadow-md">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Security Setup</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">Create a secure password and accept terms</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Password */}
                          <div className="space-y-2">
                            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold">
                              <Lock className="h-4 w-4 text-emerald-600" />
                              Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a secure password"
                                className="h-12 text-base pr-10 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/80 backdrop-blur-sm"
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
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-emerald-100"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                            {errors.password && (
                              <p className="text-red-600 flex items-center gap-2 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.password.message}
                              </p>
                            )}
                          </div>

                          {/* Confirm Password */}
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold">
                              <Lock className="h-4 w-4 text-emerald-600" />
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                className="h-12 text-base pr-10 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/80 backdrop-blur-sm"
                                {...register("confirmPassword", {
                                  required: "Please confirm your password",
                                  validate: (value) => value === password || "Passwords do not match"
                                })}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-emerald-100"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                            {errors.confirmPassword && (
                              <p className="text-red-600 flex items-center gap-2 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {errors.confirmPassword.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="space-y-3 pt-4 border-t border-slate-200">
                          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                {...register("termsAccepted", {
                                  required: "You must accept the terms and conditions"
                                })}
                              />
                              <label htmlFor="terms" className="text-slate-700 leading-relaxed text-sm">
                                <span className="font-semibold">I agree to the </span>
                                <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
                                  Terms of Service
                                </Link>
                                <span className="font-semibold"> and </span>
                                <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
                                  Privacy Policy
                                </Link>
                                <div className="text-xs text-slate-600 mt-1">
                                  By creating an account, you agree to our terms and acknowledge that you've read our privacy policy.
                                </div>
                              </label>
                            </div>
                          </div>
                          {errors.termsAccepted && (
                            <p className="text-red-600 flex items-center gap-2 text-sm">
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

            {/* Beautiful Navigation Sidebar */}
            <div className="space-y-4">
              {/* Navigation Card */}
              <Card className="shadow-xl border-white/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl sticky top-20 hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="text-center">
                      <h4 className="font-bold text-base text-slate-800 dark:text-white mb-1">Navigation</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Use the buttons below to navigate</p>
                    </div>

                    <div className="flex gap-2">
                      {currentStep !== 'personal' && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          className="flex-1 h-10 border-2 hover:scale-105 transition-all duration-300"
                          disabled={isAnimating}
                        >
                          <ArrowLeft className="mr-1 h-3 w-3" />
                          Previous
                        </Button>
                      )}
                      {currentStep !== 'security' ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={isAnimating}
                          className="flex-1 h-10 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 hover:scale-105 transition-all duration-300 shadow-md"
                        >
                          Next
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={loading || isAnimating}
                          className="flex-1 h-10 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 hover:scale-105 transition-all duration-300 shadow-md"
                          onClick={handleSubmit(onSubmit)}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Rocket className="mr-1 h-3 w-3" />
                              Create Account
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="shadow-lg border-white/20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:bg-slate-800/80 backdrop-blur-xl">
                <CardContent className="p-4 text-center">
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-800 dark:text-white">Join 10,000+ Users</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Growing every day</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/50">
                      <div>
                        <div className="text-xl font-bold text-emerald-600">99.9%</div>
                        <div className="text-xs text-slate-600">Uptime</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-teal-600">24/7</div>
                        <div className="text-xs text-slate-600">Support</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sign In Link */}
              <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                <p className="text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 text-sm">
                  <Heart className="h-3 w-3 text-red-500" />
                  Already have an account?
                </p>
                <Link
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-bold text-base transition-colors hover:underline"
                >
                  Sign In Here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}