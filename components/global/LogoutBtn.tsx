"use client";
import { signOut } from "@/auth";
import { useRouter } from "next/navigation";
import React from "react";

export default function LogoutBtn() {
  const router = useRouter();
  async function handleLogout() {
    try {
      await signOut({
        redirectTo: "/login",
        redirect: true
      });
    } catch (error) {
      console.log(error);
      // Fallback: redirect manually if server action fails
      router.push("/login");
    }
  }
  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
