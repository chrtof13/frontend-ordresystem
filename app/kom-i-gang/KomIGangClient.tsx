"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function KomIGangClient() {
  const sp = useSearchParams();
  const plan = (sp.get("plan") ?? "gratis").toLowerCase();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const canSend = useMemo(() => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      phone.trim() &&
      email.trim().includes("@")
    );
  }, [firstName, lastName, phone, email]);

  async function submit() {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        phone,
        email,
        company,
        plan,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      alert(txt || "Kunne ikke sende");
      return;
    }

    alert("Takk! Jeg tar kontakt snart 👌");
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setCompany("");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-xl px-4 sm:px-6 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">Kom i gang</h1>
        <p className="text-slate-600">
          Fyll inn info, så kontakter jeg deg og oppretter firma i Ordrebase.
        </p>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="text-sm text-slate-500">
            Valgt plan:{" "}
            <span className="font-semibold text-slate-900">{plan}</span>
          </div>

          <Input label="Fornavn *" value={firstName} onChange={setFirstName} />
          <Input label="Etternavn *" value={lastName} onChange={setLastName} />
          <Input label="Telefon *" value={phone} onChange={setPhone} />
          <Input
            label="E-post *"
            value={email}
            onChange={setEmail}
            type="email"
          />
          <Input
            label="Firmanavn (valgfritt)"
            value={company}
            onChange={setCompany}
          />

          <button
            onClick={submit}
            disabled={!canSend}
            className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            Send
          </button>

          <div className="text-xs text-slate-500">
            Ved å sende godtar du at jeg kan kontakte deg på e-post/telefon.
          </div>
        </div>
      </main>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
      />
    </div>
  );
}
