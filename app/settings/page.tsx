"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch, changePassword } from "../lib/client";
import type { SubscriptionPlan } from "../lib/subscription";

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

export default function SettingsPage() {
  const router = useRouter();

  const [firma, setFirma] = useState<FirmaOverview | null>(null);
  const [loadingFirma, setLoadingFirma] = useState(true);

  const [busyPlan, setBusyPlan] = useState<SubscriptionPlan | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);

  const [billingError, setBillingError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);

  async function loadFirma() {
    setLoadingFirma(true);
    setBillingError(null);

    try {
      const res = await authedFetch(router, "/api/firma/me");
      const data = (await res.json()) as FirmaOverview;
      setFirma(data);
    } catch (e: any) {
      setBillingError(e?.message ?? "Kunne ikke hente firma");
    } finally {
      setLoadingFirma(false);
    }
  }

  useEffect(() => {
    loadFirma();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCheckout(plan: SubscriptionPlan) {
    setBusyPlan(plan);
    setBillingError(null);

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

      if (!data?.url) {
        throw new Error("Mangler Stripe-url fra server");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setBillingError(e?.message ?? "Kunne ikke starte Stripe Checkout");
      setBusyPlan(null);
    }
  }

  async function openPortal() {
    setPortalBusy(true);
    setBillingError(null);

    try {
      const res = await authedFetch(router, "/api/billing/portal", {
        method: "POST",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Kunne ikke åpne portal (HTTP ${res.status})`);
      }

      const data = (await res.json()) as StripeUrlResponse;

      if (!data?.url) {
        throw new Error("Mangler portal-url fra server");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setBillingError(e?.message ?? "Kunne ikke åpne Stripe-portalen");
    } finally {
      setPortalBusy(false);
    }
  }

  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordErr(null);

    if (newPassword.length < 8) {
      setPasswordErr("Nytt passord må være minst 8 tegn.");
      return;
    }

    if (newPassword !== confirm) {
      setPasswordErr("Passordene matcher ikke.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(router, currentPassword, newPassword);

      setPasswordMsg("Passord oppdatert.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (e: any) {
      setPasswordErr(e?.message || "Noe gikk galt.");
    } finally {
      setPasswordLoading(false);
    }
  }

  if (loadingFirma) {
    return <div className="min-h-screen bg-slate-100 p-6">Laster...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              Innstillinger
            </h1>
            <p className="mt-1 text-slate-600">
              Administrer abonnement og sikkerhet for kontoen din.
            </p>
          </div>

          <button
            onClick={() => router.push("/home")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Hjem
          </button>
        </div>

        {billingError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {billingError}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Abonnement
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                {firma?.navn ?? "Firma"}
              </h2>
              <p className="mt-2 text-slate-600">
                Nåværende plan:{" "}
                <span className="font-semibold text-slate-900">
                  {firma?.subscriptionPlan ?? "BASIC"}
                </span>
              </p>
              <p className="mt-1 text-slate-600">
                Stripe-status:{" "}
                <span className="font-semibold text-slate-900">
                  {firma?.stripeSubscriptionStatus ?? "Ingen"}
                </span>
              </p>
              <p className="mt-1 text-slate-600">
                Antall brukere:{" "}
                <span className="font-semibold text-slate-900">
                  {firma?.userCount ?? 0}
                </span>
              </p>
            </div>

            {(firma?.hasStripeCustomer || firma?.stripeSubscriptionStatus) && (
              <div className="shrink-0">
                <button
                  onClick={openPortal}
                  disabled={portalBusy}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {portalBusy ? "Åpner..." : "Administrer i Stripe"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <PlanCard
              title="Basic"
              price="349 kr / mnd"
              current={firma?.subscriptionPlan === "BASIC"}
              onClick={() => startCheckout("BASIC")}
              loading={busyPlan === "BASIC"}
              features={[
                "Opptil 2 brukere",
                "Oppdrag, timer og materialer",
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
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Sikkerhet
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Endre passord
            </h2>
            <p className="mt-1 text-slate-600">
              Oppdater passordet ditt for å holde kontoen trygg.
            </p>
          </div>

          <form
            onSubmit={onSubmitPassword}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Gammelt passord
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:ring-2 focus:ring-slate-200"
                required
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Nytt passord
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:ring-2 focus:ring-slate-200"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-slate-500">Minst 8 tegn.</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Bekreft nytt passord
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:ring-2 focus:ring-slate-200"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {passwordErr && (
              <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {passwordErr}
              </div>
            )}

            {passwordMsg && (
              <div className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {passwordMsg}
              </div>
            )}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="rounded-2xl bg-[#2f5f8f] px-5 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
              >
                {passwordLoading ? "Lagrer..." : "Oppdater passord"}
              </button>
            </div>
          </form>
        </section>
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
        "rounded-3xl border bg-white p-6 shadow-sm transition-all",
        recommended
          ? "border-emerald-200 ring-2 ring-emerald-200"
          : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {price}
          </div>
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
