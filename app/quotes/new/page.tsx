"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import QuoteEditor from "../../components/QuoteEditor";
import type { Quote } from "../../lib/quoteTypes";
import { newEmptyQuote } from "../../lib/quoteUtils";
import { normalizeQuote } from "../../lib/quoteNormalize";
import { authedFetch } from "../../lib/client";

export default function QuoteNewPage() {
  const router = useRouter();

  const [q, setQ] = useState<Quote>(() => newEmptyQuote());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    if (!String(q.kundeNavn ?? "").trim()) return false;
    if (!Array.isArray(q.lines) || q.lines.length === 0) return false;
    if (q.lines.some((l) => !String(l.name ?? "").trim())) return false;
    return true;
  }, [q]);

  async function save() {
    setSaving(true);
    setError(null);

    try {
      // 1) Lag tomt draft (backend ignorerer body uansett)
      const createRes = await authedFetch(router, "/api/quotes", {
        method: "POST",
      });

      if (!createRes.ok) {
        const txt = await createRes.text().catch(() => "");
        throw new Error(
          txt || `Kunne ikke opprette draft (HTTP ${createRes.status})`,
        );
      }

      const created = await createRes.json(); // { id: number }
      const id = created?.id;
      if (!id) throw new Error("Backend returnerte ikke id ved opprettelse");

      // 2) Lagre innholdet med PUT
      const updateRes = await authedFetch(router, `/api/quotes/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          kundeNavn: q.kundeNavn?.trim() || null,
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

      if (!updateRes.ok) {
        const txt = await updateRes.text().catch(() => "");
        throw new Error(txt || `Kunne ikke lagre (HTTP ${updateRes.status})`);
      }

      const savedRaw = await updateRes.json();
      const saved = normalizeQuote(savedRaw);

      router.replace(`/quotes/${saved.id}`);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke lagre pristilbud");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-5xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Nytt pristilbud
            </h1>
            <p className="text-slate-600 mt-1">
              Lagre først, så kan du sende PDF til kunde etterpå.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/quotes")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tilbake
            </button>

            <button
              onClick={save}
              disabled={saving || !canSave}
              className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
            >
              {saving ? "Lagrer..." : "Lagre pristilbud"}
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
