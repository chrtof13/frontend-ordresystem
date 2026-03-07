"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch } from "../lib/client";

type Tenant = {
  id: number;
  navn: string;
  status?: "ACTIVE" | "SUSPENDED";
  epost?: string | null;
  telefon?: string | null;
  createdAt?: string | null;
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

  // ---- create tenant form ----
  const [firmaNavn, setFirmaNavn] = useState("");
  const [adminBrukernavn, setAdminBrukernavn] = useState("");
  const [adminPassord, setAdminPassord] = useState("");

  // ---- lists / selection ----
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  const [q, setQ] = useState("");

  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const selectedTenant = useMemo(
    () => tenants.find((t) => t.id === selectedTenantId) ?? null,
    [tenants, selectedTenantId],
  );

  // ---- users for selected tenant ----
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ---- UI messages ----
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // ---- modal-ish temp password show ----
  const [tempPassword, setTempPassword] = useState<{
    username: string;
    password: string;
  } | null>(null);

  // -----------------------------
  // Fetch tenants
  // -----------------------------
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
        // keep selection if it still exists
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

  // -----------------------------
  // Fetch users when tenant changes
  // -----------------------------
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

  // -----------------------------
  // Create tenant
  // -----------------------------
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
        }),
      });

      // forventer: { id: number }
      const data = (await res.json()) as { id: number };
      setOk(`Firma opprettet ✅ (ID: ${data.id})`);

      setFirmaNavn("");
      setAdminBrukernavn("");
      setAdminPassord("");

      await refreshTenants(data.id);
      // users refresh skjer automatisk via effect når selectedTenantId settes
    } catch (e: any) {
      setError(e?.message || "Kunne ikke opprette firma.");
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Tenant suspend / activate
  // -----------------------------
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

  function fmtDateTime(s?: string | null) {
    if (!s) return "Aldri";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "Aldri";
    return d.toLocaleString("nb-NO");
  }

  // -----------------------------
  // User activate / deactivate
  // -----------------------------
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

  // -----------------------------
  // Reset password (returns temp password)
  // -----------------------------
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

      // forventer: { username: string, tempPassword: string }
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

  // -----------------------------
  // Filtering
  // -----------------------------
  const filteredTenants = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tenants;
    return tenants.filter((t) => {
      const idMatch = String(t.id).includes(s);
      const nameMatch = (t.navn || "").toLowerCase().includes(s);
      return idMatch || nameMatch;
    });
  }, [tenants, q]);

  // -----------------------------
  // UI helpers
  // -----------------------------
  const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
  const label = "text-sm font-semibold text-slate-700";
  const input =
    "mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              Owner Panel
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Opprett firma, administrer brukere og stopp misbruk.
            </p>
          </div>

          <button
            onClick={() => router.push("/home")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Hjem
          </button>
        </div>

        {/* Messages */}
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

        {/* Temp password */}
        {tempPassword && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            Midlertidig passord for <b>{tempPassword.username}</b>:{" "}
            <span className="font-mono">{tempPassword.password}</span>
            <div className="mt-2 text-xs font-normal text-amber-800">
              (Send dette sikkert til kunden. Be dem endre passord i
              Innstillinger.)
            </div>
          </div>
        )}

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Create tenant */}
          <section className={card}>
            <h2 className="text-lg font-semibold text-slate-900">
              Opprett nytt firma
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Lager firma + en ADMIN-bruker.
            </p>

            <div className="mt-4 space-y-4">
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
                  placeholder="Sterkt passord (min 8 tegn)"
                />
              </div>

              <button
                onClick={createTenant}
                disabled={saving}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {saving ? "Oppretter..." : "Opprett firma"}
              </button>
            </div>
          </section>

          {/* Middle: Tenants list */}
          <section className={[card, "lg:col-span-1"].join(" ")}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Firmaer</h2>

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
                placeholder="Søk på id eller navn..."
              />
            </div>

            <div className="mt-4 space-y-2">
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
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900">
                          {t.navn}
                        </div>
                        <span
                          className={[
                            "text-xs font-semibold rounded-full px-2 py-1",
                            status === "SUSPENDED"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700",
                          ].join(" ")}
                        >
                          {status === "SUSPENDED" ? "Pauset" : "Aktiv"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        ID: {t.id}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Right: Tenant details + users */}
          <section className={[card, "lg:col-span-1"].join(" ")}>
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedTenant ? "Firmadetaljer" : "Velg et firma"}
            </h2>

            {!selectedTenant ? (
              <p className="mt-2 text-sm text-slate-600">
                Klikk på et firma i listen for å administrere brukere.
              </p>
            ) : (
              <>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    {selectedTenant.navn}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Firma-ID: {selectedTenant.id}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
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

                  <div className="mt-2 text-xs text-slate-600">
                    * “Pause firma” er kill-switch hvis noe ser mistenkelig ut.
                  </div>
                </div>

                {/* Users */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">
                      Brukere ({users.length})
                    </div>
                  </div>

                  {loadingUsers ? (
                    <div className="mt-3 text-sm text-slate-600">Laster...</div>
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
                                  setUserActive(selectedTenant.id, u.id, false)
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

                            {/* Sikkerhetsregel: ikke tilby å deaktivere OWNER hvis du vil */}
                            {/* Du kan legge inn ekstra sjekk her hvis du ønsker */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
