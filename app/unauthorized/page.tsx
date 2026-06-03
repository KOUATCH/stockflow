import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getRequestLocale } from '@/i18n/server-routing'
import { localizePath } from '@/i18n/routing'
import { ShieldAlert } from 'lucide-react'

export default async function UnauthorizedPage() {
  const locale = await getRequestLocale()
  const localizedHref = (href: string) => localizePath(href, locale)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-gray-500">
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href={localizedHref("/dashboard")}>
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={localizedHref("/login")}>
                Sign Out & Try Again
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
