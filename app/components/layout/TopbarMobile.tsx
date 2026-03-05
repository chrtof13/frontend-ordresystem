"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, User } from "lucide-react";
import { logout, isAdmin, isOwner } from "../../lib/client";

const baseNav = [
  { href: "/home", label: "Dashboard" },
  { href: "/jobs/newJob", label: "Nytt Oppdrag" },
  { href: "/jobs", label: "Oppdrag" },
  { href: "/stats", label: "Statistikk" },
  { href: "/settings", label: "Innstillinger" },
  { href: "/settings/company", label: "Firma" },
  { href: "/quotes", label: "Pristilbud" },
];

type Props = {
  showSearch?: boolean;
  initialQuery?: string;
};

export default function TopbarMobile({
  showSearch = true,
  initialQuery = "",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [owner, setOwner] = useState(false);

  const [query, setQuery] = useState(initialQuery);

  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAdmin(isAdmin());
    setOwner(isOwner());
  }, []);

  useEffect(() => {
    if (pathname?.startsWith("/jobs")) {
      setQuery(initialQuery ?? "");
      return;
    }
    setQuery("");
  }, [pathname, initialQuery]);

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
    ...(owner ? [{ href: "/owner", label: "Owner Panel" }] : []),
  ];

  function submitSearch() {
    const q = query.trim();
    if (!q) {
      router.push("/jobs");
      return;
    }
    router.push(`/jobs?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 border-b border-slate-200 bg-slate-50">
        {/* Rad 1 */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logoV2.png"
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
            {showSearch ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch();
                }}
                className="relative rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-12 w-full rounded-xl bg-transparent pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  placeholder="Søk oppdrag (tittel/beskrivelse)..."
                />
                <button
                  type="submit"
                  aria-label="Søk"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div className="h-12" />
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="shrink-0 inline-flex h-12 items-center gap-2 rounded-xl bg-[#2f5f8f] px-5 text-sm font-semibold text-white shadow-sm hover:brightness-110 active:brightness-95"
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
