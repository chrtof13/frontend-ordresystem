"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { LayoutDashboard, BriefcaseBusiness, FileText, ChartNoAxesCombined, Building2, Files, LifeBuoy, Shield, Users, LogOut, Plus, Layers } from "lucide-react";
import { isAdmin, isOwner, logout } from "../../lib/client";

const subscribe = () => () => {};
const groups = [
  { label: "ARBEIDSOMRÅDE", items: [
    { href: "/home", label: "Oversikt", icon: LayoutDashboard },
    { href: "/jobs", label: "Oppdrag", icon: BriefcaseBusiness },
    { href: "/quotes", label: "Pristilbud", icon: FileText },
    { href: "/stats", label: "Statistikk", icon: ChartNoAxesCombined },
  ] },
  { label: "FIRMA OG INNSTILLINGER", items: [
    { href: "/settings/company", label: "Firma", icon: Building2 },
    { href: "/firma/document-settings", label: "Dokumentmal", icon: Files },
  ] },
];

export function Brand() {
  return <Link href="/home" className="ob-brand" aria-label="Ordrebase – gå til oversikt"><span className="ob-brand-icon"><Layers size={22} /></span>ordrebase<span className="ob-brand-dot">.</span></Link>;
}

export default function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const router = useRouter();
  const admin = useSyncExternalStore(subscribe, isAdmin, () => false);
  const owner = useSyncExternalStore(subscribe, isOwner, () => false);
  const active = (href: string) => path === href || (href !== "/home" && path.startsWith(href + "/"));
  return <>
    <Link href="/jobs/newJob" onClick={onNavigate} className="ob-primary ob-new-job"><Plus size={18} />Nytt oppdrag</Link>
    <nav aria-label="Hovedmeny" className="ob-nav">
      {groups.map(group => <div className="ob-nav-group" key={group.label}><p>{group.label}</p>{group.items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={onNavigate} aria-current={active(href) ? "page" : undefined} className="ob-nav-link"><Icon size={19} />{label}</Link>)}</div>)}
      {(admin || owner) && <div className="ob-nav-group"><p>ADMINISTRASJON</p>{admin && <Link className="ob-nav-link" href="/admin/users" onClick={onNavigate} aria-current={active("/admin/users") ? "page" : undefined}><Users size={19} />Brukere</Link>}{owner && <Link className="ob-nav-link" href="/owner" onClick={onNavigate} aria-current={active("/owner") ? "page" : undefined}><Shield size={19} />Eierpanel</Link>}</div>}
    </nav>
    <div className="ob-nav-footer"><Link href="/support" className="ob-nav-link" onClick={onNavigate} aria-current={active("/support") ? "page" : undefined}><LifeBuoy size={19} />Hjelp og støtte</Link><button className="ob-nav-link" onClick={() => logout(router)}><LogOut size={19} />Logg ut</button></div>
  </>;
}
