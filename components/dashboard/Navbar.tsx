"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import UserDropdownMenu from "@/components/UserDropdownMenu";
import { sidebarLinks } from "@/config/sidebar";
import { usePermission } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../global/Logo";

const OrganizationBanner = ({
  organizationName,
  organizationId,
  userRole
}: {
  organizationName: string,
  organizationId: string,
  userRole: string
}) => {
  return (
    <div className="hidden md:flex  items-center gap-4 text-sm text-muted-foreground">
      <div className="flex flex-col ">
        <div className=" gap-1 flex items-center ">
          <span className="font-medium text-foreground">{organizationName}</span>
          <div className="h-5 w-px bg-red-300"></div>

          <span className="text-sm py-0.5 rounded-full bg-muted">{userRole}</span></div>
        {/* <span   className="font-medium text-xs  py-0.5 rounded-full bg-muted">ID: {organizationId}</span> */}
      </div>
      {/* <div className="h-4 w-px bg-red-200"></div> */}

    </div>
  )
}


const Navbar = ({ session }: { session: Session }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission } = usePermission();
  const user = session?.user
  const userRole = session?.user?.roles[0].name
  console.log({ user })
  // Filter sidebar links based on user permissions
  const filteredLinks = sidebarLinks.filter((link) => {
    // Check main link permission
    if (!hasPermission(link.permission)) {
      return false;
    }

    // If it's a dropdown, check if user has permission for any dropdown item
    if (link.dropdown && link.dropdownMenu) {
      return link.dropdownMenu.some((item) => hasPermission(item.permission));
    }

    return true;
  });

  // Flatten dropdown menus for mobile view
  const mobileLinks = filteredLinks.reduce(
    (acc, link) => {
      // Add main link if it's not a dropdown
      if (!link.dropdown) {
        acc.push({
          title: link.title,
          href: link.href || "#",
          icon: link.icon,
          permission: link.permission,
        });
        return acc;
      }

      // Add dropdown items if user has permission
      if (link.dropdownMenu) {
        link.dropdownMenu.forEach((item) => {
          if (hasPermission(item.permission)) {
            acc.push({
              title: item.title,
              href: item.href,
              icon: link.icon,
              permission: item.permission,
            });
          }
        });
      }

      return acc;
    },
    [] as Array<{ title: string; href: string; icon: any; permission: string }>
  );

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-muted/60 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Logo href="/dashboard" />

            {/* Render mobile navigation links */}
            {mobileLinks.map((item, i) => {
              const Icon = item.icon;
              const isActive = item.href === pathname;

              return (
                <Link
                  key={i}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive ? "bg-muted text-primary" : ""
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
            <Button onClick={handleLogout} size="sm" className="w-full">
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <OrganizationBanner organizationName={session?.user?.organizationName ?? ""} organizationId={session.user?.organizationId} userRole={userRole} />
      <div className="w-full flex-1"></div>
      <div className="p-4 ">
        <UserDropdownMenu
          username={session?.user?.name ?? ""}
          email={session?.user?.email ?? ""}
          avatarUrl={
            session?.user?.image ??
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(54)-NX3G1KANQ2p4Gupgnvn94OQKsGYzyU.png"
          }
        />
      </div>
    </header>
  );
}
export default Navbar