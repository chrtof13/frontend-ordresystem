"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuoteEditor from "../../components/QuoteEditor";
import { newEmptyQuote } from "../../lib/quoteUtils";
import type { Quote } from "../../lib/quoteTypes";
import { authedFetch } from "../../lib/client";

export default function QuoteNewPage() {
  const router = useRouter();

  const [q, setQ] = useState<Quote>(() => newEmptyQuote());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setSaving(true);
    setError(null);

    try {
      const res = await authedFetch(router, "/api/quotes", {
        method: "POST",
        body: JSON.stringify(q),
      });

      // backend kan returnere Quote eller bare id – håndter begge
      const txt = await res.text();
      let id: number | null = null;
      try {
        const json = JSON.parse(txt);
        id = typeof json === "number" ? json : (json?.id ?? null);
      } catch {
        // fallback: prøv parse som number
        const maybe = Number(txt);
        id = Number.isFinite(maybe) ? maybe : null;
      }

      if (!id) throw new Error("Kunne ikke lese ID fra serverrespons.");

      router.replace(`/quotes/${id}`);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke opprette pristilbud");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Nytt pristilbud
            </h1>
            <p className="text-slate-600 mt-1">
              Lagre først, så kan du sende PDF til kunde etterpå.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/quotes")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tilbake
            </button>

            <button
              onClick={create}
              disabled={saving}
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
