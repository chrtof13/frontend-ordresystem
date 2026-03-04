"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Quote } from "../../lib/quoteTypes";
import { authedFetch } from "../../lib/client";
import {
  fmtMoney,
  lineTotal,
  sumExVatFromInc,
  sumIncVatFromLines,
  vatFromInc,
} from "../../lib/quoteUtils";

function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nb-NO");
}

export default function QuoteReadPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [q, setQ] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch(router, `/api/quotes/${id}`);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          txt || `Kunne ikke hente pristilbud (HTTP ${res.status})`,
        );
      }
      setQ((await res.json()) as Quote);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke hente pristilbud");
      setQ(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isAccepted = useMemo(() => {
    return (q?.status ?? "").toUpperCase() === "ACCEPTED";
  }, [q]);

  const totals = useMemo(() => {
    if (!q) return { ex: 0, vat: 0, inc: 0 };

    // Du har nå inc som "hovedsum" (inkl mva) fra linjene / backend:
    const inc = (q.sumIncVat ?? sumIncVatFromLines(q)) as number;

    // regn ut ex + mva fra inc:
    const ex = sumExVatFromInc(inc, q.vatRate ?? 0);
    const vat = vatFromInc(inc, q.vatRate ?? 0);

    return { ex, vat, inc };
  }, [q]);

  async function downloadPdf() {
    if (!q?.id) return;
    setBusy(true);
    setError(null);
    setMsg(null);

    try {
      const res = await authedFetch(router, `/api/quotes/${q.id}/pdf`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke hente PDF");
    } finally {
      setBusy(false);
    }
  }

  async function sendToCustomer() {
    if (!q?.id) return;
    setBusy(true);
    setError(null);
    setMsg(null);

    try {
      const res = await authedFetch(router, `/api/quotes/${q.id}/send`, {
        method: "POST",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Kunne ikke sende (HTTP ${res.status})`);
      }

      setMsg("Pristilbud sendt ✅");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke sende");
    } finally {
      setBusy(false);
    }
  }

  async function sendContract() {
    if (!q?.id) return;
    setBusy(true);
    setError(null);
    setMsg(null);

    try {
      const res = await authedFetch(
        router,
        `/api/quotes/${q.id}/contract/send`,
        {
          method: "POST",
        },
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          txt || `Kunne ikke sende kontrakt (HTTP ${res.status})`,
        );
      }

      setMsg("Kontrakt sendt ✅");
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke sende kontrakt");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Laster...</p>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Fant ikke pristilbud.</p>
        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  const badge = (status?: string) => {
    const s = (status ?? "DRAFT").toUpperCase();
    const base =
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";
    if (s === "SENT") return `${base} bg-emerald-50 text-emerald-700`;
    if (s === "ACCEPTED") return `${base} bg-blue-50 text-blue-700`;
    if (s === "DECLINED") return `${base} bg-red-50 text-red-700`;
    return `${base} bg-slate-100 text-slate-700`;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Pristilbud #{q.id}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={badge(q.status)}>
                {(q.status ?? "DRAFT").toUpperCase()}
              </span>
              <span className="text-sm text-slate-600">
                Kunde:{" "}
                <span className="font-semibold text-slate-900">
                  {q.kundeNavn}
                </span>
              </span>
              <span className="text-sm text-slate-500">
                · {fmtDate(q.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push("/quotes")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tilbake
            </button>

            <button
              onClick={() => router.push(`/quotes/${q.id}/edit`)}
              className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Rediger
            </button>

            <button
              onClick={downloadPdf}
              disabled={busy}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
            >
              {busy ? "Henter..." : "Last ned PDF"}
            </button>

            <button
              onClick={sendToCustomer}
              disabled={busy || !q.kundeEpost}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
              title={!q.kundeEpost ? "Kunde e-post mangler" : ""}
            >
              Send pristilbud
            </button>

            {/* ✅ NY: Send kontrakt */}
            <button
              onClick={sendContract}
              disabled={busy}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              Send kontrakt
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {msg && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {msg}
          </div>
        )}

        {/* Kunde + meta */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Detaljer</h2>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500">Kundenavn</div>
              <div className="font-semibold text-slate-900">{q.kundeNavn}</div>
            </div>

            <div>
              <div className="text-slate-500">Kunde e-post</div>
              <div className="font-medium text-slate-900">
                {q.kundeEpost ?? "—"}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Kunde telefon</div>
              <div className="font-medium text-slate-900">
                {q.kundeTelefon ?? "—"}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Gyldig til</div>
              <div className="font-medium text-slate-900">
                {q.validUntil ?? "—"}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Tittel</div>
              <div className="font-medium text-slate-900">{q.title ?? "—"}</div>
            </div>

            <div>
              <div className="text-slate-500">MVA</div>
              <div className="font-medium text-slate-900">
                {q.vatRate ?? 0}%
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-slate-500">Reply-To</div>
              <div className="font-medium text-slate-900">
                {(q as any).replyToEmail ?? "—"}
              </div>
            </div>
          </div>

          {q.message && (
            <div className="mt-4">
              <div className="text-slate-500 text-sm">Melding</div>
              <p className="mt-1 text-slate-800 whitespace-pre-line">
                {q.message}
              </p>
            </div>
          )}
        </div>

        {/* Linjer */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Linjer</h2>
          </div>

          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Beskrivelse
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Antall
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Enhet
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Pris (inkl)
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Sum (inkl)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {(q.lines ?? [])
                  .slice()
                  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                  .map((l, idx) => (
                    <tr key={l.id ?? idx} className="bg-white">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {l.name}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {l.qty ?? ""}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {l.unit ?? ""}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {fmtMoney(l.unitPrice ?? 0)} kr
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        {fmtMoney(lineTotal(l))} kr
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Oppsummering</h2>
          <div className="mt-3 text-sm text-slate-700 space-y-1">
            <div className="flex justify-between gap-3">
              <span>Sum eks. mva</span>
              <span className="font-semibold tabular-nums">
                {fmtMoney(totals.ex)} kr
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Mva ({q.vatRate ?? 0}%)</span>
              <span className="font-semibold tabular-nums">
                {fmtMoney(totals.vat)} kr
              </span>
            </div>
            <div className="flex justify-between gap-3 border-t border-slate-200 pt-2">
              <span className="font-semibold">Sum inkl. mva</span>
              <span className="font-bold tabular-nums">
                {fmtMoney(totals.inc)} kr
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
