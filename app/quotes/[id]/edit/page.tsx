"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import QuoteEditor from "../../../components/QuoteEditor";
import type { Quote } from "../../../lib/quoteTypes";
import { normalizeQuote } from "../../../lib/quoteNormalize";
import { authedFetch } from "../../../lib/client";

export default function QuoteEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [q, setQ] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    if (!q) return false;
    if (!String(q.kundeNavn ?? "").trim()) return false;
    if (!Array.isArray(q.lines) || q.lines.length === 0) return false;
    if (q.lines.some((l) => !String(l.name ?? "").trim())) return false;
    return true;
  }, [q]);

  const canSendContract = (q?.status ?? "").toUpperCase() === "ACCEPTED";

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch(router, `/api/quotes/${id}`);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Kunne ikke hente tilbud (HTTP ${res.status})`);
      }
      const raw = await res.json();
      setQ(normalizeQuote(raw));
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }
  async function sendContract() {
    if (!q?.id) return;
    setSaving(true);
    setError(null);

    try {
      await authedFetch(router, `/api/quotes/${q.id}/send-contract`, {
        method: "POST",
      });

      alert("Kontrakt sendt ✅");
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke sende kontrakt");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    if (!q) return;
    setSaving(true);
    setError(null);

    try {
      const res = await authedFetch(router, `/api/quotes/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          kundeNavn: q.kundeNavn?.trim(),
          kundeEpost: q.kundeEpost?.trim() || null,
          kundeTelefon: q.kundeTelefon?.trim() || null,
          title: q.title?.trim() || null,
          replyToEmail: q.replyToEmail?.trim() || null,
          message: q.message || null,
          vatRate: q.vatRate ?? 25,
          validUntil: q.validUntil || null,
          lines: (q.lines ?? []).map((l, idx) => ({
            id: l.id ?? undefined,
            type: l.type ?? "WORK",
            name: String(l.name ?? ""),
            qty: l.qty ?? 1,
            unit: l.unit ?? "stk",
            unitPrice: l.unitPrice ?? 0,
            sortOrder: Number.isFinite(l.sortOrder) ? l.sortOrder : idx,
          })),
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Kunne ikke lagre (HTTP ${res.status})`);
      }

      const savedRaw = await res.json();
      setQ(normalizeQuote(savedRaw));
      router.replace(`/quotes/${id}`);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke lagre");
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-5xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Rediger pristilbud
            </h1>
            <p className="text-slate-600 mt-1">#{q.id}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/quotes/${id}`)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tilbake
            </button>
            <button
              onClick={sendContract}
              disabled={saving || !canSendContract}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              title={!canSendContract ? "Kunden må godta tilbudet først" : ""}
            >
              Send kontrakt (PDF)
            </button>

            <button
              onClick={save}
              disabled={saving || !canSave}
              className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
            >
              {saving ? "Lagrer..." : "Lagre"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <QuoteEditor value={q} onChange={setQ} disabled={saving} />
      </main>
    </div>
  );
}
