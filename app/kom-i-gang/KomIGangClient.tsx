"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type PlanKey = "start" | "pro" | "bedrift";

const PLANS: Array<{
  key: PlanKey;
  name: string;
  price: string;
  sub: string;
  features: string[];
  highlight?: boolean;
}> = [
  {
    key: "start",
    name: "Start",
    price: "299 kr / mnd",
    sub: "For små bedrifter og enkeltpersoner",
    features: [
      "Opptil 2 brukere",
      "Opprett og administrer oppdrag",
      "Registrer timer og materialer",
      "Last opp bilder på oppdrag",
      "Send sluttrapport på e-post",
      "Enkel firmaoversikt og statistikk",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "699 kr / mnd",
    sub: "Mest populær – perfekt for voksende bedrifter",
    highlight: true,
    features: [
      "Opptil 5 brukere",
      "Alt i Start",
      "Send pristilbud til kunder",
      "Send kontrakter",
      "Kunde kan godta / avslå via lenke",
      "PDF-dokumenter med firmalogo",
      "Rediger egne maler for tilbud og kontrakt",
    ],
  },
  {
    key: "bedrift",
    name: "Bedrift",
    price: "1299 kr / mnd",
    sub: "For større team",
    features: [
      "Opptil 10 brukere",
      "Alt i Pro",
      "Mer avansert statistikk",
      "Bedre oversikt over ansatte",
      "Prioritert support",
      "Fremtidige premium-funksjoner inkludert",
    ],
  },
];

function normalizePlan(s: string | null): PlanKey {
  const v = (s ?? "").toLowerCase();
  if (v === "start" || v === "pro" || v === "bedrift") return v;
  return "pro"; // default uten gratis
}

function isValidEmail(s: string) {
  const e = s.trim();
  return (
    e.includes("@") && e.includes(".") && !e.startsWith("@") && !e.endsWith("@")
  );
}

export default function KomIGangClient() {
  const sp = useSearchParams();

  // ✅ robust: url-param kan være ugyldig → normalizePlan
  const initialPlan = normalizePlan(sp.get("plan"));

  const [plan, setPlan] = useState<PlanKey>(initialPlan);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // ✅ hvis URL plan endres, oppdater state
  useEffect(() => {
    setPlan(normalizePlan(sp.get("plan")));
  }, [sp]);

  const emailOk = useMemo(() => isValidEmail(email), [email]);

  const canSend = useMemo(() => {
    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      phone.trim().length >= 6 &&
      emailOk
    );
  }, [firstName, lastName, phone, emailOk]);

  async function submit() {
    setTouched(true);
    setError(null);
    setOk(null);

    if (!canSend) {
      setError(
        "Sjekk at du har fylt inn fornavn, etternavn, telefon og gyldig e-post.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          company: company.trim() || "",
          plan, // ✅ alltid basic/pro/team
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Kunne ikke sende");
      }

      setOk("Takk! Jeg tar kontakt snart");
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setCompany("");
      setTouched(false);
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedPlan = PLANS.find((p) => p.key === plan) ?? PLANS[1]; // fallback pro

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logoV2.png"
              alt="Ordrebase"
              className="h-9 w-9 rounded-lg"
            />
            <span className="font-semibold text-lg text-slate-900">
              Ordrebase
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Tilbake til forsiden
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Kom i gang med Ordrebase
          </h1>
          <p className="mt-3 text-slate-600">
            Velg abonnement og legg igjen kontaktinfo. Jeg oppretter firmaet
            ditt etter betaling og setter opp alt.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Plan chooser */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold">Velg abonnement</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Du kan endre dette senere – dette gir meg en pekepinn på hva
                    du ønsker.
                  </p>
                </div>

                <div className="text-sm text-slate-500">
                  Valgt:{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedPlan.name}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PLANS.map((p) => {
                  const active = p.key === plan;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPlan(p.key)}
                      className={[
                        "text-left rounded-2xl border p-5 transition shadow-sm",
                        active
                          ? "border-emerald-300 ring-2 ring-emerald-200 bg-emerald-50/40"
                          : "border-slate-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {p.name}
                          </div>
                          <div className="mt-1 text-2xl font-semibold">
                            {p.price}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {p.sub}
                          </div>
                        </div>

                        {p.highlight && (
                          <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold">
                            Anbefalt
                          </span>
                        )}
                      </div>

                      <ul className="mt-4 space-y-2 text-sm text-slate-700">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      {active && (
                        <div className="mt-4 text-sm font-semibold text-emerald-700">
                          Valgt ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Form */}
          <section className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="text-lg font-semibold">Kontaktinfo</h2>
              <p className="mt-1 text-sm text-slate-600">
                Dette brukes kun for å kontakte deg og sette opp firma.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Fornavn *"
                  value={firstName}
                  onChange={(v) => {
                    setTouched(true);
                    setFirstName(v);
                  }}
                />
                <Input
                  label="Etternavn *"
                  value={lastName}
                  onChange={(v) => {
                    setTouched(true);
                    setLastName(v);
                  }}
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Telefon *"
                    value={phone}
                    onChange={(v) => {
                      setTouched(true);
                      setPhone(v);
                    }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="E-post *"
                    value={email}
                    onChange={(v) => {
                      setTouched(true);
                      setEmail(v);
                    }}
                    type="email"
                    hint={
                      !emailOk && touched && email.trim()
                        ? "Skriv inn en gyldig e-post."
                        : undefined
                    }
                    error={!emailOk && touched && email.trim().length > 0}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Firmanavn (valgfritt)"
                    value={company}
                    onChange={(v) => {
                      setTouched(true);
                      setCompany(v);
                    }}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {ok && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {ok}
                </div>
              )}

              <button
                onClick={submit}
                disabled={submitting || !canSend}
                className="mt-5 w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {submitting ? "Sender..." : "Send forespørsel"}
              </button>

              <div className="mt-3 text-xs text-slate-500">
                Ved å sende godtar du at jeg kan kontakte deg på e-post/telefon.
                Du binder deg ikke til noe ved innsending.
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
              <div className="font-semibold">Hva skjer etterpå?</div>
              <ol className="mt-2 space-y-1 text-slate-600 list-decimal list-inside">
                <li>Jeg kontakter deg og avklarer behov.</li>
                <li>Du betaler valgt abonnement.</li>
                <li>Jeg oppretter firma og sender innlogging.</li>
              </ol>
            </div>
          </section>
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
  hint,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
  error?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 bg-white",
          error
            ? "border-red-300 focus:ring-red-200"
            : "border-slate-300 focus:ring-emerald-200",
        ].join(" ")}
      />
      {hint && (
        <div
          className={error ? "text-xs text-red-600" : "text-xs text-slate-500"}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
