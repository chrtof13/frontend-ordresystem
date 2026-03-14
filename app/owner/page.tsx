"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch } from "../lib/client";
import type { SubscriptionPlan } from "../lib/subscription";

type Tenant = {
  id: number;
  navn: string;
  status?: "ACTIVE" | "SUSPENDED";
  epost?: string | null;
  telefon?: string | null;
  createdAt?: string | null;
  subscriptionPlan?: SubscriptionPlan | null;

  // Nye felter for bedre owner-oversikt
  billingExempt?: boolean;
  stripeSubscriptionStatus?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
};

type User = {
  id: number;
  brukernavn: string;
  rolle: "OWNER" | "ADMIN" | "ANSATT";
  active: boolean;
  createdAt?: string | null;
  lastLoginAt?: string | null;
};

export default function OwnerPage() {
  const router = useRouter();

  const [firmaNavn, setFirmaNavn] = useState("");
  const [adminBrukernavn, setAdminBrukernavn] = useState("");
  const [adminPassord, setAdminPassord] = useState("");
  const [newTenantPlan, setNewTenantPlan] = useState<SubscriptionPlan>("BASIC");

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  const [q, setQ] = useState("");

  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const selectedTenant = useMemo(
    () => tenants.find((t) => t.id === selectedTenantId) ?? null,
    [tenants, selectedTenantId],
  );

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [updatingPlan, setUpdatingPlan] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [tempPassword, setTempPassword] = useState<{
    username: string;
    password: string;
  } | null>(null);

  async function refreshTenants(selectId?: number) {
    setError(null);
    setOk(null);
    setLoadingTenants(true);

    try {
      const res = await authedFetch(router, "/api/owner/tenants", {
        method: "GET",
      });
      const data = (await res.json()) as Tenant[];
      setTenants(data);

      if (selectId != null) {
        setSelectedTenantId(selectId);
      } else if (selectedTenantId != null) {
        const still = data.some((t) => t.id === selectedTenantId);
        if (!still) setSelectedTenantId(null);
      }
    } catch (e: any) {
      setError(e?.message || "Kunne ikke hente firmaer.");
    } finally {
      setLoadingTenants(false);
    }
  }

  useEffect(() => {
    refreshTenants().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshUsers(tenantId: number) {
    setError(null);
    setOk(null);
    setLoadingUsers(true);

    try {
      const res = await authedFetch(
        router,
        `/api/owner/tenants/${tenantId}/users`,
        {
          method: "GET",
        },
      );
      const data = (await res.json()) as User[];
      setUsers(data);
    } catch (e: any) {
      setError(e?.message || "Kunne ikke hente brukere.");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    if (selectedTenantId != null) {
      refreshUsers(selectedTenantId).catch(() => {});
    } else {
      setUsers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenantId]);

  async function createTenant() {
    setError(null);
    setOk(null);
    setTempPassword(null);

    if (!firmaNavn.trim() || !adminBrukernavn.trim() || !adminPassord.trim()) {
      setError("Fyll inn firmanavn, admin-brukernavn og admin-passord.");
      return;
    }

    setSaving(true);
    try {
      const res = await authedFetch(router, `/api/owner/tenants`, {
        method: "POST",
        body: JSON.stringify({
          firmaNavn: firmaNavn.trim(),
          adminBrukernavn: adminBrukernavn.trim(),
          adminPassord: adminPassord.trim(),
          subscriptionPlan: newTenantPlan,
        }),
      });

      const data = (await res.json()) as { id: number };
      setOk(`Firma opprettet ✅ (ID: ${data.id})`);

      setFirmaNavn("");
      setAdminBrukernavn("");
      setAdminPassord("");
      setNewTenantPlan("BASIC");

      await refreshTenants(data.id);
    } catch (e: any) {
      setError(e?.message || "Kunne ikke opprette firma.");
    } finally {
      setSaving(false);
    }
  }

  async function updateTenantSubscription(
    tenantId: number,
    subscriptionPlan: SubscriptionPlan,
  ) {
    setError(null);
    setOk(null);
    setUpdatingPlan(true);

    try {
      await authedFetch(router, `/api/owner/tenants/${tenantId}/subscription`, {
        method: "POST",
        body: JSON.stringify({ subscriptionPlan }),
      });

      setOk("Abonnement oppdatert ✅");
      await refreshTenants(tenantId);
    } catch (e: any) {
      setError(e?.message || "Kunne ikke oppdatere abonnement.");
    } finally {
      setUpdatingPlan(false);
    }
  }

  async function setTenantStatus(
    tenantId: number,
    status: "ACTIVE" | "SUSPENDED",
  ) {
    setError(null);
    setOk(null);

    try {
      await authedFetch(router, `/api/owner/tenants/${tenantId}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });

      setOk(status === "SUSPENDED" ? "Firma pauset ✅" : "Firma aktivert ✅");
      await refreshTenants(tenantId);
    } catch (e: any) {
      setError(e?.message || "Kunne ikke oppdatere firmastatus.");
    }
  }

  async function setUserActive(
    tenantId: number,
    userId: number,
    active: boolean,
  ) {
    setError(null);
    setOk(null);

    try {
      await authedFetch(
        router,
        `/api/owner/tenants/${tenantId}/users/${userId}/active`,
        {
          method: "POST",
          body: JSON.stringify({ active }),
        },
      );
      setOk(active ? "Bruker aktivert ✅" : "Bruker deaktivert ✅");
      await refreshUsers(tenantId);
    } catch (e: any) {
      setError(e?.message || "Kunne ikke oppdatere bruker.");
    }
  }

  async function resetUserPassword(tenantId: number, userId: number) {
    setError(null);
    setOk(null);
    setTempPassword(null);

    try {
      const res = await authedFetch(
        router,
        `/api/owner/tenants/${tenantId}/users/${userId}/reset-password`,
        { method: "POST" },
      );

      const data = (await res.json()) as {
        username: string;
        tempPassword: string;
      };

      setTempPassword({ username: data.username, password: data.tempPassword });
      setOk("Midlertidig passord generert ✅");
    } catch (e: any) {
      setError(e?.message || "Kunne ikke resette passord.");
    }
  }

  const filteredTenants = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tenants;

    return tenants.filter((t) => {
      return (
        String(t.id).includes(s) ||
        (t.navn || "").toLowerCase().includes(s) ||
        (t.epost || "").toLowerCase().includes(s) ||
        (t.telefon || "").toLowerCase().includes(s) ||
        (t.stripeSubscriptionStatus || "").toLowerCase().includes(s)
      );
    });
  }, [tenants, q]);

  function fmtDateTime(s?: string | null) {
    if (!s) return "Aldri";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "Aldri";
    return d.toLocaleString("nb-NO");
  }

  function fmtDate(s?: string | null) {
    if (!s) return "—";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("nb-NO");
  }

  const planLabel = (plan?: SubscriptionPlan | null) => {
    if (plan === "BEDRIFT") return "Bedrift";
    if (plan === "STANDARD") return "Standard";
    return "Basic";
  };

  const stripeStatusLabel = (status?: string | null) => {
    const s = (status || "").trim().toLowerCase();

    if (!s) return "Ingen";
    if (s === "active") return "Aktiv";
    if (s === "trialing") return "Prøveperiode";
    if (s === "canceled") return "Kansellert";
    if (s === "cancelled") return "Kansellert";
    if (s === "past_due") return "Forfalt";
    if (s === "unpaid") return "Ubetalt";
    if (s === "incomplete") return "Ufullført";
    if (s === "incomplete_expired") return "Utløpt";
    if (s === "paused") return "Pauset";
    return status ?? "Ukjent";
  };

  const hasActiveSubscription = (tenant?: Tenant | null) => {
    if (!tenant) return false;
    if (tenant.billingExempt) return true;

    const s = (tenant.stripeSubscriptionStatus || "").trim().toLowerCase();
    return s === "active" || s === "trialing";
  };

  const billingModeLabel = (tenant?: Tenant | null) => {
    if (!tenant) return "—";
    if (tenant.billingExempt) return "Gratis livstid";
    if (!tenant.stripeSubscriptionStatus) return "Ingen Stripe-status";
    return "Betalende kunde";
  };

  const listBadgeClass = (tenant?: Tenant | null) => {
    if (!tenant) return "bg-slate-100 text-slate-700";
    if (tenant.billingExempt) return "bg-violet-100 text-violet-700";
    if (hasActiveSubscription(tenant)) return "bg-emerald-100 text-emerald-700";
    return "bg-amber-100 text-amber-800";
  };

  const listBadgeText = (tenant?: Tenant | null) => {
    if (!tenant) return "Ukjent";
    if (tenant.billingExempt) return "Gratis";
    if (hasActiveSubscription(tenant)) return "Betaler";
    return "Ikke aktiv";
  };

  const card = "rounded-3xl border border-slate-200 bg-white shadow-sm";
  const sectionPad = "p-5 sm:p-6";
  const label = "text-sm font-semibold text-slate-700";
  const input =
    "mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:ring-2 focus:ring-slate-200";
  const subCard = "rounded-2xl border border-slate-200 bg-slate-50 p-4";

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              Owner Panel
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Full oversikt over firmaer, brukere, abonnement og Stripe-status.
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
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {ok && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {ok}
          </div>
        )}

        {tempPassword && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            Midlertidig passord for <b>{tempPassword.username}</b>:{" "}
            <span className="font-mono">{tempPassword.password}</span>
            <div className="mt-2 text-xs font-normal text-amber-800">
              Send dette sikkert til kunden, og be dem endre passord etter
              første innlogging.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className={[card, "xl:col-span-4"].join(" ")}>
            <div className={sectionPad}>
              <h2 className="text-lg font-semibold text-slate-900">
                Opprett nytt firma
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Lager firma og en ADMIN-bruker.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <div className={label}>Firmanavn</div>
                  <input
                    className={input}
                    value={firmaNavn}
                    onChange={(e) => setFirmaNavn(e.target.value)}
                    placeholder="F.eks. Termobygg AS"
                  />
                </div>

                <div>
                  <div className={label}>Admin brukernavn</div>
                  <input
                    className={input}
                    value={adminBrukernavn}
                    onChange={(e) => setAdminBrukernavn(e.target.value)}
                    placeholder="f.eks. termobygg"
                  />
                </div>

                <div>
                  <div className={label}>Admin passord</div>
                  <input
                    className={input}
                    type="password"
                    value={adminPassord}
                    onChange={(e) => setAdminPassord(e.target.value)}
                    placeholder="Sterkt passord"
                  />
                </div>

                <div>
                  <div className={label}>Abonnement</div>
                  <select
                    className={input}
                    value={newTenantPlan}
                    onChange={(e) =>
                      setNewTenantPlan(e.target.value as SubscriptionPlan)
                    }
                  >
                    <option value="BASIC">Basic</option>
                    <option value="STANDARD">Standard</option>
                    <option value="BEDRIFT">Bedrift</option>
                  </select>
                </div>

                <button
                  onClick={createTenant}
                  disabled={saving}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {saving ? "Oppretter..." : "Opprett firma"}
                </button>
              </div>
            </div>
          </section>

          <section className={[card, "xl:col-span-3"].join(" ")}>
            <div className={sectionPad}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Firmaer
                </h2>

                <button
                  onClick={() => refreshTenants(selectedTenantId ?? undefined)}
                  disabled={loadingTenants}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                >
                  {loadingTenants ? "Oppdaterer..." : "Oppdater"}
                </button>
              </div>

              <div className="mt-3">
                <input
                  className={input}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Søk på id, navn, e-post, telefon..."
                />
              </div>

              <div className="mt-4 space-y-2 max-h-[720px] overflow-auto pr-1">
                {filteredTenants.length === 0 ? (
                  <div className="text-sm text-slate-600">
                    Ingen firmaer funnet.
                  </div>
                ) : (
                  filteredTenants.map((t) => {
                    const active = t.id === selectedTenantId;
                    const status = t.status ?? "ACTIVE";

                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTenantId(t.id)}
                        className={[
                          "w-full text-left rounded-2xl border px-4 py-3 transition",
                          active
                            ? "border-slate-300 bg-slate-50"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {t.navn}
                            </div>
                            <div className="mt-1 text-xs text-slate-600">
                              ID: {t.id}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                              className={[
                                "text-[11px] font-semibold rounded-full px-2 py-1",
                                status === "SUSPENDED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-emerald-100 text-emerald-700",
                              ].join(" ")}
                            >
                              {status === "SUSPENDED" ? "Pauset" : "Aktiv"}
                            </span>

                            <span
                              className={[
                                "text-[11px] font-semibold rounded-full px-2 py-1",
                                listBadgeClass(t),
                              ].join(" ")}
                            >
                              {listBadgeText(t)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-slate-600">
                          Plan: {planLabel(t.subscriptionPlan)}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Stripe:{" "}
                          {stripeStatusLabel(t.stripeSubscriptionStatus)}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <section className={[card, "xl:col-span-5"].join(" ")}>
            <div className={sectionPad}>
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedTenant ? "Firmadetaljer" : "Velg et firma"}
              </h2>

              {!selectedTenant ? (
                <p className="mt-2 text-sm text-slate-600">
                  Klikk på et firma i listen for å se abonnement, Stripe-info og
                  brukere.
                </p>
              ) : (
                <>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={subCard}>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Firma
                      </div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">
                        {selectedTenant.navn}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        ID: {selectedTenant.id}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Opprettet: {fmtDate(selectedTenant.createdAt)}
                      </div>
                    </div>

                    <div className={subCard}>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Betalingsstatus
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            listBadgeClass(selectedTenant),
                          ].join(" ")}
                        >
                          {listBadgeText(selectedTenant)}
                        </span>

                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            (selectedTenant.status ?? "ACTIVE") === "SUSPENDED"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700",
                          ].join(" ")}
                        >
                          {(selectedTenant.status ?? "ACTIVE") === "SUSPENDED"
                            ? "Pauset"
                            : "Aktivt firma"}
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-slate-600">
                        Modus:{" "}
                        <span className="font-semibold text-slate-900">
                          {billingModeLabel(selectedTenant)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={subCard}>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Kontaktinfo
                      </div>
                      <div className="mt-2 text-sm text-slate-700 space-y-1">
                        <div>
                          E-post:{" "}
                          <span className="font-medium text-slate-900">
                            {selectedTenant.epost || "—"}
                          </span>
                        </div>
                        <div>
                          Telefon:{" "}
                          <span className="font-medium text-slate-900">
                            {selectedTenant.telefon || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={subCard}>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Abonnement
                      </div>

                      <div className="mt-2 text-sm text-slate-700 space-y-1">
                        <div>
                          Plan:{" "}
                          <span className="font-medium text-slate-900">
                            {planLabel(selectedTenant.subscriptionPlan)}
                          </span>
                        </div>

                        <div>
                          Stripe-status:{" "}
                          <span className="font-medium text-slate-900">
                            {stripeStatusLabel(
                              selectedTenant.stripeSubscriptionStatus,
                            )}
                          </span>
                        </div>

                        <div>
                          Gratis livstid:{" "}
                          <span className="font-medium text-slate-900">
                            {selectedTenant.billingExempt ? "Ja" : "Nei"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          Administrer abonnement
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          Her kan du endre plan manuelt for firmaet.
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {(selectedTenant.status ?? "ACTIVE") === "SUSPENDED" ? (
                          <button
                            onClick={() =>
                              setTenantStatus(selectedTenant.id, "ACTIVE")
                            }
                            className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                          >
                            Aktiver firma
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setTenantStatus(selectedTenant.id, "SUSPENDED")
                            }
                            className="rounded-xl bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                          >
                            Pause firma
                          </button>
                        )}

                        <button
                          onClick={() => refreshUsers(selectedTenant.id)}
                          disabled={loadingUsers}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                        >
                          {loadingUsers ? "Laster..." : "Oppdater brukere"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-semibold text-slate-700">
                        Velg plan
                      </div>
                      <div className="mt-2 flex gap-2">
                        <select
                          className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                          value={selectedTenant.subscriptionPlan ?? "BASIC"}
                          onChange={(e) =>
                            updateTenantSubscription(
                              selectedTenant.id,
                              e.target.value as SubscriptionPlan,
                            )
                          }
                          disabled={updatingPlan}
                        >
                          <option value="BASIC">Basic</option>
                          <option value="STANDARD">Standard</option>
                          <option value="BEDRIFT">Bedrift</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="font-semibold text-slate-700">
                          Stripe customer ID
                        </div>
                        <div className="mt-1 font-mono text-slate-600 break-all">
                          {selectedTenant.stripeCustomerId || "Ingen"}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="font-semibold text-slate-700">
                          Stripe subscription ID
                        </div>
                        <div className="mt-1 font-mono text-slate-600 break-all">
                          {selectedTenant.stripeSubscriptionId || "Ingen"}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-2">
                        <div className="font-semibold text-slate-700">
                          Stripe price ID
                        </div>
                        <div className="mt-1 font-mono text-slate-600 break-all">
                          {selectedTenant.stripePriceId || "Ingen"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      Gratis-firmaer kan ha tom Stripe-info, og det er helt
                      greit.
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-900">
                        Brukere ({users.length})
                      </div>
                    </div>

                    {loadingUsers ? (
                      <div className="mt-3 text-sm text-slate-600">
                        Laster...
                      </div>
                    ) : users.length === 0 ? (
                      <div className="mt-3 text-sm text-slate-600">
                        Ingen brukere funnet.
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {users.map((u) => (
                          <div
                            key={u.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {u.brukernavn}
                                </div>

                                <div className="mt-1 text-xs text-slate-600">
                                  ID: {u.id} • Rolle: {u.rolle} •{" "}
                                  {u.active ? "Aktiv" : "Deaktivert"}
                                </div>

                                <div className="mt-1 text-xs text-slate-500">
                                  Opprettet: {fmtDateTime(u.createdAt)}
                                </div>

                                <div className="mt-1 text-xs text-slate-500">
                                  Sist innlogget: {fmtDateTime(u.lastLoginAt)}
                                </div>
                              </div>

                              <span
                                className={[
                                  "text-xs font-semibold rounded-full px-2 py-1",
                                  u.active
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-700",
                                ].join(" ")}
                              >
                                {u.active ? "Aktiv" : "Av"}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {u.active ? (
                                <button
                                  onClick={() =>
                                    setUserActive(
                                      selectedTenant.id,
                                      u.id,
                                      false,
                                    )
                                  }
                                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                                >
                                  Deaktiver
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    setUserActive(selectedTenant.id, u.id, true)
                                  }
                                  className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                                >
                                  Aktiver
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  resetUserPassword(selectedTenant.id, u.id)
                                }
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                              >
                                Reset passord
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
