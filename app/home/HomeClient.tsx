"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../components/layout/Sidebar";
import TopbarDesktop from "../components/layout/TopbarDesktop";
import TopbarMobile from "../components/layout/TopbarMobile";

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
        filters.status === "PÅGÅR" ? ["PÅGÅR", "PAGAR"] : [filters.status];
      rows = rows.filter((o) => wanted.includes(o.status ?? ""));
    }

    rows.sort((a, b) =>
      filters.sort === "NEWEST" ? b.id - a.id : a.id - b.id,
    );

    return rows;
  }, [oppdrag, filters]);

  return (
    <div className="min-h-screen flex">
      <div className="flex-1">
        {/* ✅ skjul søk på hjem */}
        <TopbarDesktop showSearch />
        <TopbarMobile showSearch />

        <main className="mx-auto max-w-[1400px] 2xl:max-w-[1600px] p-6 sm:p-8 space-y-8">
          {" "}
          {/* ✅ "ekte" home header */}
          <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-md border border-slate-200/60">
            {" "}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Oversikt over status, og en rask liste over oppdragene dine.
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70">
                <div className="text-xs font-semibold text-slate-600">
                  Totalt
                </div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {counts.total}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70">
                <div className="text-xs font-semibold text-slate-600">
                  Planlagt
                </div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {counts.planlagt}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70">
                <div className="text-xs font-semibold text-slate-600">
                  Pågår
                </div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {counts.pagar}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70">
                <div className="text-xs font-semibold text-slate-600">
                  Ferdig
                </div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {counts.ferdig}
                </div>
              </div>
            </div>
          </div>
          {/* ✅ Oppdragseksjon */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Oppdrag (hurtigoversikt)
              </h2>
              <button
                onClick={fetchOppdrag}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Oppdater
              </button>
            </div>

            <div className="mt-5">
              <FilterLine value={filters} onChange={setFilters} />

              {loading && <p className="text-slate-600 mt-4">Laster...</p>}

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {!loading && !error && <JobsTable jobs={filteredJobs} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
