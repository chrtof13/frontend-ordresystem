"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type PublicQuote = {
  id: number;
  status: string;
  title: string | null;
  kundeNavn: string | null;
  message: string | null;
  validUntil: string | null;
  sumIncVat: number | null;
  vatRate: number | null;
  customerDecision: "NONE" | "ACCEPTED" | "DECLINED";
  tokenUsed: boolean;
};

const API = "https://backend-ordresystem.onrender.com";

function fmtMoney(n?: number | null) {
  const x = Number.isFinite(n as number) ? (n as number) : 0;
  return new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(x);
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

    try {
      const res = await fetch(`${API}/api/public/quotes/${token}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Fant ikke tilbudet.");
      }

      const data = (await res.json()) as PublicQuote;
      setOffer(data);
    } catch (e: any) {
      setError(e.message ?? "Noe gikk galt.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function act(type: "accept" | "decline") {
    if (!token) return;

    setBusy(true);
    setError(null);
    setMsg(null);

    try {
      const res = await fetch(`${API}/api/public/quotes/${token}/${type}`, {
        method: "POST",
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Kunne ikke sende svar.");
      }

      const updated = (await res.json()) as PublicQuote;
      setOffer(updated);

      if (type === "accept") {
        setMsg("Takk! Du har godtatt tilbudet.");
      } else {
        setMsg("Du har avslått tilbudet.");
      }
    } catch (e: any) {
      setError(e.message ?? "Kunne ikke sende svar.");
    } finally {
      setBusy(false);
    }
  }

  const disabled = useMemo(() => {
    if (busy) return true;
    if (!offer) return true;
    if (offer.tokenUsed) return true;

    const d = offer.customerDecision;
    if (d === "ACCEPTED" || d === "DECLINED") return true;

    return false;
  }, [busy, offer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">Laster tilbud...</div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <h1 className="text-2xl font-semibold">Tilbud</h1>
        <p className="mt-3 text-red-600">{error ?? "Fant ikke tilbudet."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-3xl p-6 space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-semibold">
            {offer.title ?? "Pristilbud"}
          </h1>

          <p className="text-slate-600 mt-2">
            Kunde: <b>{offer.kundeNavn ?? "—"}</b>
          </p>

          <div className="mt-5">
            <div className="text-slate-500 text-sm">Sum (inkl. mva)</div>
            <div className="text-2xl font-bold">
              {fmtMoney(offer.sumIncVat)} kr
            </div>
          </div>

          {offer.message && (
            <div className="mt-6">
              <div className="text-sm text-slate-500">Melding</div>
              <p className="mt-2 whitespace-pre-line">{offer.message}</p>
            </div>
          )}

          {msg && (
            <div className="mt-6 text-green-700 bg-green-50 border border-green-200 rounded p-3">
              {msg}
            </div>
          )}

          {error && (
            <div className="mt-6 text-red-700 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              disabled={disabled}
              onClick={() => act("accept")}
              className="flex-1 bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50"
            >
              {busy ? "Sender..." : "Godta tilbud"}
            </button>

            <button
              disabled={disabled}
              onClick={() => act("decline")}
              className="flex-1 border border-red-200 text-red-700 py-3 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50"
            >
              {busy ? "Sender..." : "Avslå tilbud"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
