"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch } from "../lib/client";
import type { Quote } from "../lib/quoteTypes";
import { fmtMoney, sumIncVatFromLines } from "../lib/quoteUtils";
import type { SubscriptionPlan } from "../lib/subscription";
import { hasAtLeast } from "../lib/subscription";

type FirmaOverview = {
  id: number;
  navn: string;
  status: string;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
  userCount: number;
};

function parseDateValue(q: Quote) {
  return q.validUntil ?? q.createdAt ?? null;
}

function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nb-NO");
}

export default function QuotesListPage() {
  const router = useRouter();

  const [items, setItems] = useState<Quote[]>([]);
  const [subscriptionPlan, setSubscriptionPlan] =
    useState<SubscriptionPlan>("BASIC");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const hasAccess = hasAtLeast(subscriptionPlan, "STANDARD");

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const firmaRes = await authedFetch(router, "/api/firma/me");
      const firma = (await firmaRes.json()) as FirmaOverview;
      setSubscriptionPlan(firma.subscriptionPlan ?? "BASIC");

      if (!hasAtLeast(firma.subscriptionPlan, "STANDARD")) {
        setItems([]);
        setLoading(false);
        return;
      }

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

  async function deleteQuote(id?: number) {
    if (!id || !hasAccess) return;

    const ok = confirm(`Slette pristilbud #${id}? Dette kan ikke angres.`);
    if (!ok) return;

    setDeletingId(id);
    setError(null);

    try {
      const res = await authedFetch(router, `/api/quotes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Kunne ikke slette (HTTP ${res.status})`);
      }

      setItems((prev) => prev.filter((q) => q.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke slette pristilbud");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(() => {
    return (items ?? []).slice().sort((a, b) => {
      const ad = new Date(parseDateValue(a) ?? 0).getTime();
      const bd = new Date(parseDateValue(b) ?? 0).getTime();
      return bd - ad;
    });
  }, [items]);

  const badge = (status?: string) => {
    const s = (status ?? "DRAFT").toUpperCase();
    const base =
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";

    if (s === "SENT") return `${base} bg-emerald-50 text-emerald-700`;
    if (s === "ACCEPTED") return `${base} bg-blue-50 text-blue-700`;
    if (s === "DECLINED") return `${base} bg-red-50 text-red-700`;
    if (s === "EXPIRED") return `${base} bg-amber-50 text-amber-800`;
    if (s === "CANCELLED") return `${base} bg-slate-200 text-slate-700`;

    return `${base} bg-slate-100 text-slate-700`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Laster pristilbud...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-100">
        <main className="mx-auto max-w-4xl p-4 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Pristilbud</h1>
              <p className="text-slate-600 mt-1">
                Oversikt over pristilbud i firmaet.
              </p>
            </div>

            <button
              onClick={() => router.push("/home")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Hjem
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="text-lg font-semibold text-amber-900">
              Pristilbud krever Standard-abonnement
            </div>
            <p className="mt-2 text-sm text-amber-800">
              Opprettelse, sending og administrasjon av pristilbud er ikke
              tilgjengelig i Basic.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/settings/company")}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Se abonnement
              </button>

              <button
                onClick={() => router.push("/home")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Tilbake
              </button>
            </div>
          </div>
        </main>
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
                    Sum
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Dato
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Handling
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
                  const inc = q.sumIncVat ?? sumIncVatFromLines(q);
                  const isDeleting = deletingId === q.id;
                  const dateValue = parseDateValue(q);

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
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        {fmtMoney(inc)} kr
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {fmtDate(dateValue)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuote(q.id);
                          }}
                          disabled={isDeleting}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                          title="Slett pristilbud"
                        >
                          {isDeleting ? "Sletter..." : "Slett"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden p-4 space-y-3">
            {sorted.length === 0 && (
              <div className="text-slate-500">Ingen pristilbud enda.</div>
            )}

            {sorted.map((q) => {
              const inc = q.sumIncVat ?? sumIncVatFromLines(q);
              const isDeleting = deletingId === q.id;
              const dateValue = parseDateValue(q);

              return (
                <div
                  key={q.id}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4"
                >
                  <button
                    onClick={() => router.push(`/quotes/${q.id}`)}
                    className="w-full text-left"
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
                            {fmtDate(dateValue)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-500">Sum</div>
                        <div className="font-bold tabular-nums text-slate-900">
                          {fmtMoney(inc)} kr
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteQuote(q.id)}
                      disabled={isDeleting}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      {isDeleting ? "Sletter..." : "Slett"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
