"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authedFetch,
  changePassword,
  isAdmin,
  isOwner,
} from "../../lib/client";
import type { SubscriptionPlan } from "../../lib/subscription";

type FirmaUser = {
  id: number;
  navn: string;
  rolle: "OWNER" | "ADMIN" | "ANSATT" | string;
  aktiv?: boolean;
  active?: boolean;
  createdAt?: string | null;
};

type FirmaOverview = {
  id: number;
  navn: string;
  status: string;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
  userCount?: number;
  antallBrukere?: number;
  brukere: FirmaUser[];
  stripeSubscriptionStatus?: string | null;
  hasStripeCustomer?: boolean;
};

type InviteUserRequest = {
  email: string;
};

type StripeUrlResponse = {
  url: string;
};

const roleLabel = (r: string) => {
  const x = (r || "").toUpperCase();
  if (x === "OWNER") return "Owner";
  if (x === "ADMIN") return "Admin";
  return "Ansatt";
};

const statusLabel = (s?: string | null) => {
  const x = (s || "").toUpperCase();
  if (!x) return "—";
  if (x === "ACTIVE") return "Aktiv";
  if (x === "SUSPENDED") return "Pauset";
  if (x === "INACTIVE") return "Inaktiv";
  return x;
};

const planLabel = (plan?: SubscriptionPlan | null) => {
  if (plan === "STANDARD") return "Standard";
  if (plan === "BEDRIFT") return "Bedrift";
  return "Basic";
};

const maxUsersForPlan = (plan?: SubscriptionPlan | null) => {
  if (plan === "STANDARD") return 5;
  if (plan === "BEDRIFT") return 10;
  return 2;
};

