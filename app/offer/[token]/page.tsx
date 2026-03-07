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

function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusBadge(status?: string | null) {
  const s = (status ?? "DRAFT").toUpperCase();

  if (s === "ACCEPTED") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
  if (s === "DECLINED") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }
  if (s === "SENT") {
    return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function getDecisionText(offer: PublicQuote | null) {
  if (!offer) return null;
  if (offer.customerDecision === "ACCEPTED") return "Tilbudet er godkjent";
  if (offer.customerDecision === "DECLINED") return "Tilbudet er avslått";
  return "Venter på svar";
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
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Fant ikke tilbudet.");
      }

      const data = (await res.json()) as PublicQuote;
      setOffer(data);
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt.");
      setOffer(null);
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
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Kunne ikke sende svar.");
      }

      const updated = (await res.json()) as PublicQuote;
      setOffer(updated);

      if (type === "accept") {
        setMsg("Takk! Tilbudet er nå registrert som godkjent.");
      } else {
        setMsg("Tilbudet er registrert som avslått.");
      }
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke sende svar.");
    } finally {
      setBusy(false);
    }
  }

  const disabled = useMemo(() => {
    if (busy) return true;
    if (!offer) return true;
    if (offer.tokenUsed) return true;
    if (offer.customerDecision === "ACCEPTED") return true;
    if (offer.customerDecision === "DECLINED") return true;
    return false;
  }, [busy, offer]);

  const expired = useMemo(() => {
    if (!offer?.validUntil) return false;
    const d = new Date(offer.validUntil);
    if (Number.isNaN(d.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    return d < today;
  }, [offer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-5 w-32 rounded bg-slate-200" />
            <div className="mt-4 h-10 w-72 rounded bg-slate-200" />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="h-24 rounded-2xl bg-slate-100" />
              <div className="h-24 rounded-2xl bg-slate-100" />
              <div className="h-24 rounded-2xl bg-slate-100" />
            </div>
            <div className="mt-8 h-40 rounded-2xl bg-slate-100" />
          </div>
        </main>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-100">
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 ring-1 ring-red-200">
              Tilbud utilgjengelig
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Vi fant ikke tilbudet
            </h1>
            <p className="mt-3 text-slate-600">
              Lenken kan være ugyldig, utløpt eller allerede brukt.
            </p>
            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-medium text-slate-300">
                  Ordrebase • Pristilbud
                </div>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {offer.title ?? "Pristilbud"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Her kan du gå gjennom tilbudet og velge om du ønsker å godta
                  eller avslå det.
                </p>
              </div>

              <div
                className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusBadge(
                  offer.status,
                )}`}
              >
                {getDecisionText(offer)}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Kunde</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {offer.kundeNavn ?? "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Gyldig til</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {fmtDate(offer.validUntil)}
                </div>
                {expired && (
                  <div className="mt-2 text-sm font-medium text-red-600">
                    Tilbudet er utløpt
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Sum inkl. mva</div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {fmtMoney(offer.sumIncVat)} kr
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  MVA: {offer.vatRate ?? 0}%
                </div>
              </div>
            </div>

            {offer.message && (
              <section className="mt-8">
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="text-lg font-semibold">Beskrivelse</h2>
                  </div>
                  <div className="px-5 py-5">
                    <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700">
                      {offer.message}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {msg && (
              <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                {msg}
              </div>
            )}

            {error && (
              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Svar på tilbud</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Når du velger et alternativ under, registreres svaret ditt på
                tilbudet. Dette kan normalt ikke angres senere.
              </p>

              {(offer.customerDecision === "ACCEPTED" || offer.tokenUsed) && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Dette tilbudet er allerede godkjent.
                </div>
              )}

              {offer.customerDecision === "DECLINED" && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Dette tilbudet er allerede avslått.
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  disabled={disabled || expired}
                  onClick={() => act("accept")}
                  className="flex-1 rounded-2xl bg-emerald-700 px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Sender..." : "Godta tilbud"}
                </button>

                <button
                  disabled={disabled || expired}
                  onClick={() => act("decline")}
                  className="flex-1 rounded-2xl border border-red-200 bg-white px-5 py-4 text-base font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Sender..." : "Avslå tilbud"}
                </button>
              </div>

              {expired && (
                <p className="mt-4 text-sm font-medium text-red-600">
                  Tilbudet er utløpt og kan ikke lenger besvares.
                </p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
