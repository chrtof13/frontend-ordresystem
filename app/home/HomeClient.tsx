"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, ArrowUpRight, RefreshCw, BriefcaseBusiness, CalendarDays, Clock3, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";


import FilterLine, { type Filters } from "../components/dashboard/FilterLine";
import JobsTable from "../components/dashboard/JobsTable";
import type { Oppdrag } from "../lib/api";
import { API } from "../lib/client";

export default function HomePage() {
  const router = useRouter();

  const [oppdrag, setOppdrag] = useState<Oppdrag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    status: "ALL",
    sort: "NEWEST",
  });

  function getToken() {
    return localStorage.getItem("token") ?? sessionStorage.getItem("token");
  }

  async function fetchOppdrag() {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/oppdrag`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          router.replace("/login");
          return;
        }
        throw new Error(`Kunne ikke hente oppdrag (HTTP ${res.status})`);
      }

      const data = (await res.json()) as Oppdrag[];
      setOppdrag(data);
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
      setOppdrag([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOppdrag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const total = oppdrag.length;
    const planlagt = oppdrag.filter((o) => o.status === "PLANLAGT").length;
    const pagar = oppdrag.filter(
      (o) => o.status === "PÅGÅR" || o.status === "PAGAR",
    ).length;
    const ferdig = oppdrag.filter(
      (o) => o.status === "FERDIG" || o.status === "FULLFØRT",
    ).length;
    return { total, planlagt, pagar, ferdig };
  }, [oppdrag]);

  const filteredJobs = useMemo(() => {
    let rows = [...oppdrag];

    if (filters.status !== "ALL") {
      const wanted =
        filters.status === "PÅGÅR" ? ["PÅGÅR", "PAGAR"] : filters.status === "FERDIG" ? ["FERDIG", "FULLFØRT"] : [filters.status];
      rows = rows.filter((o) => wanted.includes(o.status ?? ""));
    }

    rows.sort((a, b) =>
      filters.sort === "NEWEST" ? b.id - a.id : a.id - b.id,
    );

    return rows;
  }, [oppdrag, filters]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1440px] space-y-7">
        <div className="ob-page-heading">
          <div><span className="ob-eyebrow">DIN ARBEIDSHVERDAG, SAMLET</span><h1>God oversikt. Enklere arbeidsdag.</h1><p>Her ser du hva som er planlagt, hva som pågår og hva som er i mål.</p></div>
          <Link href="/jobs/newJob" className="ob-primary"><Plus size={18} />Nytt oppdrag</Link>
        </div>
        <div className="ob-metrics" aria-label="Oppdragsoversikt">
          {([
            { label: "Alle oppdrag", count: counts.total, status: "ALL", icon: BriefcaseBusiness, hint: "Hele oppdragslisten" },
            { label: "Planlagt", count: counts.planlagt, status: "PLANLAGT", icon: CalendarDays, hint: "Klare for neste steg" },
            { label: "Pågår", count: counts.pagar, status: "PÅGÅR", icon: Clock3, hint: "Arbeid underveis" },
            { label: "Ferdig", count: counts.ferdig, status: "FERDIG", icon: CircleCheck, hint: "Fullførte oppdrag" },
          ] as const).map(({ label, count, status, icon: Icon, hint }) => <button key={status} className="ob-metric" aria-pressed={filters.status === status} onClick={() => setFilters({ ...filters, status })}><span className="ob-metric-label">{label}<Icon size={18} /></span><strong>{loading || error ? "—" : count}</strong><small>{hint}</small></button>)}
        </div>
        <section className="ob-panel" aria-labelledby="oppdrag-heading">
          <div className="ob-panel-title"><div><h2 id="oppdrag-heading">Dine oppdrag</h2><p>Følg opp arbeidet, fra første avtale til ferdig oppdrag.</p></div><button className="ob-secondary" onClick={fetchOppdrag} disabled={loading}><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Oppdater</button></div>
          <FilterLine value={filters} onChange={setFilters} />
          {loading && <p role="status" className="py-10 text-center text-slate-500">Henter oppdragene dine…</p>}
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {!loading && !error && <JobsTable jobs={filteredJobs} onDeleted={id => setOppdrag(prev => prev.filter(job => job.id !== id))} />}
          <div className="mt-5 flex justify-end"><Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800">Se alle oppdrag<ArrowUpRight size={16} /></Link></div>
        </section>
      </main>
    </div>
  );
}
