"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch } from "../../lib/client";
import type { SubscriptionPlan } from "../../lib/subscription";

type FirmaOverview = {
  id: number;
  navn: string;
  status: string;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
  userCount: number;
  stripeSubscriptionStatus?: string | null;
  hasStripeCustomer?: boolean;
};

type StripeUrlResponse = {
  url: string;
};

export default function CompanyBillingPage() {
  const router = useRouter();

  const [firma, setFirma] = useState<FirmaOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyPlan, setBusyPlan] = useState<SubscriptionPlan | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await authedFetch(router, "/api/firma/me");
      const data = (await res.json()) as FirmaOverview;
      setFirma(data);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke hente firma");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCheckout(plan: SubscriptionPlan) {
    setBusyPlan(plan);
    setError(null);

    try {
      const res = await authedFetch(
        router,
        `/api/billing/checkout-session?plan=${encodeURIComponent(plan)}`,
        {
          method: "POST",
        },
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          txt || `Kunne ikke opprette checkout (HTTP ${res.status})`,
        );
      }

      const data = (await res.json()) as StripeUrlResponse;
      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke starte Stripe Checkout");
      setBusyPlan(null);
    }
  }

  async function openPortal() {
    setPortalBusy(true);
    setError(null);

    try {
      const res = await authedFetch(router, "/api/billing/portal", {
        method: "POST",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Kunne ikke åpne portal (HTTP ${res.status})`);
      }

      const data = (await res.json()) as StripeUrlResponse;
      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke åpne Stripe-portalen");
    } finally {
      setPortalBusy(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-100 p-6">Laster...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Abonnement</h1>
            <p className="text-slate-600 mt-1">
              Administrer Stripe-abonnementet for firmaet ditt.
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-slate-900">
            {firma?.navn ?? "Firma"}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Nåværende plan: <b>{firma?.subscriptionPlan ?? "BASIC"}</b>
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Stripe-status: <b>{firma?.stripeSubscriptionStatus ?? "Ingen"}</b>
          </div>

          {(firma?.hasStripeCustomer || firma?.stripeSubscriptionStatus) && (
            <div className="mt-4">
              <button
                onClick={openPortal}
                disabled={portalBusy}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {portalBusy ? "Åpner..." : "Administrer i Stripe"}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlanCard
            title="Basic"
            price="349 kr / mnd"
            current={firma?.subscriptionPlan === "BASIC"}
            onClick={() => startCheckout("BASIC")}
            loading={busyPlan === "BASIC"}
            features={[
              "Opptil 2 brukere",
              "Oppdrag, timer, materialer",
              "Bilder og sluttrapport",
            ]}
          />

          <PlanCard
            title="Standard"
            price="599 kr / mnd"
            current={firma?.subscriptionPlan === "STANDARD"}
            recommended
            onClick={() => startCheckout("STANDARD")}
            loading={busyPlan === "STANDARD"}
            features={[
              "Alt i Basic",
              "Pristilbud",
              "Kontrakter",
              "PDF med firmalogo",
            ]}
          />

          <PlanCard
            title="Bedrift"
            price="899 kr / mnd"
            current={firma?.subscriptionPlan === "BEDRIFT"}
            onClick={() => startCheckout("BEDRIFT")}
            loading={busyPlan === "BEDRIFT"}
            features={[
              "Alt i Standard",
              "Opptil 10 brukere",
              "Prioritert support",
            ]}
          />
        </div>
      </main>
    </div>
  );
}

function PlanCard({
  title,
  price,
  current,
  recommended,
  loading,
  onClick,
  features,
}: {
  title: string;
  price: string;
  current?: boolean;
  recommended?: boolean;
  loading?: boolean;
  onClick: () => void;
  features: string[];
}) {
  return (
    <div
      className={[
        "rounded-3xl border bg-white p-6 shadow-sm",
        recommended
          ? "border-emerald-200 ring-2 ring-emerald-200"
          : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="mt-2 text-3xl font-semibold">{price}</div>
        </div>

        {recommended && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Anbefalt
          </span>
        )}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-slate-700">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        disabled={current || loading}
        className={[
          "mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
          current
            ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
            : "bg-slate-900 text-white hover:bg-slate-800",
        ].join(" ")}
      >
        {current ? "Nåværende plan" : loading ? "Sender..." : "Velg plan"}
      </button>
    </div>
  );
}
