"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, User } from "lucide-react";
import { logout, isAdmin, isOwner } from "../../lib/client";

const baseNav = [
  { href: "/", label: "Dashboard" },
  { href: "/jobs/newJob", label: "Nytt Oppdrag" },
  { href: "/jobs", label: "Oppdrag" },
  { href: "/stats", label: "Statistikk" },
];

export default function TopbarMobile() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [owner, setOwner] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAdmin(isAdmin());
    setOwner(isOwner());
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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
    <>
      <header className="md:hidden sticky top-0 z-40 border-b border-slate-200 bg-slate-50">
        {/* Rad 1 */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Ordrebase"
              width={48}
              height={48}
              priority
            />
            <span className="text-2xl font-semibold tracking-tight text-slate-900">
              Ordrebase
            </span>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
            <User className="h-6 w-6 text-slate-500" />
          </div>
        </div>

        {/* Rad 2 */}
        <div className="flex items-center gap-3 px-4 pb-4 pt-4">
          <div className="relative flex-1">
            <div className="relative rounded-lg border border-slate-200 bg-white shadow-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-12 w-full rounded-lg bg-transparent pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                placeholder="Søk oppdrag..."
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="shrink-0 inline-flex h-12 items-center gap-2 rounded-lg bg-[#2f5f8f] px-5 text-sm font-semibold text-white shadow-sm hover:brightness-110 active:brightness-95"
          >
            Menu
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            aria-label="Lukk meny"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div
            ref={panelRef}
            className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl border-l border-slate-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
              <div className="font-semibold text-slate-900">Meny</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100"
                aria-label="Lukk"
              >
                <X className="h-5 w-5 text-slate-700" />
              </button>
            </div>

            <nav className="p-3">
              <ul className="space-y-1">
                {nav.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={[
                          "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold",
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
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full rounded-xl bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  Logg ut
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
