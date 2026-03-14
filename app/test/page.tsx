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
    name: "Basic",
    price: "349 kr / mnd",
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
    name: "Standard",
    price: "599 kr / mnd",
    sub: "Mest populær – perfekt for voksende bedrifter",
    highlight: true,
    features: [
      "Opptil 5 brukere",
      "Alt i Basic",
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
    price: "899 kr / mnd",
    sub: "For større team",
    features: [
      "Opptil 10 brukere",
      "Alt i Standard",
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
  return "pro";
}

function isValidEmail(s: string) {
  const e = s.trim();
  return (
    e.includes("@") && e.includes(".") && !e.startsWith("@") && !e.endsWith("@")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function KomIGangClient() {
  const sp = useSearchParams();
  const initialPlan = normalizePlan(sp.get("plan"));

  const [plan, setPlan] = useState<PlanKey>(initialPlan);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoCanceled, setDemoCanceled] = useState(false);

  useEffect(() => {
    setPlan(normalizePlan(sp.get("plan")));
  }, [sp]);

  const emailOk = useMemo(() => isValidEmail(email), [email]);
  const usernameOk = useMemo(() => username.trim().length >= 3, [username]);
  const passwordOk = useMemo(() => password.trim().length >= 8, [password]);
  const passwordsMatch = useMemo(
    () =>
      password.trim().length > 0 && password.trim() === confirmPassword.trim(),
    [password, confirmPassword],
  );

  const canSend = useMemo(() => {
    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      usernameOk &&
      phone.trim().length >= 6 &&
      emailOk &&
      company.trim().length >= 2 &&
      passwordOk &&
      passwordsMatch
    );
  }, [
    firstName,
    lastName,
    usernameOk,
    phone,
    emailOk,
    company,
    passwordOk,
    passwordsMatch,
  ]);

  async function submit() {
    setTouched(true);
    setError(null);
    setDemoCanceled(false);

    if (!canSend) {
      setError("Sjekk at alle feltene er fylt ut riktig.");
      return;
    }

    setSubmitting(true);

    try {
      // Simulerer registrering / betaling
      await sleep(1400);

      // Demo: vis suksess direkte
      setDemoSuccess(true);
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
    } finally {
      setSubmitting(false);
    }
  }

  function resetDemo() {
    setDemoSuccess(false);
    setDemoCanceled(false);
    setSubmitting(false);
    setError(null);
  }

  function simulateCancel() {
    setTouched(true);
    setError(null);
    setDemoSuccess(false);
    setDemoCanceled(true);
  }

  const selectedPlan = PLANS.find((p) => p.key === plan) ?? PLANS[1];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logoV2.png"
              alt="Ordrebase"
              className="h-9 w-9 rounded-lg"
            />
            <span className="text-lg font-semibold text-slate-900">
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

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Kom i gang med Ordrebase
          </h1>
          <p className="mt-3 text-slate-600">
            Dette er en demo-visning uten backend og uten ekte betaling.
          </p>
        </div>

        {demoSuccess && (
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Demo fullført
                </div>

                <h2 className="mt-4 text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Registreringen er fullført 🎉
                </h2>

                <p className="mt-3 text-base leading-7 text-slate-700">
                  Kontoen og firmaet ditt er nå opprettet i denne demoen. Slik
                  vil det typisk se ut for brukeren etter vellykket registrering
                  og betaling.
                </p>

                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                  <div className="font-semibold">
                    Demo-konto opprettet med disse opplysningene:
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Navn:</span> {firstName}{" "}
                      {lastName}
                    </div>
                    <div>
                      <span className="font-medium">Brukernavn:</span>{" "}
                      {username}
                    </div>
                    <div>
                      <span className="font-medium">E-post:</span> {email}
                    </div>
                    <div>
                      <span className="font-medium">Firma:</span> {company}
                    </div>
                    <div>
                      <span className="font-medium">Valgt abonnement:</span>{" "}
                      {selectedPlan.name}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  Her kan du teste hvordan teksten, layouten og knappene ser ut
                  etter registrering.
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:min-w-[220px]">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Logg inn nå
                </Link>

                <button
                  type="button"
                  onClick={resetDemo}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Test på nytt
                </button>

                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Til forsiden
                </Link>
              </div>
            </div>
          </div>
        )}

        {demoCanceled && !demoSuccess && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Demo: betalingen ble avbrutt. Du kan prøve igjen når du vil.
          </div>
        )}

        {!demoSuccess && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Velg abonnement</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Velg pakken som passer best for bedriften din.
                    </p>
                  </div>

                  <div className="text-sm text-slate-500">
                    Valgt:{" "}
                    <span className="font-semibold text-slate-900">
                      {selectedPlan.name}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {PLANS.map((p) => {
                    const active = p.key === plan;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPlan(p.key)}
                        className={[
                          "rounded-2xl border p-5 text-left shadow-sm transition",
                          active
                            ? "border-emerald-300 bg-emerald-50/40 ring-2 ring-emerald-200"
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
                            <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
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

            <section className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Opprett konto</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Dette er en demo. Ingen ekte konto blir opprettet.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      label="Brukernavn *"
                      value={username}
                      onChange={(v) => {
                        setTouched(true);
                        setUsername(v);
                      }}
                      hint={
                        touched && username.trim().length > 0 && !usernameOk
                          ? "Brukernavn må være minst 3 tegn."
                          : undefined
                      }
                      error={
                        touched && username.trim().length > 0 && !usernameOk
                      }
                    />
                  </div>

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
                      type="email"
                      value={email}
                      onChange={(v) => {
                        setTouched(true);
                        setEmail(v);
                      }}
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
                      label="Firmanavn *"
                      value={company}
                      onChange={(v) => {
                        setTouched(true);
                        setCompany(v);
                      }}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Passord *"
                      type="password"
                      value={password}
                      onChange={(v) => {
                        setTouched(true);
                        setPassword(v);
                      }}
                      hint={
                        touched && password.length > 0 && !passwordOk
                          ? "Passordet må være minst 8 tegn."
                          : undefined
                      }
                      error={touched && password.length > 0 && !passwordOk}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Bekreft passord *"
                      type="password"
                      value={confirmPassword}
                      onChange={(v) => {
                        setTouched(true);
                        setConfirmPassword(v);
                      }}
                      hint={
                        touched && confirmPassword.length > 0 && !passwordsMatch
                          ? "Passordene må være like."
                          : undefined
                      }
                      error={
                        touched && confirmPassword.length > 0 && !passwordsMatch
                      }
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={submit}
                    disabled={submitting || !canSend}
                    className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {submitting ? "Simulerer..." : "Simuler registrering"}
                  </button>

                  <button
                    type="button"
                    onClick={simulateCancel}
                    disabled={submitting}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Simuler avbrutt betaling
                  </button>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Denne demoen sender ingenting til backend og oppretter ingen
                  ekte bruker.
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
                <div className="font-semibold">Hva skjer i demoen?</div>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-slate-600">
                  <li>Du fyller ut informasjonen din.</li>
                  <li>Du klikker på “Simuler registrering”.</li>
                  <li>Systemet viser en ferdig suksessvisning.</li>
                  <li>Du kan se hvordan det vil oppleves for brukeren.</li>
                </ol>
              </div>
            </section>
          </div>
        )}
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
          "w-full rounded-xl border bg-white px-3 py-2 outline-none focus:ring-2",
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
