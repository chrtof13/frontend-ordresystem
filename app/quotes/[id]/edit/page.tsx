"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QuoteEditor from "../../../components/QuoteEditor";
import type { Quote } from "../../../lib/quoteTypes";
import { authedFetch } from "../../../lib/client";

export default function QuoteEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [q, setQ] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch(router, `/api/quotes/${id}`);
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

  async function save() {
    if (!q) return;
    setSaving(true);
    setError(null);
    setMsg(null);

    try {
      await authedFetch(router, `/api/quotes/${id}`, {
        method: "PUT",
        body: JSON.stringify(q),
      });

      setMsg("Lagret ✅");
      // refresh
      await load();
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
      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Rediger pristilbud
            </h1>
            <p className="text-slate-600 mt-1">#{q.id}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/quotes/${q.id}`)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tilbake
            </button>

            <button
              onClick={save}
              disabled={saving}
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
        {msg && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {msg}
          </div>
        )}

        <QuoteEditor value={q} onChange={setQ} disabled={saving} />
      </main>
    </div>
  );
}
