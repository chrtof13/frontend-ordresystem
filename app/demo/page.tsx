"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import {
  Briefcase,
  FileText,
  Camera,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Clock3,
  ShieldCheck,
  Users,
  Sparkles,
  MonitorSmartphone,
  PlayCircle,
  ChevronRight,
} from "lucide-react";

const flowSteps = [
  {
    title: "Lag pristilbud",
    text: "Opprett et pristilbud raskt ved å legge inn arbeid, timer og materialer. Tilbudet blir ryddig presentert og klart til sending på kort tid.",
    image: "/demo/lagPristilbud.png",
    alt: "Ordrebase – lag pristilbud",
  },
  {
    title: "Send pristilbud til kunde",
    text: "Send tilbudet direkte til kunden. Kunden får en enkel lenke og kan åpne tilbudet med én gang uten å måtte logge inn.",
    image: "/demo/sendPristilbud.png",
    alt: "Ordrebase – send pristilbud til kunde",
  },
  {
    title: "Kunden åpner lenken og godkjenner enkelt",
    text: "Når kunden klikker på lenken, åpnes tilbudet i en ryddig visning som fungerer godt på både mobil og PC. Kunden kan lese gjennom og godkjenne pristilbudet raskt og enkelt.",
    image: "/demo/kundePristilbud3.png",
    alt: "Kundevisning av pristilbud med enkel godkjenning",
    highlight: true,
  },
  {
    title: "Send kontrakt",
    text: "Når tilbudet er akseptert, kan du sende kontrakt videre direkte fra systemet. Det gir en mer profesjonell og sømløs flyt mot kunden.",
    image: "/demo/sendKontrakt.png",
    alt: "Ordrebase – send kontrakt",
  },
  {
    title: "Se alle pristilbud",
    text: "Alle pristilbud lagres og listes slik at du enkelt kan følge opp kunder, se status og holde orden på hva som er sendt og godkjent.",
    image: "/demo/seAllePristilbud.png",
    alt: "Ordrebase – oversikt over alle pristilbud",
  },
  {
    title: "Lag oppdrag",
    text: "Når jobben starter, kan du opprette et oppdrag hvor timer, bilder, materialer og annen dokumentasjon lagres samlet på ett sted.",
    image: "/demo/oppdragOversikt.png",
    alt: "Ordrebase – opprett og håndter oppdrag",
  },
  {
    title: "Send rapport til kunden",
    text: "Når oppdraget er ferdig kan du sende en rapport til kunden med bilder og oppsummering. Det gir en ryddig avslutning på jobben.",
    image: "/demo/sendRapport.png",
    alt: "Ordrebase – send rapport til kunden",
  },
  {
    title: "Oversikt over alle oppdrag",
    text: "Alle oppdrag listes slik at du raskt ser hva som er aktivt, hva som venter, og hva som er ferdigstilt.",
    image: "/demo/oppdragOversikt.png",
    alt: "Ordrebase – oversikt over alle oppdrag",
  },
  {
    title: "Oversikt over økonomi",
    text: "Følg med på inntekt, materialkostnader og timer for hvert oppdrag. Det gjør det lettere å holde kontroll på lønnsomheten.",
    image: "/demo/statistikk.png",
    alt: "Ordrebase – statistikk og økonomioversikt",
  },
];

const features = [
  {
    icon: Briefcase,
    title: "Hold orden på oppdrag",
    text: "Samle kundeinformasjon, status, sted, dato og beskrivelse på ett sted.",
  },
  {
    icon: FileText,
    title: "Send tilbud og kontrakter",
    text: "Opprett dokumenter raskt og send dem videre til kunden uten ekstra verktøy.",
  },
  {
    icon: Camera,
    title: "Lagre bilder fra jobb",
    text: "Dokumenter fremdrift og ferdig resultat med bilder direkte på oppdraget.",
  },
  {
    icon: BarChart3,
    title: "Se tall og oversikt",
    text: "Følg med på materialkostnader, timer og inntekt per oppdrag.",
  },
];

