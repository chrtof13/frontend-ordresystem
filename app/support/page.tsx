"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authedFetch } from "../lib/client";

type SupportCategory =
  | "BUG"
  | "FEEDBACK"
  | "FEATURE_REQUEST"
  | "ACCOUNT"
  | "OTHER";

type SupportPriority = "LOW" | "NORMAL" | "HIGH";

const categoryOptions: {
  value: SupportCategory;
  label: string;
  desc: string;
}[] = [
  {
    value: "BUG",
    label: "Feil i systemet",
    desc: "Noe fungerer ikke som det skal, eller gir feil.",
  },
  {
    value: "FEEDBACK",
    label: "Tilbakemelding",
    desc: "Generelle tanker om opplevelsen i Ordrebase.",
  },
  {
    value: "FEATURE_REQUEST",
    label: "Ønske om funksjon",
    desc: "Forslag til ny funksjon eller forbedring.",
  },
  {
    value: "ACCOUNT",
    label: "Konto / abonnement",
    desc: "Spørsmål om tilgang, plan eller konto.",
  },
  {
    value: "OTHER",
    label: "Annet",
    desc: "Noe som ikke passer i kategoriene over.",
  },
];

const priorityOptions: { value: SupportPriority; label: string }[] = [
  { value: "LOW", label: "Lav" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Haster" },
];

export default function SupportPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [category, setCategory] = useState<SupportCategory>("BUG");
  const [priority, setPriority] = useState<SupportPriority>("NORMAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [allowFollowUp, setAllowFollowUp] = useState(true);

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pathname) {
      setPageUrl(pathname);
    }
  }, [pathname]);

  const subjectPlaceholder = useMemo(() => {
    switch (category) {
      case "BUG":
        return "F.eks. PDF-forhåndsvisning feiler på oppdrag";
      case "FEATURE_REQUEST":
        return "F.eks. Ønske om filter på oppdrag";
      case "FEEDBACK":
        return "F.eks. Tilbakemelding på brukeropplevelse";
      case "ACCOUNT":
        return "F.eks. Spørsmål om abonnement";
      default:
        return "Kort oppsummering av henvendelsen";
    }
  }, [category]);

  const messagePlaceholder = useMemo(() => {
    if (category === "BUG") {
      return [
        "Beskriv feilen så tydelig som mulig.",
        "",
        "Gjerne skriv:",
        "- Hva du prøvde å gjøre",
        "- Hva du forventet skulle skje",
        "- Hva som faktisk skjedde",
        "- Om feilen skjer hver gang",
      ].join("\n");
    }

    if (category === "FEATURE_REQUEST") {
      return [
        "Beskriv funksjonen eller endringen du ønsker.",
        "",
        "Gjerne skriv:",
        "- Hva du ønsker å kunne gjøre",
        "- Hvorfor dette ville vært nyttig",
        "- Hvordan du ser for deg at det kan fungere",
      ].join("\n");
    }

    return "Skriv meldingen din her...";
  }, [category]);

  function validateEmail(value: string) {
    if (!value.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!subject.trim()) {
      setError("Skriv inn et emne.");
      return;
    }

    if (message.trim().length < 10) {
      setError("Beskriv saken litt mer detaljert.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Skriv inn en gyldig e-postadresse, eller la feltet stå tomt.");
      return;
    }

    setSending(true);

    try {
      const res = await authedFetch(router, "/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          priority,
          subject: subject.trim(),
          message: message.trim(),
          email: email.trim() || null,
          pageUrl: pageUrl.trim() || null,
          allowFollowUp,
        }),
      });

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        let msg = `Kunne ikke sende melding (HTTP ${res.status})`;

        if (ct.includes("application/json")) {
          const data: any = await res.json().catch(() => null);
          msg = data?.message || data?.error || data?.detail || msg;
        } else {
          const txt = await res.text().catch(() => "");
          if (txt.trim()) msg = txt.trim();
        }

        throw new Error(msg);
      }

      setSuccess("Meldingen er sendt til support ✅");
      setCategory("BUG");
      setPriority("NORMAL");
      setSubject("");
      setMessage("");
      setEmail("");
      setAllowFollowUp(true);
      setPageUrl(pathname || "");
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke sende melding til support.");
    } finally {
      setSending(false);
    }
  }

  const card = "rounded-3xl border border-slate-200 bg-white shadow-sm";
  const input =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-blue-200";
  const label = "mb-1.5 block text-sm font-semibold text-slate-700";

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className={`${card} p-5 sm:p-6`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Support
                </h1>
                <p className="mt-2 max-w-2xl text-slate-600">
                  Send inn feil, spørsmål, forslag eller generell tilbakemelding
                  om Ordrebase.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/home")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Til dashboard
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {success}
              </div>
            )}

            <form onSubmit={submitTicket} className="mt-6 space-y-5">
              <div>
                <label className={label}>Kategori</label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {categoryOptions.map((option) => {
                    const active = category === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setCategory(option.value)}
                        className={[
                          "rounded-2xl border p-4 text-left transition",
                          active
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="font-semibold text-slate-900">
                          {option.label}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {option.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Prioritet</label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as SupportPriority)
                    }
                    className={input}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={label}>Din e-post (valgfritt)</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={input}
                    placeholder="navn@firma.no"
                    inputMode="email"
                    autoCapitalize="none"
                  />
                </div>
              </div>

              <div>
                <label className={label}>Emne</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={input}
                  placeholder={subjectPlaceholder}
                />
              </div>

              <div>
                <label className={label}>Melding</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${input} min-h-[220px] resize-y`}
                  placeholder={messagePlaceholder}
                />
              </div>

              <div>
                <label className={label}>Side / plassering (valgfritt)</label>
                <input
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  className={input}
                  placeholder="/jobs/14/send"
                />
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={allowFollowUp}
                  onChange={(e) => setAllowFollowUp(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">
                  Dere kan kontakte meg hvis dere trenger mer informasjon om
                  saken.
                </span>
              </label>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Tips: Ved feil er det nyttig å beskrive steg for steg hva som
                  skjedde.
                </p>

                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Sender..." : "Send til support"}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className={`${card} p-5 sm:p-6`}>
              <h2 className="text-lg font-semibold text-slate-900">
                Når bør brukeren kontakte support?
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <InfoBox
                  title="Feil i systemet"
                  text="Hvis noe ikke lagres, laster feil, gir feilmelding eller oppfører seg uventet."
                />
                <InfoBox
                  title="Forslag og forbedringer"
                  text="Hvis brukeren savner en funksjon eller har ideer til hvordan systemet kan bli bedre."
                />
                <InfoBox
                  title="Konto og abonnement"
                  text="Ved spørsmål om tilgang, brukerroller, abonnement eller oppsett."
                />
              </div>
            </section>

            <section className={`${card} p-5 sm:p-6`}>
              <h2 className="text-lg font-semibold text-slate-900">
                Hva skjer etter innsending?
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <StepBox
                  number="1"
                  text="Meldingen blir sendt inn til support."
                />
                <StepBox
                  number="2"
                  text="Saken kan lagres i databasen og eventuelt sendes videre på e-post."
                />
                <StepBox
                  number="3"
                  text="Hvis brukeren har lagt inn e-post og tillatt oppfølging, kan dere svare tilbake."
                />
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="font-semibold text-slate-900">{title}</div>
      <p className="mt-1 text-slate-600">{text}</p>
    </div>
  );
}

function StepBox({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
        {number}
      </div>
      <p className="text-slate-700">{text}</p>
    </div>
  );
}
