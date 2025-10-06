import Footer from "@/components/frontend/footer";
import SiteHeader from "@/components/frontend/site-header";
import { auth } from "@/lib/auth";
import { ReactNode } from "react";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then(m => m.headers())
  });
  return (
    <div className="bg-white">
      {/* <PromoBanner /> */}
      <SiteHeader session={session} />
      {children}
      <Footer />
    </div>
  );
}
