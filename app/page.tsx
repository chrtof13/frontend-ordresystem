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
      a: "De fleste er i gang på noen få minutter. Fyll ut informasjonen din, velg abonnement og betal – så er du klar.",
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
      q: "Hva skjer etter at jeg har betalt?",
      a: "Når betalingen er registrert, opprettes firmaet og adminbrukeren automatisk. Deretter kan du logge inn og ta systemet i bruk.",
    },
    {
      q: "Kan jeg oppgradere eller nedgradere abonnement senere?",
      a: "Ja. Du kan endre abonnement når som helst i Stripe-portalen.",
    },
    {
      q: "Er det bindingstid?",
      a: "Nei. Du kan når som helst endre eller avslutte abonnementet.",
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
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/logoV2.png"
              alt="Ordrebase"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg shadow-sm"
            />
            <span className="text-lg font-semibold tracking-tight">
              Ordrebase
            </span>
          </div>
        </div>
      </header>

      <main className="px-4 py-10">
        <h1 className="text-3xl font-semibold">Test</h1>
        <p className="mt-3 text-slate-600">
          Hvis den svarte boksen fortsatt er her, kommer den ikke fra denne
          siden.
        </p>
      </main>
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