export default function CompanySettingsPage() {
  const router = useRouter();

  const [data, setData] = useState<FirmaOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const [newUsername, setNewUsername] = useState("");
  const [newEmployeePassword, setNewEmployeePassword] = useState("");
  const [creatingEmployee, setCreatingEmployee] = useState(false);

  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  const [busyPlan, setBusyPlan] = useState<SubscriptionPlan | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  const safeIsAdmin = () => {
    try {
      return isAdmin();
    } catch {
      return false;
    }
  };

  const safeIsOwner = () => {
    try {
      return isOwner();
    } catch {
      return false;
    }
  };

  const canManageUsers = safeIsAdmin() || safeIsOwner();

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await authedFetch(router, "/api/firma/me");
      const json = (await res.json()) as FirmaOverview;
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke hente firmadata");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const created = useMemo(() => {
    if (!data?.createdAt) return "—";
    try {
      return new Date(data.createdAt).toLocaleDateString("nb-NO");
    } catch {
      return "—";
    }
  }, [data?.createdAt]);

  const activeUserCount = useMemo(() => {
    if (!data?.brukere) return 0;
    return data.brukere.filter((u) => u.aktiv ?? u.active ?? false).length;
  }, [data?.brukere]);

  const maxUsers = useMemo(() => {
    return maxUsersForPlan(data?.subscriptionPlan);
  }, [data?.subscriptionPlan]);

  const userLimitReached = activeUserCount >= maxUsers;

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  async function invite() {
    const email = inviteEmail.trim();
    if (!email) return;

    resetMessages();
    setInviting(true);

    try {
      await authedFetch(router, "/api/firma/invite", {
        method: "POST",
        body: JSON.stringify({ email } satisfies InviteUserRequest),
      });

      setInviteEmail("");
      setSuccess("Invitasjon sendt.");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke sende invitasjon");
    } finally {
      setInviting(false);
    }
  }

  async function createEmployee() {
    const brukernavn = newUsername.trim();
    const passord = newEmployeePassword;

    resetMessages();

    if (!brukernavn) {
      setError("Brukernavn mangler.");
      return;
    }

    if (!passord || passord.length < 6) {
      setError("Passord må være minst 6 tegn.");
      return;
    }

    setCreatingEmployee(true);

    try {
      const res = await authedFetch(router, "/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ brukernavn, passord }),
      });

      const id = (await res.json()) as number;

      setNewUsername("");
      setNewEmployeePassword("");
      setSuccess(`Ansatt opprettet (id=${id}).`);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke opprette ansatt");
    } finally {
      setCreatingEmployee(false);
    }
  }

  async function changeRole(userId: number, rolle: "ANSATT" | "ADMIN") {
    if (!data) return;

    resetMessages();
    setBusyUserId(userId);

    try {
      await authedFetch(
        router,
        `/api/firma/users/${userId}/role?rolle=${encodeURIComponent(rolle)}`,
        { method: "POST" },
      );

      setData({
        ...data,
        brukere: data.brukere.map((u) =>
          u.id === userId ? { ...u, rolle } : u,
        ),
      });

      setSuccess("Rolle oppdatert.");
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke oppdatere rolle");
      await load();
    } finally {
      setBusyUserId(null);
    }
  }

  async function deactivateUser(userId: number) {
    if (!data) return;

    const ok = window.confirm("Deaktivere bruker?");
    if (!ok) return;

    resetMessages();
    setBusyUserId(userId);

    try {
      await authedFetch(router, `/api/firma/users/${userId}/deactivate`, {
        method: "POST",
      });

      setData({
        ...data,
        brukere: data.brukere.map((u) =>
          u.id === userId ? { ...u, aktiv: false, active: false } : u,
        ),
      });

      setSuccess("Bruker deaktivert.");
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke deaktivere bruker");
      await load();
    } finally {
      setBusyUserId(null);
    }
  }

  async function startCheckout(plan: SubscriptionPlan) {
    resetMessages();
    setBusyPlan(plan);

    try {
      const res = await authedFetch(
        router,
        `/api/billing/checkout-session?plan=${encodeURIComponent(plan)}`,
        { method: "POST" },
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          txt || `Kunne ikke opprette checkout (HTTP ${res.status})`,
        );
      }

      const stripe = (await res.json()) as StripeUrlResponse;
      window.location.href = stripe.url;
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke starte Stripe Checkout");
      setBusyPlan(null);
    }
  }

  async function openPortal() {
    resetMessages();
    setPortalBusy(true);

    try {
      const res = await authedFetch(router, "/api/billing/portal", {
        method: "POST",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Kunne ikke åpne portal (HTTP ${res.status})`);
      }

      const stripe = (await res.json()) as StripeUrlResponse;
      window.location.href = stripe.url;
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke åpne Stripe-portalen");
    } finally {
      setPortalBusy(false);
    }
  }

  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();

    if (newPassword.length < 8) {
      setError("Nytt passord må være minst 8 tegn.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passordene matcher ikke.");
      return;
    }

    setPasswordBusy(true);

    try {
      await changePassword(router, currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Passord oppdatert.");
    } catch (e: any) {
      setError(e?.message || "Kunne ikke oppdatere passord");
    } finally {
      setPasswordBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Laster...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Fant ikke firmadata.</p>
        {error && <Alert tone="error">{error}</Alert>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Firma og innstillinger
            </h1>
            <p className="mt-1 text-slate-600">
              Administrer firma, brukere, abonnement og sikkerhet på ett sted.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/home")}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ← Hjem
          </button>
        </div>

        {error && <Alert tone="error">{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}

        {userLimitReached && (
          <Alert tone="warning">
            Dere har {activeUserCount} aktive brukere, men abonnementet{" "}
            <span className="font-semibold">
              {planLabel(data.subscriptionPlan)}
            </span>{" "}
            tillater maks {maxUsers}. Deaktiver en bruker eller oppgrader
            abonnementet for å legge til flere.
          </Alert>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard title="Firmanavn" value={data.navn} />
          <StatCard
            title="Abonnement"
            value={planLabel(data.subscriptionPlan)}
          />
          <StatCard
            title="Aktive brukere"
            value={`${activeUserCount} / ${maxUsers}`}
          />
          <StatCard
            title="Status"
            value={statusLabel(data.status)}
            sub={`Opprettet ${created}`}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <Card
              title="Brukere i firma"
              description="Oversikt over ansatte, roller og status."
            >
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">
                        Navn
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">
                        Rolle
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">
                        Status
                      </th>
                      {canManageUsers && (
                        <th className="px-4 py-3 text-right font-semibold text-slate-700">
                          Handling
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {data.brukere.map((u) => {
                      const isActive = u.aktiv ?? u.active ?? false;

                      return (
                        <tr key={u.id} className="bg-white">
                          <td className="px-4 py-4 font-semibold text-slate-900">
                            {u.navn}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Chip>{roleLabel(u.rolle)}</Chip>

                              {canManageUsers && (
                                <>
                                  <MiniButton
                                    disabled={busyUserId === u.id}
                                    onClick={() => changeRole(u.id, "ANSATT")}
                                  >
                                    Ansatt
                                  </MiniButton>
                                  <MiniButton
                                    disabled={busyUserId === u.id}
                                    onClick={() => changeRole(u.id, "ADMIN")}
                                  >
                                    Admin
                                  </MiniButton>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {isActive ? (
                              <StatusPill tone="success">Aktiv</StatusPill>
                            ) : (
                              <StatusPill tone="danger">Deaktivert</StatusPill>
                            )}
                          </td>

                          {canManageUsers && (
                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => deactivateUser(u.id)}
                                disabled={busyUserId === u.id || !isActive}
                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Deaktiver
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {data.brukere.map((u) => {
                  const isActive = u.aktiv ?? u.active ?? false;

                  return (
                    <div
                      key={u.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="font-semibold text-slate-900">
                        {u.navn}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Chip>{roleLabel(u.rolle)}</Chip>
                        {isActive ? (
                          <StatusPill tone="success">Aktiv</StatusPill>
                        ) : (
                          <StatusPill tone="danger">Deaktivert</StatusPill>
                        )}
                      </div>

                      {canManageUsers && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <MiniButton
                            disabled={busyUserId === u.id}
                            onClick={() => changeRole(u.id, "ANSATT")}
                          >
                            Ansatt
                          </MiniButton>
                          <MiniButton
                            disabled={busyUserId === u.id}
                            onClick={() => changeRole(u.id, "ADMIN")}
                          >
                            Admin
                          </MiniButton>
                          <button
                            type="button"
                            onClick={() => deactivateUser(u.id)}
                            disabled={busyUserId === u.id || !isActive}
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Deaktiver
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card
                title="Inviter ansatt"
                description="Send registreringslink på e-post."
              >
                {!canManageUsers ? (
                  <p className="text-sm text-slate-600">
                    Du må være <span className="font-semibold">Admin</span>{" "}
                    eller <span className="font-semibold">Owner</span> for å
                    invitere brukere.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <Field label="E-post">
                      <input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="navn@firma.no"
                        className={inputClass}
                        inputMode="email"
                        disabled={userLimitReached}
                      />
                    </Field>

                    <button
                      type="button"
                      onClick={invite}
                      disabled={
                        inviting || !inviteEmail.trim() || userLimitReached
                      }
                      className={primaryButtonClass}
                    >
                      {inviting ? "Sender..." : "Send invitasjon"}
                    </button>
                  </div>
                )}
              </Card>

              <Card
                title="Opprett ansatt"
                description="Lag bruker direkte i firmaet."
              >
                {!canManageUsers ? (
                  <p className="text-sm text-slate-600">
                    Du må være <span className="font-semibold">Admin</span>{" "}
                    eller <span className="font-semibold">Owner</span> for å
                    opprette ansatte.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <Field label="Brukernavn">
                      <input
                        className={inputClass}
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="f.eks. ola"
                        disabled={userLimitReached}
                      />
                    </Field>

                    <Field label="Passord">
                      <input
                        className={inputClass}
                        type="password"
                        value={newEmployeePassword}
                        onChange={(e) => setNewEmployeePassword(e.target.value)}
                        placeholder="minst 6 tegn"
                        disabled={userLimitReached}
                      />
                    </Field>

                    <button
                      type="button"
                      onClick={createEmployee}
                      disabled={
                        creatingEmployee ||
                        !newUsername.trim() ||
                        newEmployeePassword.length < 6 ||
                        userLimitReached
                      }
                      className={greenButtonClass}
                    >
                      {creatingEmployee ? "Oppretter..." : "Opprett ansatt"}
                    </button>
                  </div>
                )}
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card
              title="Abonnement"
              description="Administrer Stripe-abonnementet for firmaet."
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-lg font-semibold text-slate-900">
                  {data.navn}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Nåværende plan:{" "}
                  <span className="font-semibold text-slate-900">
                    {planLabel(data.subscriptionPlan)}
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Stripe-status:{" "}
                  <span className="font-semibold text-slate-900">
                    {data.stripeSubscriptionStatus ?? "Ingen"}
                  </span>
                </div>

                {(data.hasStripeCustomer || data.stripeSubscriptionStatus) && (
                  <button
                    onClick={openPortal}
                    disabled={portalBusy}
                    className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-60"
                  >
                    {portalBusy ? "Åpner..." : "Administrer i Stripe"}
                  </button>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4">
                <PlanCard
                  title="Basic"
                  price="349 kr / mnd"
                  current={data.subscriptionPlan === "BASIC"}
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
                  current={data.subscriptionPlan === "STANDARD"}
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
                  current={data.subscriptionPlan === "BEDRIFT"}
                  onClick={() => startCheckout("BEDRIFT")}
                  loading={busyPlan === "BEDRIFT"}
                  features={[
                    "Alt i Standard",
                    "Opptil 10 brukere",
                    "Prioritert support",
                  ]}
                />
              </div>
            </Card>

            <Card title="Sikkerhet" description="Oppdater passordet ditt.">
              <form onSubmit={onSubmitPassword} className="space-y-4">
                <Field label="Gammelt passord">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                    required
                    autoComplete="current-password"
                  />
                </Field>

                <Field label="Nytt passord">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <p className="mt-1 text-xs text-slate-500">Minst 8 tegn.</p>
                </Field>

                <Field label="Bekreft nytt passord">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={passwordBusy}
                  className={primaryButtonClass}
                >
                  {passwordBusy ? "Lagrer..." : "Oppdater passord"}
                </button>
              </form>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

function Alert({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "error" | "success" | "warning";
}) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[tone]}`}>
      {children}
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        )}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
      {sub && <div className="mt-1 text-sm text-slate-500">{sub}</div>}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "success" | "danger";
}) {
  const styles =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-red-50 text-red-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      {children}
    </span>
  );
}

function MiniButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
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
        "rounded-3xl border bg-white p-5 shadow-sm transition",
        recommended
          ? "border-emerald-200 ring-2 ring-emerald-200"
          : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {price}
          </div>
        </div>

        {recommended && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Anbefalt
          </span>
        )}
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-700">
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
          "mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
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

const inputClass =
  "h-11 w-full rounded-2xl border border-slate-300 bg-white px-3 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

const primaryButtonClass =
  "w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60";

const greenButtonClass =
  "w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60";
