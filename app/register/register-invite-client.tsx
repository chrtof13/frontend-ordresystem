"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API } from "../lib/client"; // <-- juster path hvis din ligger annet sted

const REGISTER_ENDPOINT = "/api/auth/register-invite";
// 🔁 Endre denne hvis du har f.eks. "/api/auth/register-invite" etc.

export default function RegisterInviteClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const invite = useMemo(() => sp.get("invite")?.trim() || "", [sp]);

  const [brukernavn, setBrukernavn] = useState("");
  const [passord, setPassord] = useState("");
  const [passord2, setPassord2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setOkMsg(null);

    if (!invite) {
      setError("Invitasjonslink mangler (invite=...).");
      return;
    }
    if (!brukernavn.trim()) {
      setError("Brukernavn mangler.");
      return;
    }
    if (!passord || passord.length < 6) {
      setError("Passord må være minst 6 tegn.");
      return;
    }
    if (passord !== passord2) {
      setError("Passordene er ikke like.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}${REGISTER_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ inviterte bør registreres uten token (man er ikke logget inn ennå)
        body: JSON.stringify({
          brukernavn,
          passord,
          inviteToken: invite, // 🔁 backend må lese denne
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Registrering feilet (HTTP ${res.status})`);
      }

      setOkMsg("Bruker opprettet ✅ Du kan nå logge inn.");
      setTimeout(() => router.replace("/login"), 800);
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Registrer bruker
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Du registrerer deg via invitasjon.
        </p>

        {!invite && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Invitasjonslink mangler query-param: <b>?invite=...</b>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {okMsg && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {okMsg}
          </div>
        )}

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Brukernavn
            </label>
            <input
              value={brukernavn}
              onChange={(e) => setBrukernavn(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="f.eks. ola"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Passord
            </label>
            <input
              type="password"
              value={passord}
              onChange={(e) => setPassord(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="minst 6 tegn"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Gjenta passord
            </label>
            <input
              type="password"
              value={passord2}
              onChange={(e) => setPassord2(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={loading || !invite}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Oppretter..." : "Opprett bruker"}
          </button>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Til login
          </button>
        </div>
      </div>
    </div>
  );
}
