"use client"

import { notify } from "@/lib/notifications/notify"
import { signInWithCredentials } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getLocaleFromPathname, localizePath } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { DEFAULT_LOCALE } from "@/types/bilingual"
import type { LoginProps } from "@/types/types"
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Key, Loader2, Lock, Mail, User } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isEmailValid, setIsEmailValid] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<LoginProps>()

  const params = useSearchParams()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE
  const localizedHref = (href: string) => localizePath(href, locale)
  const requestedReturnUrl = params.get("returnUrl") || params.get("callbackUrl")
  const returnUrl =
    requestedReturnUrl?.startsWith("/") && !requestedReturnUrl.startsWith("//")
      ? localizedHref(requestedReturnUrl)
      : localizedHref("/dashboard")
  const router = useRouter()
  const emailValue = watch("email")

  useEffect(() => {
    if (emailValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      setIsEmailValid(emailRegex.test(emailValue))
    }
  }, [emailValue])

  const onSubmit = async (data: LoginProps) => {
    try {
      setLoading(true)
      setLoginAttempts((prev) => prev + 1)

      // Add security delay for multiple attempts
      if (loginAttempts > 2) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      const result = await signInWithCredentials(data)

      if (result.error) {
        setLoading(false)
        notify({
          variant: "destructive",
          title: "Authentication Failed",
          description: result.error,
        })
      } else if (result.success) {
        notify({
          title: "Login Successful",
          description: result.message,
        })
        reset()
        setLoading(false)
        router.push(returnUrl)
      }
    } catch (error) {
      setLoading(false)
      notify({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to connect to authentication service. Please try again.",
      })
    }
  }

  return (
    <TooltipProvider>
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 rounded-2xl shadow-xl border border-emerald-200/60 dark:border-slate-600/60 backdrop-blur-sm mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Sign In
            </h1>
            <p className="text-muted-foreground text-lg mt-1">Access your StockFlow dashboard</p>
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

      {/* Login Form Card */}
      <Card className="shadow-2xl border-white/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-3xl transition-all duration-300">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2">
            <Key className="h-5 w-5 text-emerald-600" />
            Account Login
          </CardTitle>
          <CardDescription>Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
                {isEmailValid && <CheckCircle className="h-4 w-4 text-green-500" />}
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  className={cn(
                    "pl-10 h-12 transition-all duration-200",
                    "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                    errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                    isEmailValid && "border-green-500 focus:border-green-500 focus:ring-green-500/20",
                  )}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={cn(
                    "pl-10 pr-10 h-12 transition-all duration-200",
                    "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                    errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                  )}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href={localizedHref("/forgot-password")}
                className="text-sm text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600",
                "hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700",
                "shadow-lg hover:shadow-xl transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Sign In
                </div>
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-gray-600">
                Do not have an account?{" "}
                <Link
                  href={localizedHref("/register")}
                  className="text-emerald-600 hover:text-emerald-500 font-semibold transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
