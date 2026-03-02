"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Sidebar from "../components/layout/Sidebar";
import TopbarDesktop from "../components/layout/TopbarDesktop";
import TopbarMobile from "../components/layout/TopbarMobile";

import FilterLine, { type Filters } from "../components/dashboard/FilterLine";
import JobsTable from "../components/dashboard/JobsTable";
import type { Oppdrag } from "../lib/api";
import { API } from "../lib/client";

export default function JobsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = (searchParams.get("q") ?? "").trim();

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

  const filteredJobs = useMemo(() => {
    let rows = [...oppdrag];

    // søk i tittel + beskrivelse
    if (q) {
      const qq = q.toLowerCase();
      rows = rows.filter((o) => {
        const t = (o.tittel ?? "").toLowerCase();
        const b = (o.beskrivelse ?? "").toLowerCase();
        return t.includes(qq) || b.includes(qq);
      });
    }

    // status-filter
    if (filters.status !== "ALL") {
      const wanted =
        filters.status === "PÅGÅR" ? ["PÅGÅR", "PAGAR"] : [filters.status];
      rows = rows.filter((o) => wanted.includes(o.status ?? ""));
    }

    // sort
    rows.sort((a, b) =>
      filters.sort === "NEWEST" ? b.id - a.id : a.id - b.id,
    );

    return rows;
  }, [oppdrag, filters, q]);

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1">
        <TopbarDesktop showSearch initialQuery={q} />
        <TopbarMobile showSearch initialQuery={q} />

        <main className="mx-auto max-w-[1400px] 2xl:max-w-[1600px] p-6 sm:p-8 space-y-8">
          {" "}
          <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                  Oppdrag
                </h1>
                <p className="text-slate-600 mt-1">
                  Søk i tittel og beskrivelse. {q ? `Søker på: “${q}”` : ""}
                </p>
              </div>

              <div className="flex gap-2">
                {q && (
                  <button
                    onClick={() => router.push("/jobs")}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    Tøm søk
                  </button>
                )}
                <button
                  onClick={fetchOppdrag}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Oppdater
                </button>
              </div>
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
