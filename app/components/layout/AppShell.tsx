"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Legg til flere ruter her som IKKE skal ha sidebar
  const hideSidebar =
    pathname === "/login" ||
    pathname === "/" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/test") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/kom-i-gang") ||
    pathname.startsWith("/offer");

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
