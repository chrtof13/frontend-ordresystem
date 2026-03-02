"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Oppdrag } from "../lib/api"; // <-- juster path hvis lib ligger et annet sted
import { authedFetch } from "../lib/client"; // <-- juster path hvis lib ligger et annet sted

type VatRate = 0 | 12 | 15 | 25;

function toNum(v: any): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function fmtNok(n: number) {
  return n.toLocaleString("nb-NO", { style: "currency", currency: "NOK" });
}

function fmtHours(n: number) {
  return n.toLocaleString("nb-NO", { maximumFractionDigits: 2 }) + " t";
}

function isSameMonth(d: Date, ref: Date) {
  return (
    d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
  );
}

function isSameYear(d: Date, ref: Date) {
  return d.getFullYear() === ref.getFullYear();
}

function parseISODate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  // forventer YYYY-MM-DD
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function StatsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Oppdrag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vatRate, setVatRate] = useState<VatRate>(25);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch(router, "/api/oppdrag");
      const data = (await res.json()) as Oppdrag[];
      setJobs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke hente statistikk");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = useMemo(() => new Date(), []);
  const vatFactor = 1 + vatRate / 100;

  const stats = useMemo(() => {
    const withDate: Array<Oppdrag & { _date: Date }> = [];
    let withoutDateCount = 0;

    for (const j of jobs) {
      const d = parseISODate(j.dato);
      if (d) withDate.push({ ...(j as any), _date: d });
      else withoutDateCount++;
    }

    const monthJobs = withDate.filter((j) => isSameMonth(j._date, now));
    const yearJobs = withDate.filter((j) => isSameYear(j._date, now));

    const sum = (arr: Oppdrag[], fn: (j: Oppdrag) => number) =>
      arr.reduce((acc, j) => acc + fn(j), 0);

    const hoursWorkedAll = sum(jobs, (j) => toNum(j.timerGjort));
    const hoursEstimatedAll = sum(jobs, (j) => toNum(j.estimatTimer));

    const incomeAllExVat = sum(
      jobs,
      (j) => toNum(j.timepris) * toNum(j.timerGjort),
    );
    const incomeMonthExVat = sum(
      monthJobs,
      (j) => toNum(j.timepris) * toNum(j.timerGjort),
    );
    const incomeYearExVat = sum(
      yearJobs,
      (j) => toNum(j.timepris) * toNum(j.timerGjort),
    );

    const estValueAll = sum(
      jobs,
      (j) => toNum(j.timepris) * toNum(j.estimatTimer),
    );
    const actualValueAll = incomeAllExVat;

    const remainingValueAll = sum(jobs, (j) => {
      const est = toNum(j.estimatTimer);
      const done = toNum(j.timerGjort);
      const rate = toNum(j.timepris);
      const rem = Math.max(0, est - done);
      return rem * rate;
    });

    const completionPct =
      hoursEstimatedAll > 0 ? (hoursWorkedAll / hoursEstimatedAll) * 100 : 0;

    // Vektet snitt timepris basert på timer gjort (gir mest mening)
    const weightedRate =
      hoursWorkedAll > 0 ? incomeAllExVat / hoursWorkedAll : 0;

    const byStatus = jobs.reduce<Record<string, number>>((acc, j) => {
      const s = (j.status ?? "UKJENT").toString();
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {});

    const topTypes = jobs.reduce<Record<string, number>>((acc, j) => {
      const t = (j.type ?? "Uten type").toString().trim() || "Uten type";
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {});

    const topTypesSorted = Object.entries(topTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      countAll: jobs.length,
      withoutDateCount,

      incomeMonthExVat,
      incomeYearExVat,
      incomeAllExVat,

      incomeMonthIncVat: incomeMonthExVat * vatFactor,
      incomeYearIncVat: incomeYearExVat * vatFactor,
      incomeAllIncVat: incomeAllExVat * vatFactor,

      hoursWorkedAll,
      hoursEstimatedAll,
      completionPct,

      estValueAll,
      actualValueAll,
      remainingValueAll,

      weightedRate,
      byStatus,
      topTypesSorted,
    };
  }, [jobs, now, vatFactor]);

  const Card = ({
    title,
    value,
    sub,
  }: {
    title: string;
    value: string;
    sub?: string;
  }) => (
    <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-slate-100">
      <div className="text-sm font-medium text-slate-600">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {sub && <div className="mt-1 text-sm text-slate-500">{sub}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Laster statistikk...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Statistikk</h1>
            <p className="text-slate-600 mt-1">
              Oppsummering for firmaet basert på oppdrag (timer gjort, estimat
              og timepris).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/home")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Hjem
            </button>

            <button
              onClick={() => load()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Oppdater
            </button>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-600 mr-2">MVA:</span>
              <select
                className="outline-none"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value) as VatRate)}
              >
                <option value={25}>25%</option>
                <option value={15}>15%</option>
                <option value={12}>12%</option>
                <option value={0}>0%</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            title="Inntekt denne måneden"
            value={fmtNok(stats.incomeMonthExVat)}
            sub={`Inkl. mva (${vatRate}%): ${fmtNok(stats.incomeMonthIncVat)}`}
          />
          <Card
            title="Inntekt i år"
            value={fmtNok(stats.incomeYearExVat)}
            sub={`Inkl. mva (${vatRate}%): ${fmtNok(stats.incomeYearIncVat)}`}
          />
          <Card
            title="Inntekt totalt"
            value={fmtNok(stats.incomeAllExVat)}
            sub={`Inkl. mva (${vatRate}%): ${fmtNok(stats.incomeAllIncVat)}`}
          />

          <Card
            title="Timer gjort"
            value={fmtHours(stats.hoursWorkedAll)}
            sub="Sum av timerGjort i alle oppdrag"
          />
          <Card
            title="Estimerte timer"
            value={fmtHours(stats.hoursEstimatedAll)}
            sub="Sum av estimatTimer i alle oppdrag"
          />
          <Card
            title="Fullføringsgrad"
            value={`${stats.completionPct.toFixed(1)}%`}
            sub="Timer gjort / estimerte timer"
          />

          <Card
            title="Estimert ordreverdi"
            value={fmtNok(stats.estValueAll)}
            sub={`Inkl. mva (${vatRate}%): ${fmtNok(stats.estValueAll * (1 + vatRate / 100))}`}
          />
          <Card
            title="Faktisk ordreverdi"
            value={fmtNok(stats.actualValueAll)}
            sub={`Inkl. mva (${vatRate}%): ${fmtNok(stats.actualValueAll * (1 + vatRate / 100))}`}
          />
          <Card
            title="Gjenstående verdi"
            value={fmtNok(stats.remainingValueAll)}
            sub="Basert på (estimat - gjort) × timepris"
          />
        </div>

        {/* Secondary panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold">Statusoversikt</h2>
            <div className="mt-3 space-y-2 text-sm">
              {Object.keys(stats.byStatus).length === 0 && (
                <div className="text-slate-500">Ingen data.</div>
              )}
              {Object.entries(stats.byStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([s, c]) => (
                  <div key={s} className="flex items-center justify-between">
                    <div className="text-slate-700">{s}</div>
                    <div className="font-semibold text-slate-900">{c}</div>
                  </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600">
              Totalt oppdrag:{" "}
              <span className="font-semibold text-slate-900">
                {stats.countAll}
              </span>
              {" · "}
              Uten dato:{" "}
              <span className="font-semibold text-slate-900">
                {stats.withoutDateCount}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold">Andre nøkkeltall</h2>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-slate-700">Vektet snitt timepris</div>
                <div className="font-semibold text-slate-900">
                  {stats.weightedRate > 0
                    ? `${stats.weightedRate.toFixed(2)} kr/t`
                    : "—"}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-slate-700">Snitt inntekt per oppdrag</div>
                <div className="font-semibold text-slate-900">
                  {stats.countAll > 0
                    ? fmtNok(stats.incomeAllExVat / stats.countAll)
                    : "—"}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-slate-700">
                  Snitt timer gjort per oppdrag
                </div>
                <div className="font-semibold text-slate-900">
                  {stats.countAll > 0
                    ? fmtHours(stats.hoursWorkedAll / stats.countAll)
                    : "—"}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-800">
                Mest brukte typer
              </h3>
              <div className="mt-2 space-y-2 text-sm">
                {stats.topTypesSorted.length === 0 && (
                  <div className="text-slate-500">Ingen typer registrert.</div>
                )}
                {stats.topTypesSorted.map(([t, c]) => (
                  <div key={t} className="flex items-center justify-between">
                    <div className="text-slate-700">{t}</div>
                    <div className="font-semibold text-slate-900">{c}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-slate-100 text-sm text-slate-600">
          <div className="font-semibold text-slate-800 mb-1">
            Hvordan inntekt regnes
          </div>
          <div>
            Inntekt (eks. mva) ={" "}
            <span className="font-semibold">timepris × timer gjort</span>.
            Oppdrag uten dato telles ikke i “måned/år”, men er med i “totalt”.
          </div>
        </div>
      </main>
    </div>
  );
}
