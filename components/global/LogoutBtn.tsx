"use client";
import { getLocaleFromPathname, localizePath } from "@/i18n/routing";
import { signOut } from "@/lib/auth-client";
import { DEFAULT_LOCALE } from "@/types/bilingual";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function LogoutBtn() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE;
  const localizedHref = (href: string) => localizePath(href, locale);
  async function handleLogout() {
    try {
      await signOut({
        redirectTo: localizedHref("/login"),
        redirect: true
      });
    } catch (error) {
      console.log(error);
      // Fallback: redirect manually if server action fails
      router.push(localizedHref("/login"));
    }
  }
  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
