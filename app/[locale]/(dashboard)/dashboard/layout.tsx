import { auth } from "@/auth";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import { localizePath, pickLocale } from "@/i18n/routing";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

/**
 * Dashboard chrome layout.
 *
 * Server component that fetches the auth session and renders the
 * shared Navbar (which contains the LocaleSwitcher, NotificationCenter,
 * UserDropdownMenu, and the mobile navigation Sheet). All dashboard
 * pages render inside this layout.
 *
 * Without this file, dashboard pages render with no chrome at all —
 * which is why the LocaleSwitcher wasn't visible before.
 */
export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = pickLocale(rawLocale)
  const session = await auth()
  if (!session?.user) {
    redirect(localizePath("/login", locale))
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Sidebar session={session} />
      <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden md:pl-[220px] lg:pl-[280px]">
        <Navbar session={session} />
        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
