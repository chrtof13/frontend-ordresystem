"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Legg til flere ruter her som IKKE skal ha sidebar
  const hideSidebar =
    pathname === "/login" ||
    pathname === "/" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/demo") ||
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
    <div className="ob-app">
      <a className="ob-skip-link" href="#arbeidsflate">Hopp til innhold</a>
      <Sidebar />
      <div className="ob-workspace"><Suspense fallback={<div className="ob-header" />}><AppHeader /></Suspense><div id="arbeidsflate" tabIndex={-1}>{children}</div></div>
    </div>
  );
}
