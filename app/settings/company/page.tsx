"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch, isAdmin, isOwner } from "../../lib/client";

type FirmaUser = {
  id: number;
  navn: string;
  rolle: "OWNER" | "ADMIN" | "ANSATT" | string;
  aktiv: boolean;
  createdAt?: string | null;
};

type FirmaOverview = {
  id: number;
  navn: string;
  status?: string | null;
  createdAt?: string | null;
  antallBrukere: number;
  brukere: FirmaUser[];
};

type InviteUserRequest = {
  email: string;
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
  if (x === "INACTIVE") return "Inaktiv";
  return x;
};

export default function CompanySettingsPage() {
  const router = useRouter();

  const [data, setData] = useState<FirmaOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // invite UI
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  // role + deactivate UI
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

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
      if (!res.ok) throw new Error("Kunne ikke hente firma");
      const json = (await res.json()) as FirmaOverview;
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const created = useMemo(() => {
    if (!data?.createdAt) return null;
    try {
      return new Date(data.createdAt).toLocaleDateString("nb-NO");
    } catch {
      return null;
    }
  }, [data?.createdAt]);

  async function invite() {
    const email = inviteEmail.trim();
    if (!email) return;

    setInviting(true);
    setInviteMsg(null);
    setError(null);

    try {
      const res = await authedFetch(router, "/api/firma/invite", {
        method: "POST",
        body: JSON.stringify({ email } satisfies InviteUserRequest),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Kunne ikke sende invitasjon");
      }

      setInviteEmail("");
      setInviteMsg("Invitasjon sendt ✅");
      // oppdater oversikt (valgfritt)
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
    } finally {
      setInviting(false);
    }
  }

  async function changeRole(
    userId: number,
    rolle: "ANSATT" | "ADMIN" | "OWNER",
  ) {
    if (!data) return;

    setBusyUserId(userId);
    setError(null);

    try {
      const res = await authedFetch(
        router,
        `/api/firma/users/${userId}/role?rolle=${encodeURIComponent(rolle)}`,
        { method: "POST" },
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Kunne ikke endre rolle");
      }

      // Optimistisk oppdatering for “proft” UI:
      setData({
        ...data,
        brukere: data.brukere.map((u) =>
          u.id === userId ? { ...u, rolle } : u,
        ),
      });
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
      // fallback: hent fra server igjen
      await load();
    } finally {
      setBusyUserId(null);
    }
  }

  async function deactivateUser(userId: number) {
    if (!data) return;

    const ok = confirm("Deaktivere bruker?");
    if (!ok) return;

    setBusyUserId(userId);
    setError(null);

    try {
      const res = await authedFetch(
        router,
        `/api/firma/users/${userId}/deactivate`,
        {
          method: "POST",
        },
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Kunne ikke deaktivere bruker");
      }

      // Optimistisk update:
      setData({
        ...data,
        brukere: data.brukere.map((u) =>
          u.id === userId ? { ...u, aktiv: false } : u,
        ),
      });
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
      await load();
    } finally {
      setBusyUserId(null);
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
        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  const chip =
    "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700";

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-5xl p-4 sm:p-6 space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Firma</h1>
          <p className="text-slate-600 mt-1">
            Oversikt over firmaet ditt og brukere.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Firma-kort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600">Firmanavn</div>
            <div className="mt-1 text-xl font-semibold text-slate-900">
              {data.navn}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600">Brukere</div>
            <div className="mt-1 text-xl font-semibold text-slate-900 tabular-nums">
              {data.antallBrukere}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600">Detaljer</div>
            <div className="mt-2 text-sm text-slate-700 space-y-1">
              <div>
                <span className="text-slate-500">Status:</span>{" "}
                <span className="font-semibold">
                  {statusLabel(data.status)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Opprettet:</span>{" "}
                <span className="font-semibold">{created ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inviter */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Inviter ansatt</h2>
            <p className="text-sm text-slate-600 mt-1">
              Sender en e-post med registreringslink. (Vises ikke i brukerlisten
              etterpå.)
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {!canManageUsers ? (
              <div className="text-sm text-slate-600">
                Du må være <span className="font-semibold">Admin</span> eller{" "}
                <span className="font-semibold">Owner</span> for å invitere
                brukere.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    E-post
                  </label>
                  <input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="navn@firma.no"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    inputMode="email"
                  />
                </div>

                <button
                  type="button"
                  onClick={invite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviting ? "Sender..." : "Send invitasjon"}
                </button>
              </div>
            )}

            {inviteMsg && (
              <div className="mt-3 text-sm font-semibold text-green-700">
                {inviteMsg}
              </div>
            )}
          </div>
        </div>

        {/* Bruker-liste */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Brukere i firma</h2>
            <p className="text-sm text-slate-600 mt-1">
              Navn, rolle og status.
            </p>
          </div>

          {/* Desktop tabell */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Navn
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Rolle
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Status
                  </th>
                  {canManageUsers && (
                    <th className="text-right px-4 py-3 font-semibold text-slate-700">
                      Handling
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {data.brukere.map((u) => (
                  <tr key={u.id} className="bg-white">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {u.navn}
                    </td>

                    <td className="px-4 py-3">
                      <span className={chip}>{roleLabel(u.rolle)}</span>

                      {canManageUsers && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busyUserId === u.id}
                            onClick={() => changeRole(u.id, "ANSATT")}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                          >
                            Ansatt
                          </button>
                          <button
                            type="button"
                            disabled={busyUserId === u.id}
                            onClick={() => changeRole(u.id, "ADMIN")}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                          >
                            Admin
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {u.aktiv ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Aktiv
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          Deaktivert
                        </span>
                      )}
                    </td>

                    {canManageUsers && (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => deactivateUser(u.id)}
                          disabled={busyUserId === u.id || !u.aktiv}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          Deaktiver
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobil-kort */}
          <div className="md:hidden p-4 space-y-3">
            {data.brukere.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {u.navn}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={chip}>{roleLabel(u.rolle)}</span>
                      {u.aktiv ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Aktiv
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          Deaktivert
                        </span>
                      )}
                    </div>

                    {canManageUsers && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busyUserId === u.id}
                          onClick={() => changeRole(u.id, "ANSATT")}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                        >
                          Ansatt
                        </button>
                        <button
                          type="button"
                          disabled={busyUserId === u.id}
                          onClick={() => changeRole(u.id, "ADMIN")}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                        >
                          Admin
                        </button>
                        <button
                          type="button"
                          disabled={busyUserId === u.id}
                          onClick={() => changeRole(u.id, "OWNER")}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                        >
                          Owner
                        </button>

                        <button
                          type="button"
                          onClick={() => deactivateUser(u.id)}
                          disabled={busyUserId === u.id || !u.aktiv}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          Deaktiver
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Neste steg: invitasjonsliste + reaktiver bruker + “resend invite”.
        </div>
      </main>
    </div>
  );
}
