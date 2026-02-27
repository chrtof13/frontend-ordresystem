"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch } from "../lib/client"; // hvis denne pathen ikke stemmer: se kommentaren under

// ⚠️ Hvis du får import-feil her:
// - Hvis du har lib-mappen din i app/lib: bruk "../lib/client"
// - Hvis du har lib-mappen din i root/lib: bruk "../../lib/client"
// Juster slik at den peker til der client.ts faktisk ligger.

export default function OwnerPage() {
  const router = useRouter();

  const [firmaNavn, setFirmaNavn] = useState("");
  const [adminBrukernavn, setAdminBrukernavn] = useState("");
  const [adminPassord, setAdminPassord] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdFirmaId, setCreatedFirmaId] = useState<number | null>(null);

  const label = "text-sm font-medium text-slate-700 mb-1";
  const input =
    "rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white";

  async function createTenant() {
    setError(null);
    setCreatedFirmaId(null);

    if (!firmaNavn.trim() || !adminBrukernavn.trim() || !adminPassord.trim()) {
      setError("Fyll inn firmaNavn, adminBrukernavn og adminPassord.");
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

      const id = (await res.json()) as number; // backend returnerer Long -> blir number i JS
      setCreatedFirmaId(id);

      // reset felter
      setFirmaNavn("");
      setAdminBrukernavn("");
      setAdminPassord("");
    } catch (e: any) {
      // Hvis du ikke er OWNER vil backend svare 403 => authedFetch sender deg til /login
      setError(e?.message ?? "Kunne ikke opprette firma.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-3xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Owner Panel</h1>
            <p className="text-slate-600 mt-1">
              Opprett nytt firma + admin-bruker.
            </p>
          </div>

          <button
            onClick={() => router.push("/home")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Tilbake
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {createdFirmaId != null && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Firma opprettet ✅ Firma-ID: <b>{createdFirmaId}</b>
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col">
            <label className={label}>Firmanavn</label>
            <input
              className={input}
              value={firmaNavn}
              onChange={(e) => setFirmaNavn(e.target.value)}
              placeholder="Termobygg AS"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={label}>Admin brukernavn</label>
              <input
                className={input}
                value={adminBrukernavn}
                onChange={(e) => setAdminBrukernavn(e.target.value)}
                placeholder="termobygg_admin"
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Admin passord</label>
              <input
                className={input}
                type="password"
                value={adminPassord}
                onChange={(e) => setAdminPassord(e.target.value)}
                placeholder="Sterkt passord"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={createTenant}
              disabled={saving}
              className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Oppretter..." : "Opprett firma"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
