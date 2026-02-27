"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../components/layout/Sidebar";
import TopbarDesktop from "../components/layout/TopbarDesktop";
import TopbarMobile from "../components/layout/TopbarMobile";

import FilterLine, { type Filters } from "../components/dashboard/FilterLine";
import JobsTable from "../components/dashboard/JobsTable";
import type { Oppdrag } from "../lib/api"; // tilpass path hvis du bruker @/lib/api

const API = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

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

  // ✅ HER skjer filter + sort som gjør at tabellen endrer seg
  const filteredJobs = useMemo(() => {
    let rows = [...oppdrag];

    // status
    if (filters.status !== "ALL") {
      const wanted =
        filters.status === "PÅGÅR" ? ["PÅGÅR", "PAGAR"] : [filters.status];
      rows = rows.filter((o) => wanted.includes(o.status ?? ""));
    }

    // sort (enkelt: bruk id)
    rows.sort((a, b) =>
      filters.sort === "NEWEST" ? b.id - a.id : a.id - b.id,
    );

    return rows;
  }, [oppdrag, filters]);

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1">
        <TopbarDesktop />
        <TopbarMobile />

        <main className="p-6">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-5">Dashboard</h1>

          <div className="mt-6">
            <FilterLine value={filters} onChange={setFilters} />

            {loading && <p className="text-slate-600 mt-4">Laster...</p>}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && <JobsTable jobs={filteredJobs} />}
          </div>
        </main>
      </div>
    </div>
  );
}
