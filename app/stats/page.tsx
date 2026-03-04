"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Oppdrag } from "../lib/api"; // juster path ved behov
import { authedFetch } from "../lib/client"; // juster path ved behov

type VatRate = 0 | 12 | 15 | 25;
type PeriodPreset = "MONTH" | "YEAR" | "ALL" | "CUSTOM";

// ---------- Utils ----------
function toNum(v: any): number {
  if (v == null) return 0;
  const raw = typeof v === "number" ? String(v) : String(v);
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function fmtNok(n: number) {
  return n.toLocaleString("nb-NO", { style: "currency", currency: "NOK" });
}

function fmtHours(n: number) {
  return n.toLocaleString("nb-NO", { maximumFractionDigits: 2 }) + " t";
}

/**
 * Robust parsing av "YYYY-MM-DD" uten timezone-trøbbel.
 * new Date("2026-03-04") kan bli forskjøvet til dagen før i noen tidssoner.
 */
function parseYmd(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const s = dateStr.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d))
    return null;
  return new Date(y, mo - 1, d, 12, 0, 0); // 12:00 for ekstra safety
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}
function endOfYear(d: Date) {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function dateToYmdLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isFinishedStatus(s?: string | null) {
  const x = (s ?? "").toUpperCase();
  // Tilpass hvis du bruker andre verdier
  return x === "FERDIG" || x === "FULLFØRT" || x === "FULLFORT";
}

export default function StatsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Oppdrag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vatRate, setVatRate] = useState<VatRate>(25);

  // "Termobygg-style": ofte ønsker de kun ferdige på inntekt
  const [onlyFinished, setOnlyFinished] = useState(true);

  // periode
  const [preset, setPreset] = useState<PeriodPreset>("MONTH");
  const [fromYmd, setFromYmd] = useState<string>(() =>
    dateToYmdLocal(startOfMonth(new Date())),
  );
  const [toYmd, setToYmd] = useState<string>(() =>
    dateToYmdLocal(endOfMonth(new Date())),
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch(router, "/api/oppdrag");
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Kunne ikke hente statistikk (${res.status})`);
      }
      const data = (await res.json()) as Oppdrag[];
      setJobs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke hente statistikk");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Når preset endres, oppdater vi from/to automatisk (hvis ikke CUSTOM)
  useEffect(() => {
    const now = new Date();
    if (preset === "MONTH") {
      setFromYmd(dateToYmdLocal(startOfMonth(now)));
      setToYmd(dateToYmdLocal(endOfMonth(now)));
    } else if (preset === "YEAR") {
      setFromYmd(dateToYmdLocal(startOfYear(now)));
      setToYmd(dateToYmdLocal(endOfYear(now)));
    } else if (preset === "ALL") {
      // La from/to stå, men brukes ikke i ALL
    }
  }, [preset]);

  const vatFactor = 1 + vatRate / 100;

  const stats = useMemo(() => {
    const now = new Date();

    const parsed = jobs.map((j) => ({
      j,
      d: parseYmd((j as any).dato),
    }));

    const withoutDateCount = parsed.filter((x) => !x.d).length;

    // filtrer på ferdig hvis valgt
    const base = onlyFinished
      ? parsed.filter((x) => isFinishedStatus((x.j as any).status))
      : parsed;

    // periode filter
    let periodItems = base;

    if (preset !== "ALL") {
      const from = preset === "CUSTOM" ? parseYmd(fromYmd) : parseYmd(fromYmd);
      const to = preset === "CUSTOM" ? parseYmd(toYmd) : parseYmd(toYmd);

      if (from && to) {
        const fromMs = new Date(
          from.getFullYear(),
          from.getMonth(),
          from.getDate(),
          0,
          0,
          0,
          0,
        ).getTime();

        const toMs = new Date(
          to.getFullYear(),
          to.getMonth(),
          to.getDate(),
          23,
          59,
          59,
          999,
        ).getTime();

        periodItems = base.filter(
          (x) => x.d && x.d.getTime() >= fromMs && x.d.getTime() <= toMs,
        );
      } else {
        // hvis custom er ugyldig, fall back til "tom periode"
        periodItems = [];
      }
    }

    const sum = (arr: { j: Oppdrag }[], fn: (j: Oppdrag) => number) =>
      arr.reduce((acc, x) => acc + fn(x.j), 0);

    // Timer (totalt) – gir mening å vise uansett periodevalg
    const hoursWorkedAll = sum(parsed, (j) => toNum((j as any).timerGjort));
    const hoursEstimatedAll = sum(parsed, (j) =>
      toNum((j as any).estimatTimer),
    );

    // Inntekt (eks mva) for valgt periode
    const incomePeriodExVat = sum(periodItems, (j) => {
      const rate = toNum((j as any).timepris);
      const done = toNum((j as any).timerGjort);
      return rate * done;
    });

    // Totalt (eks mva) for alle (samme filter “onlyFinished”)
    const incomeAllFilteredExVat = sum(base, (j) => {
      const rate = toNum((j as any).timepris);
      const done = toNum((j as any).timerGjort);
      return rate * done;
    });

    // Estimert verdi (samme filterbase)
    const estValueAll = sum(base, (j) => {
      const rate = toNum((j as any).timepris);
      const est = toNum((j as any).estimatTimer);
      return rate * est;
    });

    const remainingValueAll = sum(base, (j) => {
      const est = toNum((j as any).estimatTimer);
      const done = toNum((j as any).timerGjort);
      const rate = toNum((j as any).timepris);
      const rem = Math.max(0, est - done);
      return rem * rate;
    });

    const completionPct =
      hoursEstimatedAll > 0 ? (hoursWorkedAll / hoursEstimatedAll) * 100 : 0;

    const weightedRate =
      hoursWorkedAll > 0
        ? sum(
            parsed,
            (j) => toNum((j as any).timepris) * toNum((j as any).timerGjort),
          ) / hoursWorkedAll
        : 0;

    const byStatus = parsed.reduce<Record<string, number>>((acc, x) => {
      const s = ((x.j as any).status ?? "UKJENT").toString();
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {});

    const topTypes = parsed.reduce<Record<string, number>>((acc, x) => {
      const t =
        (((x.j as any).type ?? "Uten type") as string).toString().trim() ||
        "Uten type";
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {});

    const topTypesSorted = Object.entries(topTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    // Period label
    const periodLabel =
      preset === "MONTH"
        ? "Denne måneden"
        : preset === "YEAR"
          ? "Dette året"
          : preset === "ALL"
            ? "Totalt"
            : `Periode (${fromYmd} → ${toYmd})`;

    return {
      now,
      periodLabel,

      countAll: jobs.length,
      withoutDateCount,

      // “hovedtall”
      incomePeriodExVat,
      incomePeriodIncVat: incomePeriodExVat * vatFactor,

      incomeAllFilteredExVat,
      incomeAllFilteredIncVat: incomeAllFilteredExVat * vatFactor,

      hoursWorkedAll,
      hoursEstimatedAll,
      completionPct,

      estValueAll,
      actualValueAll: incomeAllFilteredExVat,
      remainingValueAll,

      weightedRate,
      byStatus,
      topTypesSorted,
    };
  }, [jobs, preset, fromYmd, toYmd, vatFactor, onlyFinished]);

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
              Oppsummering basert på oppdrag (timer gjort, estimat og timepris).
            </p>
            <div className="mt-2 text-sm text-slate-500">
              Periode:{" "}
              <span className="font-semibold text-slate-800">
                {stats.periodLabel}
              </span>
              {onlyFinished && (
                <>
                  {" · "}
                  <span className="font-semibold text-slate-800">
                    Kun ferdige oppdrag
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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

        {/* Controls */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-800">
                Periode
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["MONTH", "YEAR", "ALL", "CUSTOM"] as PeriodPreset[]).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPreset(p)}
                      className={[
                        "rounded-full px-3 py-1 text-sm font-semibold border",
                        preset === p
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {p === "MONTH"
                        ? "Denne måned"
                        : p === "YEAR"
                          ? "Dette år"
                          : p === "ALL"
                            ? "Totalt"
                            : "Egendefinert"}
                    </button>
                  ),
                )}
              </div>

              {preset === "CUSTOM" && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-sm text-slate-600 mb-1">Fra</label>
                    <input
                      type="date"
                      value={fromYmd}
                      onChange={(e) => setFromYmd(e.target.value)}
                      className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-slate-600 mb-1">Til</label>
                    <input
                      type="date"
                      value={toYmd}
                      onChange={(e) => setToYmd(e.target.value)}
                      className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-800">
                Inntekt-beregning
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="onlyFinished"
                  type="checkbox"
                  checked={onlyFinished}
                  onChange={(e) => setOnlyFinished(e.target.checked)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="onlyFinished"
                  className="text-sm text-slate-700"
                >
                  Ta med kun ferdige oppdrag (FERDIG/FULLFØRT)
                </label>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                (Dette er ofte det kunder mener med “inntekt”.)
              </div>
            </div>

            <div className="text-sm text-slate-600">
              <div className="font-semibold text-slate-800">Merk</div>
              <div className="mt-2">
                Oppdrag uten dato telles ikke i perioder
                (måned/år/egendefinert), men de er med i “Totalt”-status/typer,
                og du ser hvor mange som mangler dato.
              </div>
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            title={`Inntekt (${stats.periodLabel})`}
            value={fmtNok(stats.incomePeriodExVat)}
            sub={`Inkl. mva (${vatRate}%): ${fmtNok(stats.incomePeriodIncVat)}`}
          />
          <Card
            title={`Inntekt (totalt${onlyFinished ? ", ferdige" : ""})`}
            value={fmtNok(stats.incomeAllFilteredExVat)}
            sub={`Inkl. mva (${vatRate}%): ${fmtNok(stats.incomeAllFilteredIncVat)}`}
          />
          <Card
            title="Gjenstående verdi"
            value={fmtNok(stats.remainingValueAll)}
            sub="Basert på (estimat - gjort) × timepris"
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
            sub={`Inkl. mva (${vatRate}%): ${fmtNok(stats.estValueAll * vatFactor)}`}
          />
          <Card
            title="Faktisk ordreverdi"
            value={fmtNok(stats.actualValueAll)}
            sub={`Inkl. mva (${vatRate}%): ${fmtNok(stats.actualValueAll * vatFactor)}`}
          />
          <Card
            title="Vektet snitt timepris"
            value={
              stats.weightedRate > 0
                ? `${stats.weightedRate.toFixed(2)} kr/t`
                : "—"
            }
            sub="Vektet etter timer gjort"
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
            <h2 className="text-lg font-semibold">Mest brukte typer</h2>
            <div className="mt-3 space-y-2 text-sm">
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

        {/* Note */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-slate-100 text-sm text-slate-600">
          <div className="font-semibold text-slate-800 mb-1">
            Hvordan inntekt regnes
          </div>
          <div>
            Inntekt (eks. mva) ={" "}
            <span className="font-semibold">timepris × timer gjort</span>.
            {onlyFinished && (
              <>
                {" "}
                Og kun oppdrag med status{" "}
                <span className="font-semibold">FERDIG/FULLFØRT</span> tas med.
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
