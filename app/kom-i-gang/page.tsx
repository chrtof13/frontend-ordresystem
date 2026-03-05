"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function isEmail(s: string) {
  const t = s.trim();
  return t.includes("@") && t.includes(".");
}

function isPhone(s: string) {
  const t = s.trim().replace(/\s/g, "");
  return t.length >= 6;
}

export default function KomIGangPage() {
  const sp = useSearchParams();
  const plan = (sp.get("plan") ?? "gratis").toLowerCase();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const canSend = useMemo(() => {
    if (!firstName.trim()) return false;
    if (!lastName.trim()) return false;
    if (!isPhone(phone)) return false;
    if (!isEmail(email)) return false;
    return true;
  }, [firstName, lastName, phone, email]);

  async function submit() {
    setTouched(true);
    setErr(null);
    setOkMsg(null);
    if (!canSend) return;

    setBusy(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          company: company.trim() || null,
          plan,
          source: "landing",
          pageUrl: typeof window !== "undefined" ? window.location.href : null,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Kunne ikke sende (HTTP ${res.status})`);
      }

      setOkMsg("Takk! Jeg tar kontakt snart 👋");
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setCompany("");
      setTouched(false);
    } catch (e: any) {
      setErr(e?.message ?? "Noe gikk galt");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold">Kom i gang</h1>
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Tilbake
          </Link>
        </div>

        <p className="mt-2 text-slate-600">
          Fyll inn info, så oppretter jeg firmaet ditt og sender innlogging.
        </p>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
          <div className="text-xs text-slate-500">
            Valgt plan: <span className="font-semibold">{plan}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Fornavn *">
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Ola"
              />
            </Field>

            <Field label="Etternavn *">
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Nordmann"
              />
            </Field>
          </div>

          <Field label="Telefon *">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="99 99 99 99"
              inputMode="tel"
            />
          </Field>

          <Field label="E-post *">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="ola@firma.no"
              inputMode="email"
            />
          </Field>

          <Field label="Firmanavn (valgfritt)">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ola Rør AS"
            />
          </Field>

          {touched && !canSend && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Fyll inn fornavn, etternavn, telefon og en gyldig e-post.
            </div>
          )}

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {okMsg && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {okMsg}
            </div>
          )}

          <button
            onClick={submit}
            disabled={busy || !canSend}
            className="w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {busy ? "Sender..." : "Send"}
          </button>

          <div className="text-xs text-slate-500 text-center">
            Ved å sende samtykker du til at jeg kan kontakte deg for å sette opp
            konto.
          </div>
        </div>
      </div>
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
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}
