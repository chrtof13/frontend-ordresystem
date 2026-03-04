"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Oppdrag } from "../lib/api";
import { authedFetch } from "../lib/client";

type VatRate = 0 | 12 | 15 | 25;
type PeriodPreset = "MONTH" | "YEAR" | "ALL" | "CUSTOM";

type MaterialLine = {
  id: string;
  navn: string;
  antall: string; // input
  kostPerStk: string; // input
};

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

/** Robust parsing av "YYYY-MM-DD" uten timezone-trøbbel */
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
  return new Date(y, mo - 1, d, 12, 0, 0);
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
  return x === "FERDIG" || x === "FULLFØRT" || x === "FULLFORT";
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function StatsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Oppdrag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // MVA er inkludert i timepris → vi bruker denne kun for å regne ut eks-mva (dele)
  const [vatRate, setVatRate] = useState<VatRate>(25);

  // ofte ønsker de kun ferdige på inntekt
  const [onlyFinished, setOnlyFinished] = useState(true);

  // periode
  const [preset, setPreset] = useState<PeriodPreset>("MONTH");
  const [fromYmd, setFromYmd] = useState<string>(() =>
    dateToYmdLocal(startOfMonth(new Date())),
  );
  const [toYmd, setToYmd] = useState<string>(() =>
    dateToYmdLocal(endOfMonth(new Date())),
  );

  // material-kalkulator (frontend)
  const [materials, setMaterials] = useState<MaterialLine[]>([
    { id: uid(), navn: "Gipsplater", antall: "0", kostPerStk: "0" },
  ]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch(router, "/api/oppdrag");
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

  // Når preset endres, oppdater from/to automatisk (hvis ikke CUSTOM)
  useEffect(() => {
    const now = new Date();
    if (preset === "MONTH") {
      setFromYmd(dateToYmdLocal(startOfMonth(now)));
      setToYmd(dateToYmdLocal(endOfMonth(now)));
    } else if (preset === "YEAR") {
      setFromYmd(dateToYmdLocal(startOfYear(now)));
      setToYmd(dateToYmdLocal(endOfYear(now)));
    }
  }, [preset]);

  const vatDivisor = 1 + vatRate / 100; // for å trekke fra mva: eks = inkl / divisor

  const stats = useMemo(() => {
    const parsed = jobs.map((j) => ({ j, d: parseYmd((j as any).dato) }));
    const withoutDateCount = parsed.filter((x) => !x.d).length;

    const base = onlyFinished
      ? parsed.filter((x) => isFinishedStatus((x.j as any).status))
      : parsed;

    // periodefilter
    let periodItems = base;

    if (preset !== "ALL") {
      const from = parseYmd(fromYmd);
      const to = parseYmd(toYmd);

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
        periodItems = [];
      }
    }

    const sum = (arr: { j: Oppdrag }[], fn: (j: Oppdrag) => number) =>
      arr.reduce((acc, x) => acc + fn(x.j), 0);

    // arbeid INKL mva (timepris er inkl mva ifølge Termobygg)
    const workPeriodIncVat = sum(
      periodItems,
      (j) => toNum((j as any).timepris) * toNum((j as any).timerGjort),
    );
    const workAllFilteredIncVat = sum(
      base,
      (j) => toNum((j as any).timepris) * toNum((j as any).timerGjort),
    );

    // arbeid EKS mva = dele på 1.25 (eller valgt sats)
    const workPeriodExVat =
      vatDivisor > 0 ? workPeriodIncVat / vatDivisor : workPeriodIncVat;
    const workAllFilteredExVat =
      vatDivisor > 0
        ? workAllFilteredIncVat / vatDivisor
        : workAllFilteredIncVat;

    // timer
    const hoursWorkedAll = sum(parsed, (j) => toNum((j as any).timerGjort));
    const hoursEstimatedAll = sum(parsed, (j) =>
      toNum((j as any).estimatTimer),
    );
    const completionPct =
      hoursEstimatedAll > 0 ? (hoursWorkedAll / hoursEstimatedAll) * 100 : 0;

    // vektet snitt (basert på timer)
    const weightedRateIncVat =
      hoursWorkedAll > 0
        ? sum(
            parsed,
            (j) => toNum((j as any).timepris) * toNum((j as any).timerGjort),
          ) / hoursWorkedAll
        : 0;
    const weightedRateExVat =
      vatDivisor > 0 ? weightedRateIncVat / vatDivisor : weightedRateIncVat;

    // status + typer (uansett periode)
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

    const periodLabel =
      preset === "MONTH"
        ? "Denne måneden"
        : preset === "YEAR"
          ? "Dette året"
          : preset === "ALL"
            ? "Totalt"
            : `Periode (${fromYmd} → ${toYmd})`;

    return {
      periodLabel,
      countAll: jobs.length,
      withoutDateCount,

      workPeriodIncVat,
      workPeriodExVat,
      workAllFilteredIncVat,
      workAllFilteredExVat,

      hoursWorkedAll,
      hoursEstimatedAll,
      completionPct,

      weightedRateIncVat,
      weightedRateExVat,

      byStatus,
      topTypesSorted,
    };
  }, [jobs, preset, fromYmd, toYmd, onlyFinished, vatDivisor]);

  // material-sum (frontend) – regn som INKL mva (samme logikk: eks = inkl / divisor)
  const materialTotals = useMemo(() => {
    const lines = materials.map((m) => {
      const ant = Math.max(0, toNum(m.antall));
      const kost = Math.max(0, toNum(m.kostPerStk));
      const sum = ant * kost;
      return { ...m, antallNum: ant, kostNum: kost, sum };
    });

    const incVat = lines.reduce((a, x) => a + x.sum, 0);
    const exVat = vatDivisor > 0 ? incVat / vatDivisor : incVat;

    return { lines, incVat, exVat };
  }, [materials, vatDivisor]);

  // total omsetning = arbeid + materialer
  const revenue = useMemo(() => {
    const periodInc = stats.workPeriodIncVat + materialTotals.incVat;
    const periodEx = stats.workPeriodExVat + materialTotals.exVat;

    const totalInc = stats.workAllFilteredIncVat + materialTotals.incVat;
    const totalEx = stats.workAllFilteredExVat + materialTotals.exVat;

    return { periodInc, periodEx, totalInc, totalEx };
  }, [stats, materialTotals]);

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
              Timepris er inkl. mva. Vi viser både inkl. og eks. mva, og tar med
              materialer.
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
              <span className="text-slate-600 mr-2">MVA-sats:</span>
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
                Timepris er inkl. mva → eks. mva regnes ved å dele på (1 +
                mva%).
              </div>
            </div>

            <div className="text-sm text-slate-600">
              <div className="font-semibold text-slate-800">Merk</div>
              <div className="mt-2">
                Oppdrag uten dato tas ikke med i perioder, men telles i
                oversikten.
              </div>
            </div>
          </div>
        </div>

        {/* Material-kalkulator */}
        {/*
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold">
                Materialkostnader (kalkulator)
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Legg inn materialer (navn, antall, kost per stk). Dette tas med
                i total omsetning.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMaterials((prev) => [
                  ...prev,
                  { id: uid(), navn: "", antall: "0", kostPerStk: "0" },
                ])
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              + Legg til linje
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-slate-700">
                    Materiale
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-700">
                    Antall
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-700">
                    Kost/stk
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-700">
                    Sum
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-700">
                    {" "}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {materialTotals.lines.map((m) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2">
                      <input
                        value={m.navn}
                        onChange={(e) =>
                          setMaterials((prev) =>
                            prev.map((x) =>
                              x.id === m.id
                                ? { ...x, navn: e.target.value }
                                : x,
                            ),
                          )
                        }
                        placeholder="f.eks. gipsplater"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={m.antall}
                        onChange={(e) =>
                          setMaterials((prev) =>
                            prev.map((x) =>
                              x.id === m.id
                                ? { ...x, antall: e.target.value }
                                : x,
                            ),
                          )
                        }
                        inputMode="decimal"
                        className="w-32 rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={m.kostPerStk}
                        onChange={(e) =>
                          setMaterials((prev) =>
                            prev.map((x) =>
                              x.id === m.id
                                ? { ...x, kostPerStk: e.target.value }
                                : x,
                            ),
                          )
                        }
                        inputMode="decimal"
                        className="w-40 rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">
                      {fmtNok(m.sum)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setMaterials((prev) =>
                            prev.filter((x) => x.id !== m.id),
                          )
                        }
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Slett
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="px-3 py-2 font-semibold" colSpan={3}>
                    Sum materialer
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {fmtNok(materialTotals.incVat)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-3 text-sm text-slate-600">
            Materialer <b>inkl. mva</b>: {fmtNok(materialTotals.incVat)} {" · "}
            Materialer <b>eks. mva</b>: {fmtNok(materialTotals.exVat)}
          </div>
        </div> */}

        {/* KPI grid (oppdatert med omsetning + riktig MVA-logikk) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            title={`Arbeid (${stats.periodLabel})`}
            value={fmtNok(stats.workPeriodIncVat)}
            sub={`Eks. mva (${vatRate}%): ${fmtNok(stats.workPeriodExVat)}`}
          />
          <Card
            title={`Arbeid (totalt${onlyFinished ? ", ferdige" : ""})`}
            value={fmtNok(stats.workAllFilteredIncVat)}
            sub={`Eks. mva (${vatRate}%): ${fmtNok(stats.workAllFilteredExVat)}`}
          />
          <Card
            title={`Total omsetning (${stats.periodLabel})`}
            value={fmtNok(revenue.periodInc)}
            sub={`Eks. mva: ${fmtNok(revenue.periodEx)} (arbeid + materialer)`}
          />
          <Card
            title={`Total omsetning (totalt${onlyFinished ? ", ferdige" : ""})`}
            value={fmtNok(revenue.totalInc)}
            sub={`Eks. mva: ${fmtNok(revenue.totalEx)} (arbeid + materialer)`}
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
            title="Vektet snitt timepris (inkl. mva)"
            value={
              stats.weightedRateIncVat > 0
                ? `${stats.weightedRateIncVat.toFixed(2)} kr/t`
                : "—"
            }
            sub={`Eks. mva: ${stats.weightedRateExVat > 0 ? `${stats.weightedRateExVat.toFixed(2)} kr/t` : "—"}`}
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
            Hvordan tallene regnes (Termobygg)
          </div>
          <div>
            <b>Arbeid inkl. mva</b> ={" "}
            <span className="font-semibold">timepris × timer gjort</span>{" "}
            (timepris er allerede inkl. mva).
            <br />
            <b>Arbeid eks. mva</b> ={" "}
            <span className="font-semibold">arbeid inkl. mva / (1 + mva%)</span>
            .
            <br />
            <b>Total omsetning</b> ={" "}
            <span className="font-semibold">arbeid + materialkostnader</span>.
          </div>
        </div>
      </main>
    </div>
  );
}
