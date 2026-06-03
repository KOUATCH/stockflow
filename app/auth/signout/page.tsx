import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRequestLocale } from "@/i18n/server-routing"
import { localizePath } from "@/i18n/routing"

export default async function SignOutPage() {
  const locale = await getRequestLocale()
  const loginHref = localizePath("/login", locale)
  const dashboardHref = localizePath("/dashboard", locale)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign out</CardTitle>
          <CardDescription className="text-center">
            Are you sure you want to sign out of StockFlow?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: loginHref })
            }}
            className="space-y-4"
          >
            <Button type="submit" className="w-full" variant="destructive">
              Sign out
            </Button>
          </form>

          <Button variant="outline" className="w-full" asChild>
            <a href={dashboardHref}>Cancel</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
