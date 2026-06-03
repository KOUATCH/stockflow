import { checkPermission } from "@/config/useAuth";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  await checkPermission("units.read");
  return <div>{children}</div>;
}
