"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, ChevronDown, User } from "lucide-react";
import { logout, isAdmin, isOwner } from "../../lib/client";

const baseNav = [
  { href: "/", label: "Dashboard" },
  { href: "/jobs/newJob", label: "Nytt Oppdrag" },
  { href: "/jobs", label: "Oppdrag" },
  { href: "/stats", label: "Statistikk" },
  { href: "/settings", label: "Innstillinger" },
];

export default function TopbarDesktop() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [owner, setOwner] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAdmin(isAdmin());
    setOwner(isOwner());
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      window.addEventListener("mousedown", onClickOutside);
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function onLogout() {
    setOpen(false);
    logout(router);
  }

  const nav = [
    ...baseNav,
    ...(admin ? [{ href: "/admin/users", label: "Admin" }] : []),
    ...(owner ? [{ href: "/owner", label: "Owner Panel" }] : []),
  ];

  return (
    <header className="hidden md:block sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        {/* Søk */}
        <div className="relative flex-1">
          <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-white/70 to-slate-100/60 shadow-sm">
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/40" />
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-12 w-full bg-transparent pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              placeholder="Søk oppdrag..."
            />
          </div>
        </div>

        {/* Menu + dropdown */}
        <div className="relative" ref={wrapRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="shrink-0 inline-flex h-12 items-center gap-2 rounded-xl bg-[#2f5f8f] px-5 text-sm font-semibold text-white shadow-sm hover:brightness-110 active:brightness-95"
          >
            Menu
            <Menu className="h-4 w-4" />
            <ChevronDown
              className={[
                "h-4 w-4 opacity-90 transition",
                open ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="p-2">
                {nav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={[
                        "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold",
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span>{item.label}</span>
                      <span
                        className={[
                          "h-2 w-2 rounded-full",
                          isActive ? "bg-[#2f5f8f]" : "bg-slate-300",
                        ].join(" ")}
                      />
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 p-2">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full rounded-xl bg-red-50 px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  Logg ut
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
          <User className="h-6 w-6 text-slate-500" />
        </div>
      </div>
    </header>
  );
}
