"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sendVerificationEmail, verifyEmail } from "@/lib/auth-client"
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const email = searchParams.get("email")
  const token = searchParams.get("token")

  // Auto-verify if token is in URL
  useEffect(() => {
    if (token) {
      handleVerification(token)
    }
  }, [token])

  const handleVerification = async (verificationToken: string) => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const result = await verifyEmail({
        query: { token: verificationToken }
      })

      if (result.error) {
        setError(result.error.message || "Verification failed")
      } else {
        setSuccess(true)
        setMessage("Email verified successfully! You can now sign in to your account.")

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError("Email address not found")
      return
    }

    setResendLoading(true)
    setError("")
    setMessage("")

    try {
      const result = await sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/verify-email`
      })

      if (result.error) {
        setError(result.error.message || "Failed to send verification email")
      } else {
        setMessage("Verification email sent! Please check your inbox.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification email")
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-emerald-600">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You will be redirected to the login page shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            {email ? (
              <>We sent a verification email to <strong>{email}</strong></>
            ) : (
              "Please check your email for a verification link"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Verifying...</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-sm text-gray-600 text-center">
              Didn't receive the email? Check your spam folder or request a new one.
            </div>

            {email && (
              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            )}

            <div className="flex items-center justify-center">
              <Link
                href="/login"
                className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}