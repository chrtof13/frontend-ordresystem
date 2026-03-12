"use client";

import { useRouter } from "next/navigation";
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
} from "lucide-react";

const flowSteps = [
  {
    title: "1. Lag pristilbud",
    text: "Opprett et pristilbud raskt ved å legge inn arbeid, timer og materialer.",
    image: "/demo/lagPristilbud.png",
  },
  {
    title: "2. Send pristilbud til kunde",
    text: "Send tilbudet direkte til kunden. Kunden kan åpne og godkjenne det digitalt.",
    image: "/demo/snedPristilbud.png",
  },
  {
    title: "3. Send kontrakt",
    text: "Når tilbudet er akseptert kan du sende kontrakt til kunden direkte fra systemet.",
    image: "/demo/sendKontrakt.png",
  },
  {
    title: "4. Se alle pristilbud",
    text: "Alle pristilbud lagres og listes slik at du enkelt kan følge opp kunder.",
    image: "/demo/seAllePristilbud.png",
  },
  {
    title: "5. Lag oppdrag",
    text: "Når jobben starter kan du opprette et oppdrag hvor timer, bilder og materialer lagres.",
    image: "/demo/oppdragOversikt.png",
  },
  {
    title: "6. Send rapport til kunden",
    text: "Når oppdraget er ferdig kan du sende en rapport til kunden med bilder og oppsummering.",
    image: "/demo/sendRapport.png",
  },
  {
    title: "7. Oversikt over alle oppdrag",
    text: "Alle oppdrag listes slik at du enkelt ser hva som er aktivt og hva som er ferdig.",
    image: "/demo/oppdragOversikt.png",
  },
  {
    title: "8. Oversikt over økonomi",
    text: "Følg med på inntekt, materialkostnader og timer for hvert oppdrag.",
    image: "/demo/statistikk.png",
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
    title: "Send pristilbud og kontrakter",
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

export default function DemoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-tight">
              Ordrebase
            </div>
            <div className="text-xs text-slate-500">Demo</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Til forsiden
            </button>
            <button
              onClick={() => router.push("/login")}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Prøv Ordrebase
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              Enklere system for håndverksbedrifter
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Se hvordan Ordrebase gjør det enklere å holde orden på oppdrag,
              kunder og dokumentasjon.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Ordrebase er laget for små og mellomstore håndverksbedrifter som
              vil samle oppdrag, pristilbud, bilder, materialer og rapporter i
              ett enkelt system.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/register")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Start gratis prøveperiode
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("screenshots");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Se skjermbilder
              </button>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Stat
                icon={Clock3}
                label="Mindre admin"
                value="Mer tid til jobb"
              />
              <Stat
                icon={ShieldCheck}
                label="Bedre oversikt"
                value="Alt samlet"
              />
              <Stat
                icon={Users}
                label="Raskere flyt"
                value="Enklere for teamet"
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-200 bg-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-300" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-emerald-300" />
                </div>
              </div>

              <div className="aspect-[16/10] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-white">
                <div className="grid h-full grid-cols-[220px_1fr] gap-4">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <div className="text-sm font-semibold text-white/90">
                      Ordrebase
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-white/70">
                      <div className="rounded-xl bg-white/10 px-3 py-2">
                        Dashboard
                      </div>
                      <div className="rounded-xl bg-white/10 px-3 py-2">
                        Oppdrag
                      </div>
                      <div className="rounded-xl bg-white/10 px-3 py-2">
                        Pristilbud
                      </div>
                      <div className="rounded-xl bg-white/10 px-3 py-2">
                        Kunder
                      </div>
                      <div className="rounded-xl bg-white/10 px-3 py-2">
                        Rapporter
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-rows-[auto_1fr] gap-4">
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                      <div className="text-sm text-white/70">
                        Aktive oppdrag
                      </div>
                      <div className="mt-1 text-3xl font-semibold">12</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                      <div className="col-span-2 rounded-2xl bg-white/10 p-4 backdrop-blur">
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
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
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
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20"
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Slik fungerer Ordrebase
            </h2>
            <p className="mt-3 text-slate-600">
              Under ser du den typiske flyten i systemet – fra pristilbud til
              ferdig oppdrag og rapport til kunden.
            </p>
          </div>

          <div className="mt-10 space-y-10">
            {flowSteps.map((step, index) => (
              <div
                key={step.title}
                className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr] items-center"
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="aspect-[16/10] bg-slate-100">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="text-sm font-semibold text-emerald-700">
                    Steg {index + 1}
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-slate-600">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Slik fungerer Ordrebase
              </h2>
              <p className="mt-3 text-slate-600">
                En enkel flyt som passer bedrifter som vil bruke mindre tid på
                administrasjon og mer tid på jobb.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
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

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="rounded-[32px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm sm:p-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Klar for å teste Ordrebase?
              </h2>
              <p className="mt-3 text-slate-600">
                Prøv systemet gratis og se om det passer for bedriften deres.
                Testperioden er uforpliktende.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/register")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Start gratis test
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => router.push("/contact")}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Be om demo
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Ingen bindingstid i testperioden
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Enkelt å komme i gang
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Bygget for norske håndverksbedrifter
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
