"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type PublicQuote = {
  id: number;
  status: string; // DRAFT/SENT/ACCEPTED/DECLINED...
  title: string | null;
  kundeNavn: string | null;
  message: string | null;
  validUntil: string | null; // YYYY-MM-DD
  sumIncVat: number | null;
  vatRate: number | null; // 25
  customerDecision: "NONE" | "ACCEPTED" | "DECLINED" | string;
  publicTokenUsed: boolean;
};

function fmtMoney(n?: number | null) {
  const x = Number.isFinite(n as number) ? (n as number) : 0;
  return new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(x);
}

// Hvis backend/Next returnerer HTML 404/500, så ikke dump hele HTMLen i UI
function prettyError(txt: string) {
  if (!txt) return "Noe gikk galt.";
  const t = txt.trim();
  if (t.startsWith("<!DOCTYPE html") || t.startsWith("<html")) {
    return "Fant ikke tilbudet (lenken er ugyldig eller tilbudet finnes ikke).";
  }
  // ofte returnerer Spring: {"timestamp":...,"status":...,"error":...,"path":...}
  // men vi lar det stå som tekst hvis det ikke er HTML
  return t.length > 300 ? t.slice(0, 300) + "…" : t;
}

export default function OfferPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [offer, setOffer] = useState<PublicQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      const res = await fetch(`/api/public/quotes/${token}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          prettyError(txt) || `Kunne ikke hente tilbud (HTTP ${res.status})`,
        );
      }

      const data = (await res.json()) as PublicQuote;
      setOffer(data);
    } catch (e: any) {
      setOffer(null);
      setError(e?.message ?? "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function act(kind: "accept" | "decline") {
    if (!token) return;
    setBusy(true);
    setError(null);
    setMsg(null);

    try {
      const res = await fetch(`/api/public/quotes/${token}/${kind}`, {
        method: "POST",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          prettyError(txt) || `Kunne ikke sende svar (HTTP ${res.status})`,
        );
      }

      const updated = (await res.json()) as PublicQuote;
      setOffer(updated);

      if (kind === "accept") setMsg("Takk! Du har godtatt tilbudet ✅");
      else setMsg("OK. Du har avslått tilbudet ❌");
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke sende svar");
    } finally {
      setBusy(false);
    }
  }

  const disabled = useMemo(() => {
    if (busy) return true;
    if (!offer) return true;

    if (offer.publicTokenUsed) return true;

    // bare tillat svar når status = SENT
    if ((offer.status ?? "").toUpperCase() !== "SENT") return true;

    const d = (offer.customerDecision ?? "NONE").toUpperCase();
    if (d === "ACCEPTED" || d === "DECLINED") return true;

    return false;
  }, [busy, offer]);

  const decisionLabel = useMemo(() => {
    const d = (offer?.customerDecision ?? "NONE").toUpperCase();
    if (d === "ACCEPTED")
      return { text: "Godtatt", cls: "bg-emerald-50 text-emerald-700" };
    if (d === "DECLINED")
      return { text: "Avslått", cls: "bg-red-50 text-red-700" };
    return { text: "Ikke besvart", cls: "bg-slate-100 text-slate-700" };
  }, [offer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Laster tilbud…</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold">Tilbud</h1>
          <p className="mt-2 text-slate-600">Fant ikke tilbudet.</p>
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-3xl p-4 sm:p-8 space-y-5">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">
                {offer.title ?? "Pristilbud"}
              </h1>
              <p className="mt-2 text-slate-600">
                Tilbud #{offer.id} · Kunde:{" "}
                <span className="font-semibold text-slate-900">
                  {offer.kundeNavn ?? "—"}
                </span>
              </p>
            </div>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${decisionLabel.cls}`}
            >
              {decisionLabel.text}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500">Gyldig til</div>
              <div className="font-medium text-slate-900">
                {offer.validUntil ?? "—"}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Sum (inkl. mva)</div>
              <div className="font-bold text-slate-900 tabular-nums">
                {fmtMoney(offer.sumIncVat)} kr
              </div>
            </div>
          </div>

          {offer.message && (
            <div className="mt-5">
              <div className="text-slate-500 text-sm">Melding</div>
              <p className="mt-1 text-slate-800 whitespace-pre-line">
                {offer.message}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {msg && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {msg}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              disabled={disabled}
              onClick={() => act("accept")}
              className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {busy ? "Sender..." : "Godta tilbud"}
            </button>

            <button
              disabled={disabled}
              onClick={() => act("decline")}
              className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {busy ? "Sender..." : "Avslå tilbud"}
            </button>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Hvis du allerede har svart, vil knappene være deaktivert.
          </div>
        </div>

        <div className="text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} Ordrebase
        </div>
      </main>
    </div>
  );
}
