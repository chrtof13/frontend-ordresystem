"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Menu, X, CircleHelp } from "lucide-react";
import Navigation, { Brand } from "./Navigation";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  function close() { dialog.current?.close(); }
  useEffect(() => {
    dialog.current?.close();
    if (input.current) input.current.value = query;
  }, [pathname, query]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onResize = () => { if (media.matches) dialog.current?.close(); };
    media.addEventListener("change", onResize);
    return () => media.removeEventListener("change", onResize);
  }, []);
  return <>
    <header className="ob-header">
      <div className="ob-mobile-brand"><Brand /></div>
      <form className="ob-search" role="search" onSubmit={e => { e.preventDefault(); const q = input.current?.value.trim(); router.push(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs"); }}>
        <Search size={19} aria-hidden="true" /><input ref={input} name="q" aria-label="Søk etter oppdrag eller kunde" placeholder="Søk etter oppdrag eller kunde…" type="search" /><button type="submit">Søk</button>
      </form>
      <Link href="/support" className="ob-help"><CircleHelp size={18} />Hjelp</Link>
      <button ref={menu} className="ob-menu-button" aria-label="Åpne hovedmeny" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}><Menu size={22} /></button>
    </header>
    <dialog ref={dialog} className="ob-mobile-menu" aria-label="Hovedmeny" onClose={() => menu.current?.focus()} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="ob-mobile-menu-inner"><div className="ob-mobile-menu-heading"><Brand /><button onClick={close} aria-label="Lukk hovedmeny" autoFocus><X size={22} /></button></div><Navigation onNavigate={close} /></div>
    </dialog>
  </>;
}
