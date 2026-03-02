"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "../lib/client"; // juster path hvis din ligger annerledes

export default function SettingsPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (newPassword.length < 8) {
      setErr("Nytt passord må være minst 8 tegn");
      return;
    }
    if (newPassword !== confirm) {
      setErr("Passordene matcher ikke");
      return;
    }

    setLoading(true);
    try {
      await changePassword(router, currentPassword, newPassword);

      setMsg("Passord oppdatert ✅");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (e: any) {
      setErr(e?.message || "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      {/* Topp-knapper */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Hjem
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-slate-900">Innstillinger</h1>
      <p className="mt-1 text-sm text-slate-600">Endre passordet ditt.</p>

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Gammelt passord
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-slate-200"
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
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-slate-200"
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
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-slate-200"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        {err && (
          <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            {err}
          </div>
        )}
        {msg && (
          <div className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
            {msg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#2f5f8f] px-4 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Lagrer..." : "Oppdater passord"}
        </button>
      </form>
    </div>
  );
}
