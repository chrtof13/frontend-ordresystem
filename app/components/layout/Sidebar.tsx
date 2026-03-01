"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isOwner, logout, isAdmin } from "../../lib/client"; // juster path om nødvendig

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/jobs/newJob", label: "Nytt Oppdrag" },
  { href: "/jobs", label: "Oppdrag" },
  { href: "/stats", label: "Statistikk" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [owner, setOwner] = useState(false);
  const admin = isAdmin();

  useEffect(() => {
    setOwner(isOwner());
  }, []);

  return (
    <aside className="hidden md:flex md:sticky md:top-0 h-screen md:w-64 lg:w-80 shrink-0 flex-col border-r border-slate-200 bg-gradient-to-br from-[#123250] to-[#2c76b7] text-white">
      {/* Top / Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <Image
          src="/logoV2.png"
          alt="Ordrebase logo"
          width={44}
          height={44}
          priority
        />
        <h4 className="text-xl font-semibold">Ordrebase</h4>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {nav.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                    "transition hover:bg-white/10 hover:text-white",
                    isActive ? "bg-white/10 text-white" : "text-white/80",
                  ].join(" ")}
                >
                  <span className="h-2 w-2 rounded-full bg-white/40" />
                  {item.label}
                </Link>
              </li>
            );
          })}

          {admin && (
            <li>
              <Link
                href="/admin/users"
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                  "transition hover:bg-white/10 hover:text-white",
                  pathname === "/admin/users"
                    ? "bg-white/10 text-white"
                    : "text-white/80",
                ].join(" ")}
              >
                <span className="h-2 w-2 rounded-full bg-white/40" />
                Admin
              </Link>
            </li>
          )}

          {owner && (
            <li>
              <Link
                href="/owner"
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                  "transition hover:bg-white/10 hover:text-white",
                  pathname === "/owner"
                    ? "bg-white/10 text-white"
                    : "text-white/80",
                ].join(" ")}
              >
                <span className="h-2 w-2 rounded-full bg-white/40" />
                Owner Panel
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Bottom / Logout */}
      <div className="mt-auto px-3 pb-4">
        <button
          type="button"
          onClick={() => logout(router)}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white text-left"
        >
          <span className="h-2 w-2 rounded-full bg-white/40" />
          Logg ut
        </button>
      </div>
    </aside>
  );
}
