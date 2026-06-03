"use client"

import { Button } from "@/components/ui/button"
import { getLocaleFromPathname, localizePath } from "@/i18n/routing"
import { DEFAULT_LOCALE } from "@/types/bilingual"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  Default: "An error occurred during authentication.",
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE
  const localizedHref = (href: string) => localizePath(href, locale)
  const error = searchParams.get("error") as keyof typeof errorMessages

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Authentication Error</CardTitle>
          <CardDescription className="text-center">
            {errorMessages[error] || errorMessages.Default}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" asChild>
            <a href={localizedHref("/login")}>Try again</a>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <a href={localizedHref("/")}>Go home</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
