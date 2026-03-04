"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch } from "../lib/client";
import type { Quote } from "../lib/quoteTypes";
import {
  fmtMoney,
  sumExVatFromLines,
  sumIncVatFromLines,
} from "../lib/quoteUtils";

function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nb-NO");
}

export default function QuotesListPage() {
  const router = useRouter();

  const [items, setItems] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch(router, "/api/quotes");
      const data = (await res.json()) as Quote[];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke hente pristilbud");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(() => {
    return (items ?? []).slice().sort((a, b) => {
      const ad = new Date(a.createdAt ?? 0).getTime();
      const bd = new Date(b.createdAt ?? 0).getTime();
      return bd - ad;
    });
  }, [items]);

  const badge = (status?: string) => {
    const s = (status ?? "DRAFT").toUpperCase();
    const base =
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";
    if (s === "SENT") return `${base} bg-emerald-50 text-emerald-700`;
    if (s === "CANCELLED") return `${base} bg-red-50 text-red-700`;
    return `${base} bg-slate-100 text-slate-700`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Laster pristilbud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Pristilbud</h1>
            <p className="text-slate-600 mt-1">
              Oversikt over pristilbud i firmaet.
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

            <button
              onClick={() => router.push("/quotes/new")}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              + Opprett nytt
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Alle pristilbud</h2>
            <p className="text-sm text-slate-600 mt-1">
              Klikk på et pristilbud for å se detaljer.
            </p>
          </div>

          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    #
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Kunde
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Sum (eks)
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Sum (inkl)
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Dato
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {sorted.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-slate-500" colSpan={6}>
                      Ingen pristilbud enda.
                    </td>
                  </tr>
                )}

                {sorted.map((q) => {
                  const ex = q.sumExVat ?? sumExVatFromLines(q);
                  const inc = q.sumIncVat ?? sumIncVatFromLines(q);
                  return (
                    <tr
                      key={q.id}
                      className="bg-white hover:bg-slate-50 cursor-pointer"
                      onClick={() => router.push(`/quotes/${q.id}`)}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {q.id ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-900">
                        {q.kundeNavn || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={badge(q.status)}>
                          {(q.status ?? "DRAFT").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {fmtMoney(ex)} kr
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        {fmtMoney(inc)} kr
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {fmtDate(q.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobil */}
          <div className="md:hidden p-4 space-y-3">
            {sorted.length === 0 && (
              <div className="text-slate-500">Ingen pristilbud enda.</div>
            )}

            {sorted.map((q) => {
              const ex = q.sumExVat ?? sumExVatFromLines(q);
              const inc = q.sumIncVat ?? sumIncVatFromLines(q);
              return (
                <button
                  key={q.id}
                  onClick={() => router.push(`/quotes/${q.id}`)}
                  className="w-full text-left rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        #{q.id} · {q.kundeNavn || "—"}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={badge(q.status)}>
                          {(q.status ?? "DRAFT").toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500">
                          {fmtDate(q.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500">Sum inkl.</div>
                      <div className="font-bold tabular-nums text-slate-900">
                        {fmtMoney(inc)} kr
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Eks: {fmtMoney(ex)} kr
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
