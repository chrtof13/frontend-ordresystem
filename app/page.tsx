import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import FaqAccordion, { type FaqItem } from "./FaqAccordion";

export const metadata: Metadata = {
  title:
    "Ordrebase | Oppdragsstyring for håndverkere – tilbud, ordre og kontrakt",
  description:
    "Ordrebase hjelper håndverkere og små bedrifter med oppdragsstyring: tilbud og kontrakt, kundegodkjenning via lenke, ordrestatus, dokumentasjon og bedre oversikt.",
  keywords: [
    "oppdragsstyring",
    "ordrestyring",
    "tilbudsprogram",
    "tilbud pdf",
    "kontrakt",
    "håndverker system",
    "prosjektstyring håndverk",
    "kundegodkjenning lenke",
    "timeføring",
    "ordre og oppdrag",
  ],
  openGraph: {
    title: "Ordrebase | Oppdragsstyring for håndverkere",
    description:
      "Tilbud → godkjenning → kontrakt → ordre/oppdrag. Få full oversikt over jobber, kunder og status.",
    type: "website",
  },
};

export default function LandingPage() {
  const faqs: FaqItem[] = [
    {
      q: "Hva er Ordrebase?",
      a: "Ordrebase er et enkelt system for oppdragsstyring laget for håndverkere og små bedrifter. Du kan holde oversikt over oppdrag, kunder, tilbud og kontrakter – alt samlet på ett sted.",
    },
    {
      q: "Hvor lang tid tar det å komme i gang?",
      a: "De fleste er i gang på noen få minutter. Du oppretter konto, legger inn første oppdrag og kan begynne å bruke systemet med en gang.",
    },
    {
      q: "Må kunden logge inn for å godta tilbud?",
      a: "Nei. Kunden får en lenke på e-post og kan åpne tilbudet direkte i nettleseren. Der kan de godta eller avslå med ett klikk – uten å logge inn.",
    },
    {
      q: "Kan jeg bruke Ordrebase uten å sende tilbud?",
      a: "Ja. Mange bruker Ordrebase primært for å holde oversikt over oppdrag, kunder, timer og dokumentasjon – og sender tilbud bare når det trengs.",
    },
    {
      q: "Kan jeg bruke Ordrebase på mobil?",
      a: "Ja. Ordrebase fungerer i nettleseren både på mobil, nettbrett og PC. Kundelenker og tilbud er også optimalisert for mobil slik at kunden enkelt kan svare.",
    },
    {
      q: "Hva skjer etter at kunden godtar tilbudet?",
      a: "Når kunden godtar tilbudet, kan du fortsette oppdraget direkte i Ordrebase og sende kontrakt dersom det er nødvendig. Hele flyten fra tilbud til ferdig jobb samles på ett sted.",
    },
    {
      q: "Kan jeg oppgradere eller nedgradere abonnement senere?",
      a: "Ja. Du kan endre abonnement når som helst. Mange starter med Start og oppgraderer til Pro når de trenger tilbud og kontrakter.",
    },
    {
      q: "Er det bindingstid?",
      a: "Nei. Du kan når som helst endre eller avslutte abonnementet. Målet er at systemet skal være nyttig nok til at du vil fortsette å bruke det.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Ordrebase",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Oppdragsstyring for håndverkere og små bedrifter: tilbud, kundegodkjenning via lenke, kontrakt og ordre/oppdrag med status og oversikt.",
    offers: [
      {
        "@type": "Offer",
        name: "Basic",
        price: "349",
        priceCurrency: "NOK",
      },
      {
        "@type": "Offer",
        name: "Standard",
        price: "599",
        priceCurrency: "NOK",
      },
      {
        "@type": "Offer",
        name: "Bedrift",
        price: "899",
        priceCurrency: "NOK",
      },
    ],
    brand: { "@type": "Brand", name: "Ordrebase" },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        // @ts-ignore
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logoV2.png"
              alt="Ordrebase – oppdragsstyring"
              width={36}
              height={36}
              className="rounded-lg shadow-sm"
              priority
            />
            <span className="text-lg font-semibold tracking-tight">
              Ordrebase
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a
              href="#features"
              className="transition-colors duration-300 hover:text-slate-900"
            >
              Funksjoner
            </a>
            <a
              href="#how"
              className="transition-colors duration-300 hover:text-slate-900"
            >
              Hvordan det funker
            </a>
            <a
              href="#pricing"
              className="transition-colors duration-300 hover:text-slate-900"
            >
              Pris
            </a>
            <a
              href="#faq"
              className="transition-colors duration-300 hover:text-slate-900"
            >
              FAQ
            </a>
            <a
              href="#kontakt"
              className="transition-colors duration-300 hover:text-slate-900"
            >
              Kontakt
            </a>
            <Link
              href="/demo"
              className="transition-colors duration-300 hover:text-slate-900"
            >
              Demo
            </Link>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/kom-i-gang"
              className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg"
            >
              Start gratis
            </Link>

            <Link
              href="/demo"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
            >
              Se demo
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-120px] top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute right-[-80px] top-24 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/70 to-transparent" />
        </div>

        <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                Oppdrag → Status → Dokumentasjon → Tilbud → Kontrakt
              </span>

              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Oppdragsstyring som gjør det lett å holde kontroll.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                Ordrebase er laget for håndverkere og små bedrifter som vil ha
                en enkel oversikt over oppdrag, kunder og status – og samtidig
                kunne sende tilbud og kontrakt når det trengs.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/kom-i-gang"
                  className="rounded-2xl bg-emerald-700 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg"
                >
                  Start gratis
                </Link>
                <Link
                  href="/login"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
                >
                  Gå til systemet
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                  Klar på minutter
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                  Mobilvennlig for kunder
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                  Bedre oversikt på oppdrag
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                {[
                  "Ingen binding",
                  "Gratis oppstart",
                  "Laget for håndverkere",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="font-semibold">Oversikt</div>
                <div className="text-xs text-slate-500">Ordrebase</div>
              </div>

              <div className="p-4">
                <Image
                  src="/screenshot-dashboard.png"
                  alt="Ordrebase dashboard – oversikt over oppdrag og status"
                  width={1200}
                  height={800}
                  className="rounded-xl border border-slate-200 shadow-sm transition-transform duration-500 group-hover:scale-[1.015]"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Slik fungerer Ordrebase
          </h2>
          <p className="mt-2 text-slate-600">
            Fra første kundehenvendelse til ferdig jobb – Ordrebase gir deg en
            enkel flyt som sparer tid og gir bedre kontroll.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Step
              n="1"
              title="Opprett oppdrag på få sekunder"
              text="Legg inn kunde, jobb, status, timer og viktig informasjon på ett sted. Enkelt å komme i gang, enkelt å holde oversikt."
            />
            <Step
              n="2"
              title="Send tilbud og få svar raskere"
              text="Lag profesjonelle pristilbud som PDF og send dem direkte til kunden. Kunden kan godta eller avslå via lenke på sekunder – uten innlogging."
            />
            <Step
              n="3"
              title="Fullfør jobben med full kontroll"
              text="Dokumenter arbeid, bilder, materialer og framdrift underveis. Når jobben er klar, kan du sende rapport og kontrakt på en ryddig og profesjonell måte."
            />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Alt du trenger for å holde kontroll
        </h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          Ordrebase er laget for håndverkere og små bedrifter som vil jobbe mer
          effektivt, fremstå mer profesjonelt og få bedre oversikt i hverdagen.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Feature
            title="Full oppdragsoversikt"
            text="Se alle oppdrag, kunder og status samlet på ett sted. Mindre rot, færre misforståelser og bedre kontroll i hverdagen."
          />
          <Feature
            title="Profesjonelle pristilbud"
            text="Lag og send pristilbud som ser ryddige og seriøse ut. PDF-visning og forhåndsvisning gjør det enkelt å kvalitetssikre før sending."
          />
          <Feature
            title="Kundegodkjenning med ett klikk"
            text="Kunden kan godta eller avslå tilbudet direkte fra mobilen eller PC-en – raskt, enkelt og uten å måtte logge inn."
          />
          <Feature
            title="Kontrakter klare når tilbudet er godkjent"
            text="Når kunden har akseptert tilbudet, kan du sende kontrakt videre i samme flyt. Det gir en mer profesjonell prosess fra start til slutt."
          />
          <Feature
            title="Historikk og dokumentasjon"
            text="Hold orden på hva som er sendt, godkjent og fullført. Perfekt for å unngå usikkerhet og ha kontroll på hele kundereisen."
          />
          <Feature
            title="Ser bra ut på mobil"
            text="Både kundelenker, tilbud og visninger fungerer flott på mobil – slik at kunden enkelt kan svare uansett hvor de er."
          />
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Pris</h2>
            <p className="mt-2 text-slate-600">
              Start enkelt. Oppgrader når du vil.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PriceCard
            name="Basic"
            price="349 kr / mnd"
            sub="For små bedrifter og enkeltpersoner"
            features={[
              "Opptil 2 brukere",
              "Opprett og administrer oppdrag",
              "Registrer timer og materialer",
              "Last opp bilder på oppdrag",
              "Send sluttrapport på e-post",
              "Enkel firmaoversikt og statistikk",
            ]}
            cta="Start gratis"
            href="/kom-i-gang?plan=start"
          />
          <PriceCard
            highlight
            name="Standard"
            price="599 kr / mnd"
            sub="Mest populær – perfekt for voksende bedrifter"
            features={[
              "Alt i basic",
              "Opptil 5 brukere",
              "Send pristilbud til kunder",
              "Send kontrakter",
              "Kunde kan godta / avslå via lenke",
              "PDF-dokumenter med firmalogo",
              "Rediger egne maler for tilbud og kontrakt",
            ]}
            cta="Kom i gang"
            href="/kom-i-gang?plan=pro"
          />
          <PriceCard
            name="Bedrift"
            price="899 kr / mnd"
            sub="For større team"
            features={[
              "Alt i standard",
              "Opptil 10 brukere",
              "Mer avansert statistikk",
              "Bedre oversikt over ansatte",
              "Prioritert support",
              "Flere premium-funksjoner etter hvert",
            ]}
            cta="Start"
            href="/kom-i-gang?plan=bedrift"
          />
        </div>

        <p className="mt-3 text-sm text-slate-500">
          Alle abonnement inkluderer gratis oppstart. Ingen binding.
        </p>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Spørsmål og svar
          </h2>
          <p className="mt-2 text-slate-600">
            Vanlige spørsmål vi får fra små bedrifter.
          </p>

          <div className="mt-6">
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </section>

      <section id="kontakt" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Har du spørsmål før du starter?
              </h2>
              <p className="mt-3 leading-relaxed text-slate-700">
                Det skal være lett å komme i kontakt. Hvis du lurer på hvordan
                Ordrebase fungerer, hvilket abonnement som passer best, eller om
                systemet passer for bedriften din, kan du sende en melding med
                en gang.
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Du trenger ikke fylle ut noe komplisert – bare ta kontakt, så
                svarer vi så raskt vi kan.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="text-sm font-semibold text-slate-900">
                Enkle måter å ta kontakt på
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <a
                  href="mailto:kontakt@ordrebase.no"
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
                >
                  Send e-post
                </a>

                <Link
                  href="/contact"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
                >
                  Gå til kontaktsiden
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-2xl sm:p-10 md:flex-row md:items-center">
          <div className="absolute inset-0 -z-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Klar for bedre oversikt over oppdragene?
            </h3>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Kom i gang på få minutter og få mer kontroll på oppdrag, kunder og
              tilbud.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/kom-i-gang"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-lg"
            >
              Start gratis
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15"
            >
              Logg inn
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <div className="text-sm text-slate-600">
            © {new Date().getFullYear()} Ordrebase
          </div>
          <div className="flex gap-4 text-sm text-slate-600">
            <Link
              className="transition-colors duration-300 hover:text-slate-900"
              href="/privacy"
            >
              Personvern
            </Link>
            <Link
              className="transition-colors duration-300 hover:text-slate-900"
              href="/terms"
            >
              Vilkår
            </Link>
            <Link
              className="transition-colors duration-300 hover:text-slate-900"
              href="/contact"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white transition-transform duration-300 group-hover:scale-105">
          {n}
        </div>
        <div className="font-semibold tracking-tight">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
      <div className="font-semibold tracking-tight transition-colors duration-300 group-hover:text-emerald-700">
        {title}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function PriceCard({
  name,
  price,
  sub,
  features,
  cta,
  href,
  highlight,
}: {
  name: string;
  price: string;
  sub: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "group relative rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        highlight
          ? "border-emerald-200 ring-2 ring-emerald-200"
          : "border-slate-200 hover:border-slate-300",
      ].join(" ")}
    >
      {highlight && (
        <div className="pointer-events-none absolute inset-x-6 top-0 h-24 bg-emerald-100/40 blur-2xl" />
      )}

      <div className="relative flex items-start justify-between">
        <div>
          <div className="font-semibold tracking-tight">{name}</div>
          <div className="mt-2 text-3xl font-semibold">{price}</div>
          <div className="mt-1 text-sm text-slate-600">{sub}</div>
        </div>

        {highlight && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Anbefalt
          </span>
        )}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-slate-700">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={[
          "mt-6 block w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold transition-all duration-300",
          highlight
            ? "bg-emerald-700 text-white shadow-sm hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg"
            : "border border-slate-200 bg-white hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md",
        ].join(" ")}
      >
        {cta}
      </Link>
    </div>
  );
}