const steps = [
  {
    title: "Opprett oppdrag",
    text: "Registrer kunde, jobbdetaljer og det som skal gjøres.",
  },
  {
    title: "Følg arbeidet",
    text: "Legg inn timer, materialer og bilder underveis.",
  },
  {
    title: "Send dokumentasjon",
    text: "Send pristilbud, kontrakt eller ferdig rapport til kunden.",
  },
];

const trustItems = [
  "Laget for håndverkere",
  "Fungerer bra på mobil og PC",
  "Kunden godkjenner uten innlogging",
];

export default function DemoPage() {
  const router = useRouter();

  const scrollToScreenshots = () => {
    const el = document.getElementById("screenshots");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFlow = () => {
    const el = document.getElementById("flow");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="min-w-0">
            <div className="text-lg font-semibold tracking-tight text-slate-900">
              Ordrebase
            </div>
            <div className="text-xs text-slate-500">Demo</div>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:px-4"
            >
              Forside
            </button>
            <button
              onClick={() => router.push("/kom-i-gang")}
              className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 sm:px-4"
            >
              Kom i gang
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-[-100px] top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="absolute right-[-60px] top-16 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/80 to-transparent" />
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                <Sparkles className="h-4 w-4" />
                Demo av Ordrebase
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Se hvordan Ordrebase gjør tilbud, oppdrag og dokumentasjon mye
                enklere å holde styr på.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Denne demoen viser hvordan en typisk arbeidsflyt ser ut i
                Ordrebase – fra pristilbud og kundegodkjenning til kontrakt,
                oppdrag, rapport og økonomioversikt.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={scrollToScreenshots}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                >
                  <PlayCircle className="h-4 w-4" />
                  Se demoen
                </button>

                <button
                  onClick={() => router.push("/kom-i-gang")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Kom i gang
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {trustItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat
                  icon={Clock3}
                  label="Mindre manuelt arbeid"
                  value="Mer tid til jobben"
                />
                <Stat
                  icon={ShieldCheck}
                  label="Alt samlet"
                  value="Bedre oversikt"
                />
                <Stat
                  icon={Users}
                  label="Enklere kundereise"
                  value="Raskere flyt"
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-300" />
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                    <span className="h-3 w-3 rounded-full bg-emerald-300" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-4 text-white sm:p-6">
                  <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                      <div className="text-sm font-semibold text-white/90">
                        Ordrebase
                      </div>

                      <div className="mt-4 space-y-3 text-sm text-white/75">
                        {[
                          "Dashboard",
                          "Oppdrag",
                          "Pristilbud",
                          "Kunder",
                          "Rapporter",
                        ].map((item) => (
                          <div
                            key={item}
                            className="rounded-xl bg-white/10 px-3 py-2"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                        <div className="text-sm text-white/70">
                          Aktive oppdrag
                        </div>
                        <div className="mt-1 text-3xl font-semibold">12</div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                          <div className="text-sm text-white/70">
                            Denne måneden
                          </div>
                          <div className="mt-2 text-2xl font-semibold">
                            146 000 kr
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                          <div className="text-sm text-white/70">
                            Utestående tilbud
                          </div>
                          <div className="mt-2 text-2xl font-semibold">4</div>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur sm:col-span-2">
                          <div className="text-sm text-white/70">
                            Siste aktivitet
                          </div>
                          <div className="mt-3 space-y-2 text-sm">
                            <div className="rounded-xl bg-white/10 px-3 py-2">
                              Oppdrag oppdatert: Badrenovering
                            </div>
                            <div className="rounded-xl bg-white/10 px-3 py-2">
                              Pristilbud sendt: Garasje
                            </div>
                            <div className="rounded-xl bg-white/10 px-3 py-2">
                              Rapport sendt til kunde
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <MiniPoint text="Tilbud og kontrakt i samme flyt" />
                    <MiniPoint text="Kundegodkjenning uten innlogging" />
                    <MiniPoint text="Oversikt på mobil og PC" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-3 text-sm text-slate-600 lg:flex-row lg:flex-wrap lg:items-center lg:gap-6">
              <div className="font-semibold text-slate-900">
                Dette ser du i demoen:
              </div>
              <div>Hvordan tilbud opprettes</div>
              <div>Hvordan kunden godkjenner</div>
              <div>Hvordan oppdrag følges opp</div>
              <div>Hvordan økonomi og historikk vises</div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="flow"
          className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:py-8"
        >
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Fra tilbud til ferdig oppdrag
              </h2>
              <p className="mt-3 text-slate-600">
                Ordrebase samler hele arbeidsflyten i ett system, slik at du
                slipper å hoppe mellom flere verktøy og mister mindre oversikt.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                    {index + 1}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="screenshots"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20"
        >
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Se hvordan systemet fungerer i praksis
            </h2>
            <p className="mt-3 text-slate-600">
              Under ser du den typiske flyten i systemet – fra pristilbud til
              ferdig oppdrag og rapport til kunden. Du ser også hvordan kunden
              opplever godkjenning av pristilbud på mobil og PC.
            </p>
          </div>

          <div className="mt-10 space-y-8 sm:space-y-10">
            {flowSteps.map((step, index) => (
              <div
                key={step.title}
                className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8"
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <ScreenshotCard
                    src={step.image}
                    alt={step.alt}
                    highlight={step.highlight}
                  />
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Steg {index + 1}
                  </div>

                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {step.title}
                  </h3>

                  <p className="mt-3 max-w-xl leading-7 text-slate-600">
                    {step.text}
                  </p>

                  {step.highlight && (
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                      <MonitorSmartphone className="h-4 w-4" />
                      Optimalisert for kunde på mobil og PC
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:py-8">
          <div className="rounded-[32px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Hvorfor denne demoen er nyttig
                </h2>
                <p className="mt-3 max-w-2xl text-slate-600">
                  I stedet for å bare lese om funksjonene, får du se hvordan
                  Ordrebase faktisk brukes i en naturlig arbeidsflyt. Det gjør
                  det lettere å forstå hvordan systemet kan passe inn i
                  hverdagen til bedriften din.
                </p>

                <div className="mt-6 space-y-3 text-sm text-slate-700">
                  <CheckRow text="Du ser hva som skjer før, under og etter et oppdrag" />
                  <CheckRow text="Du ser hvordan kunden opplever tilbud og godkjenning" />
                  <CheckRow text="Du ser hvordan timer, bilder og økonomi samles på ett sted" />
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Demo-oversikt
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    "Tilbud",
                    "Kundegodkjenning",
                    "Kontrakt",
                    "Oppdrag",
                    "Rapport",
                    "Økonomi",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800"
                    >
                      <span>{item}</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-900 p-6 text-white shadow-sm sm:p-8 lg:p-10">
            <div className="absolute inset-0 -z-10">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="absolute left-10 bottom-0 h-32 w-32 rounded-full bg-sky-300/15 blur-3xl" />
            </div>

            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight">
                Klar for å teste Ordrebase selv?
              </h2>
              <p className="mt-3 text-white/75">
                Nå har du sett hvordan systemet fungerer. Neste steg er å prøve
                det selv og kjenne om det passer arbeidsflyten deres.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/kom-i-gang")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Kom i gang
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => router.push("/contact")}
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Kontakt oss
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/75">
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Ingen bindingstid i testperioden
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Enkelt å komme i gang
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Bygget for norske håndverksbedrifter
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ScreenshotCard({
  src,
  alt,
  highlight,
}: {
  src: string;
  alt: string;
  highlight?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-300" />
        </div>

        {highlight && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Kundevisning
          </span>
        )}
      </div>

      <div className="bg-gradient-to-b from-slate-50 to-white p-3 sm:p-4">
        <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 sm:min-h-[320px] sm:p-4 lg:min-h-[380px]">
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1000}
            className="h-auto max-h-[720px] w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function MiniPoint({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      {text}
    </div>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <div className="inline-flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <span>{text}</span>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  );
}
