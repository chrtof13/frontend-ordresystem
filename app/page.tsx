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
      a: "Ordrebase er et enkelt system for oppdragsstyring. Du kan holde kontroll på kunder, oppdrag/ordre, status og dokumentasjon – i tillegg til tilbud og kontrakt.",
    },
    {
      q: "Må kunden logge inn for å godta tilbud?",
      a: "Nei. Kunden får en lenke på e-post og kan godta/avslå uten innlogging.",
    },
    {
      q: "Kan jeg bruke Ordrebase uten å sende tilbud?",
      a: "Ja. Mange bruker det primært for oppdragsoversikt, status, dokumentasjon og intern kontroll – og sender tilbud ved behov.",
    },
    {
      q: "Hva om kunden ikke får åpnet lenken?",
      a: "Kunden kan fortsatt svare ved å trykke “Svar” i e-posten. Du kan legge inn Reply-To på tilbudet slik at kunden alltid kan kontakte deg.",
    },
    {
      q: "Kan jeg sende kontrakt uansett status?",
      a: "Ja. Du kan sende kontrakt når som helst (for eksempel etter aksept, eller hvis dere vil avklare detaljer først).",
    },
  ];

  // Structured data (hjelper Google å forstå siden bedre)
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
        price: "199",
        priceCurrency: "NOK",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "599",
        priceCurrency: "NOK",
      },
      {
        "@type": "Offer",
        name: "Team",
        price: "699",
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

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logoV2.png"
              alt="Ordrebase – oppdragsstyring"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <span className="font-semibold text-lg">Ordrebase</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">
              Funksjoner
            </a>
            <a href="#how" className="hover:text-slate-900">
              Hvordan det funker
            </a>
            <a href="#pricing" className="hover:text-slate-900">
              Pris
            </a>
            <a href="#faq" className="hover:text-slate-900">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Logg inn
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start gratis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Oppdrag → Status → Dokumentasjon → Tilbud → Kontrakt
            </span>

            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Oppdragsstyring som gjør det lett å holde kontroll.
            </h1>

            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              Ordrebase er laget for håndverkere og små bedrifter som vil ha en
              enkel oversikt over oppdrag, kunder og status – og samtidig kunne
              sende tilbud og kontrakt når det trengs.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 text-center"
              >
                Start gratis
              </Link>
              <Link
                href="/quotes"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50 text-center"
              >
                Gå til systemet
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Klar på minutter
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Mobilvennlig for kunder
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Bedre oversikt på oppdrag
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <div className="font-semibold">Oversikt</div>
              <div className="text-xs text-slate-500">Ordrebase</div>
            </div>

            <div className="p-4">
              <Image
                src="/screenshot-dashboard.png"
                alt="Ordrebase dashboard – oversikt over oppdrag og status"
                width={1200}
                height={800}
                className="rounded-xl border border-slate-200 shadow-sm"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Hvordan det funker</h2>
          <p className="mt-2 text-slate-600">
            En enkel flyt for å holde kontroll – fra oppdrag til ferdig jobb.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Step
              n="1"
              title="Opprett oppdrag/ordre"
              text="Registrer kunde, jobb og status. Alt samles på ett sted."
            />
            <Step
              n="2"
              title="Send tilbud ved behov"
              text="Lag tilbud med PDF og la kunden godta/avslå via lenke."
            />
            <Step
              n="3"
              title="Dokumentér og fullfør"
              text="Hold oversikt underveis og samle info før/etter arbeid."
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <h2 className="text-2xl font-semibold">Funksjoner</h2>
        <p className="mt-2 text-slate-600">
          Bygget for bedrifter som vil jobbe raskere og ha bedre oversikt.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature
            title="Oppdragsoversikt"
            text="Hold kontroll på ordre/oppdrag, kunder og status – uten rot."
          />
          <Feature
            title="Tilbud med PDF"
            text="Lag profesjonelle tilbud og send PDF på e-post."
          />
          <Feature
            title="Kundegodkjenning via lenke"
            text="Kunden kan godta/avslå uten innlogging."
          />
          <Feature
            title="Kontrakt når du vil"
            text="Send kontrakt uansett status – når dere er klare."
          />
          <Feature
            title="Status og historikk"
            text="Hold orden på hva som er sendt, godkjent og ferdig."
          />
          <Feature
            title="Mobilvennlig"
            text="Kundelenker og visning fungerer bra på mobil."
          />
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold">Pris</h2>
            <p className="mt-2 text-slate-600">
              Start enkelt. Oppgrader når du vil.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PriceCard
            name="Basic"
            price="199 kr"
            sub="For å teste systemet"
            features={[
              "Oppdragsoversikt",
              "Inntil 10 tilbud / mnd",
              "PDF + e-post",
              "Kundelenke (godta/avslå)",
            ]}
            cta="Start gratis"
            href="/register"
          />
          <PriceCard
            highlight
            name="Pro"
            price="599 kr"
            sub="Mest populær"
            features={[
              "Ubegrenset tilbud",
              "Kontrakt på 1 klikk",
              "E-postvarsler",
              "Prioritert støtte",
            ]}
            cta="Kom i gang"
            href="/register"
          />
          <PriceCard
            name="Team"
            price="699 kr"
            sub="For flere brukere"
            features={[
              "Flere brukere",
              "Firmaoppsett",
              "Ubegrenset alt",
              "Avanserte rapporter (senere)",
            ]}
            cta="Kontakt"
            href="/contact"
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Spørsmål og svar</h2>
          <p className="mt-2 text-slate-600">
            Vanlige spørsmål vi får fra små bedrifter.
          </p>

          <div className="mt-6">
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-14">
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold">
              Klar for bedre oversikt over oppdragene?
            </h3>
            <p className="mt-2 text-slate-300">
              Opprett konto og test oppdragsflyten – og send tilbud når du vil.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Start gratis
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/15"
            >
              Logg inn
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            © {new Date().getFullYear()} Ordrebase
          </div>
          <div className="flex gap-4 text-sm text-slate-600">
            <Link className="hover:text-slate-900" href="/privacy">
              Personvern
            </Link>
            <Link className="hover:text-slate-900" href="/terms">
              Vilkår
            </Link>
            <Link className="hover:text-slate-900" href="/contact">
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
          {n}
        </div>
        <div className="font-semibold">{title}</div>
      </div>
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="font-semibold">{title}</div>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{text}</p>
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
        "rounded-3xl border bg-white shadow-sm p-6",
        highlight
          ? "border-emerald-200 ring-2 ring-emerald-200"
          : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{name}</div>
          <div className="mt-2 text-3xl font-semibold">{price}</div>
          <div className="mt-1 text-sm text-slate-600">{sub}</div>
        </div>
        {highlight && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
            Anbefalt
          </span>
        )}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-slate-700">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={[
          "mt-6 block w-full text-center rounded-2xl px-4 py-3 text-sm font-semibold",
          highlight
            ? "bg-emerald-700 text-white hover:bg-emerald-600"
            : "border border-slate-200 bg-white hover:bg-slate-50",
        ].join(" ")}
      >
        {cta}
      </Link>
    </div>
  );
}
