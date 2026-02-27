"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authedFetch, isAdmin } from "../../lib/client";

export default function AdminUsersPage() {
  const router = useRouter();

  const [brukernavn, setBrukernavn] = useState("");
  const [passord, setPassord] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ ikke-admin skal aldri se siden
    if (!isAdmin()) {
      router.replace("/home");
    }
  }, [router]);

  async function createEmployee() {
    setSaving(true);
    setError(null);
    setMsg(null);

    try {
      const res = await authedFetch(router, "/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          brukernavn: brukernavn.trim(),
          passord,
        }),
      });

      const id = (await res.json()) as number;
      setMsg(`Ansatt opprettet! (id=${id})`);
      setBrukernavn("");
      setPassord("");
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke opprette ansatt");
    } finally {
      setSaving(false);
    }
  }

  const label = "text-sm font-medium text-slate-700 mb-1";
  const input =
    "rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white";

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-3xl p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Admin</h1>
            <p className="text-slate-600 mt-1">
              Legg til ansatte i firmaet ditt.
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
        {msg && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {msg}
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Opprett ansatt</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={label}>Brukernavn</label>
              <input
                className={input}
                value={brukernavn}
                onChange={(e) => setBrukernavn(e.target.value)}
                placeholder="f.eks. ola"
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Passord</label>
              <input
                className={input}
                type="password"
                value={passord}
                onChange={(e) => setPassord(e.target.value)}
                placeholder="minst 6 tegn"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={createEmployee}
              disabled={saving || !brukernavn.trim() || passord.length < 4}
              className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Oppretter..." : "Opprett ansatt"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
