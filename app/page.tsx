import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import FaqAccordion, { type FaqItem } from "./FaqAccordion";

export const metadata: Metadata = {
  title: "Ordrebase | Ordrestyring og oppdragsstyring for håndverkere",
  description:
    "Ordrebase hjelper håndverkere og bedrifter med ordrestyring og oppdragsstyring: tilbud, kundegodkjenning via lenke, kontrakt, dokumentasjon og full oversikt.",
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
    "håndverker app",
    "system for håndverkere",
    "logg inn ordrebase",
  ],
  openGraph: {
    title: "Ordrebase | Ordrestyring for håndverkere",
    description:
      "Lag tilbud, få kundegodkjenning, send kontrakt og hold oversikt over alle oppdrag på ett sted.",
    type: "website",
  },
};

export default function LandingPage() {
  const faqs: FaqItem[] = [
    {
      q: "Hva er Ordrebase?",
      a: "Ordrebase er et enkelt system for ordrestyring og oppdragsstyring laget for håndverkere og bedrifter. Du kan holde oversikt over oppdrag, kunder, tilbud og kontrakter – samlet på ett sted.",
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
      a: "Ja. Mange bruker Ordrebase først og fremst for å holde oversikt over oppdrag, kunder, timer og dokumentasjon – og sender tilbud bare når det trengs.",
    },
    {
      q: "Kan jeg bruke Ordrebase på mobil?",
      a: "Ja. Ordrebase fungerer i nettleseren på mobil, nettbrett og PC. Kundelenker og tilbud er også optimalisert for mobil.",
    },
    {
      q: "Hva skjer etter at jeg har betalt?",
      a: "Når betalingen er registrert, opprettes firmaet og adminbrukeren automatisk. Deretter kan du logge inn og begynne å bruke systemet med en gang.",
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
      "Ordrestyring og oppdragsstyring for håndverkere og bedrifter: tilbud, kundegodkjenning via lenke, kontrakt, dokumentasjon og oversikt.",
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
      <Script
        id="ordrebase-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="border-b border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-white/80">
            Har du allerede en konto i Ordrebase?
          </div>
          <Link
            href="/login"
            className="inline-flex w-fit items-center rounded-xl bg-white px-3 py-1.5 font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Logg inn her
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/logoV2.png"
              alt="Ordrebase logo"
              width={38}
              height={38}
              className="rounded-xl shadow-sm"
              priority
            />
            <span className="truncate text-lg font-semibold tracking-tight">
              Ordrebase
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 lg:flex">
            <a href="#features" className="transition hover:text-slate-900">
              Funksjoner
            </a>
            <a href="#why" className="transition hover:text-slate-900">
              Hvorfor Ordrebase
            </a>
            <a href="#how" className="transition hover:text-slate-900">
              Hvordan det funker
            </a>
            <a href="#pricing" className="transition hover:text-slate-900">
              Pris
            </a>
            <a href="#faq" className="transition hover:text-slate-900">
              FAQ
            </a>
            <Link href="/contact" className="transition hover:text-slate-900">
              Kontakt
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:px-4"
            >
              Logg inn
            </Link>

            <Link
              href="/demo"
              className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 md:inline-flex"
            >
              Se demo
            </Link>

            <Link
              href="/kom-i-gang"
              className="rounded-2xl bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 sm:px-5 sm:py-3"
            >
              Prøv gratis
            </Link>
          </div>
        </div>
      </header>

      <section className="overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:pb-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                For håndverkere og bedrifter
              </span>

              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Få kontroll på tilbud, oppdrag og kontrakter – på ett sted.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                Ordrebase er et enkelt system for ordrestyring og
                oppdragsstyring. Lag tilbud, få kundegodkjenning via lenke, send
                kontrakt og hold oversikt over alle jobber uten Excel, meldinger
                og rot.
              </p>

              <div className="mt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                >
                  Har du allerede bruker? Logg inn her
                </Link>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/kom-i-gang"
                  className="rounded-2xl bg-emerald-700 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Prøv 14 dager gratis
                </Link>
                <Link
                  href="/demo"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Se demo
                </Link>
                <Link
                  href="/login"
                  className="rounded-2xl border border-slate-200 bg-slate-100 px-6 py-3.5 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-200 sm:hidden"
                >
                  Logg inn
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-600">
                <TrustItem text="Ingen bindingstid" />
                <TrustItem text="Trygg betaling med Stripe" />
                <TrustItem text="Tilgang med en gang" />
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                <QuickStat
                  value="1 sted"
                  label="for tilbud, kontrakt og oppdrag"
                />
                <QuickStat
                  value="0 innlogging"
                  label="for kunder som skal godkjenne"
                />
                <QuickStat
                  value="Under minuttet"
                  label="fra betaling til oppstart"
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 -top-6 hidden h-24 w-24 rounded-full bg-emerald-100 blur-2xl lg:block" />
              <div className="absolute -bottom-6 -right-6 hidden h-24 w-24 rounded-full bg-sky-100 blur-2xl lg:block" />

              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <div className="font-semibold">Ordrebase oversikt</div>
                    <div className="text-xs text-slate-500">
                      Tilbud, oppdrag og status samlet
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Live oversikt
                  </div>
                </div>

                <div className="p-4">
                  <Image
                    src="/screenshot-dashboard.png"
                    alt="Ordrebase dashboard med oversikt over oppdrag, tilbud og status"
                    width={1200}
                    height={800}
                    className="rounded-2xl border border-slate-200 shadow-sm"
                    priority
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
                  <MiniCard
                    title="Tilbud sendt"
                    text="Send profesjonelle tilbud på en ryddig måte."
                  />
                  <MiniCard
                    title="Godkjent via lenke"
                    text="Kunden svarer uten å logge inn."
                  />
                  <MiniCard
                    title="Klar for oppdrag"
                    text="Følg jobben videre med full historikk."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <div className="font-semibold text-slate-900">
              Derfor velger bedrifter Ordrebase:
            </div>
            <div>Bedre oversikt</div>
            <div>Ryddigere kundeprosess</div>
            <div>Mindre manuelt arbeid</div>
            <div>Mer profesjonell fremtoning</div>
          </div>
        </div>
      </section>

      <section id="why" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Slutt å holde styr på jobbene i Excel, notater og meldinger
            </h2>
            <p className="mt-3 text-slate-600">
              Mange håndverkere mister oversikt når tilbud, kontrakter,
              kundesvar, bilder og oppdragsstatus ligger på forskjellige steder.
              Ordrebase samler hele flyten i ett system.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ProblemCard
              title="Typiske utfordringer uten et system"
              items={[
                "Tilbud sendes manuelt og er vanskelige å følge opp",
                "Kundesvar kommer på SMS, telefon eller e-post",
                "Lite oversikt over hvilke jobber som er aktive",
                "Dokumentasjon og historikk blir liggende spredt",
              ]}
              tone="bad"
            />
            <ProblemCard
              title="Slik hjelper Ordrebase"
              items={[
                "Send tilbud og kontrakter i en ryddig flyt",
                "La kunden godkjenne direkte via lenke",
                "Få oversikt over status på alle oppdrag",
                "Samle dokumentasjon, historikk og kundeinformasjon på ett sted",
              ]}
              tone="good"
            />
          </div>
        </div>
      </section>

      <section
        id="how"
        className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10"
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Slik fungerer det
          </h2>
          <p className="mt-2 text-slate-600">
            Fra registrering til betaling og tilgang – alt i en enkel flyt.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Step
              n="1"
              title="Opprett firma og velg abonnement"
              text="Fyll inn kontaktinformasjon, firmanavn og velg planen som passer bedriften din."
            />
            <Step
              n="2"
              title="Betal trygt med Stripe"
              text="Du sendes videre til Stripe Checkout for sikker betaling av abonnementet."
            />
            <Step
              n="3"
              title="Start å bruke Ordrebase"
              text="Firma og adminbruker opprettes automatisk, slik at du kan logge inn og komme i gang med en gang."
            />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Alt du trenger for å holde kontroll i hverdagen
          </h2>
          <p className="mt-3 text-slate-600">
            Ordrebase er laget for håndverkere og bedrifter som vil jobbe mer
            effektivt, fremstå mer profesjonelt og få bedre oversikt over både
            kunder og oppdrag.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Feature
            title="Full oppdragsoversikt"
            text="Se alle oppdrag, kunder og status samlet på ett sted. Mindre rot, færre misforståelser og bedre kontroll i hverdagen."
          />
          <Feature
            title="Profesjonelle tilbud"
            text="Lag og send pristilbud som ser ryddige og seriøse ut. Forhåndsvisning og PDF gjør det enkelt å kvalitetssikre før sending."
          />
          <Feature
            title="Kundegodkjenning med ett klikk"
            text="Kunden kan godta eller avslå tilbud direkte fra mobil eller PC – raskt, enkelt og uten innlogging."
          />
          <Feature
            title="Kontrakt i samme flyt"
            text="Når kunden har akseptert tilbudet, kan du sende kontrakt videre i samme prosess. Det gir en mer profesjonell kundereise."
          />
          <Feature
            title="Historikk og dokumentasjon"
            text="Hold orden på hva som er sendt, godkjent og fullført. Perfekt for å unngå usikkerhet og ha kontroll på hele prosessen."
          />
          <Feature
            title="Fungerer på mobil"
            text="Både kundelenker, tilbud og visninger fungerer godt på mobil – slik at kunden enkelt kan svare uansett hvor de er."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                En enklere flyt fra første kontakt til ferdig oppdrag
              </h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-slate-700">
                Med Ordrebase kan du ta kunden fra tilbud til godkjenning,
                kontrakt og videre til oppdrag – uten å hoppe mellom flere
                systemer eller miste oversikt underveis.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="space-y-3 text-sm text-slate-700">
                <FlowRow text="1. Lag tilbud" />
                <FlowRow text="2. Send lenke til kunden" />
                <FlowRow text="3. Få godkjenning eller avslag" />
                <FlowRow text="4. Send kontrakt" />
                <FlowRow text="5. Følg oppdraget videre" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Pris
            </h2>
            <p className="mt-2 text-slate-600">
              Velg planen som passer bedriften din og kom i gang med en gang.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PriceCard
            name="Basic"
            price="349 kr / mnd"
            sub="For enkeltpersonforetak og bedrifter"
            features={[
              "Opptil 2 brukere",
              "Opprett og administrer oppdrag",
              "Registrer timer og materialer",
              "Last opp bilder på oppdrag",
              "Send sluttrapport på e-post",
              "Enkel firmaoversikt og statistikk",
            ]}
            cta="Velg Basic"
            href="/kom-i-gang?plan=start"
          />
          <PriceCard
            highlight
            name="Standard"
            price="599 kr / mnd"
            sub="For team som vil ha tilbud og kontrakter i samme system"
            features={[
              "Alt i Basic",
              "Opptil 5 brukere",
              "Send pristilbud til kunder",
              "Send kontrakter",
              "Kunde kan godta / avslå via lenke",
              "PDF-dokumenter med firmalogo",
              "Rediger egne maler for tilbud og kontrakt",
            ]}
            cta="Velg Standard"
            href="/kom-i-gang?plan=pro"
          />
          <PriceCard
            name="Bedrift"
            price="899 kr / mnd"
            sub="For større firma som ønsker mer kontroll og bedre oversikt"
            features={[
              "Alt i Standard",
              "Opptil 10 brukere",
              "Mer avansert statistikk",
              "Bedre oversikt over ansatte",
              "Prioritert support",
              "Flere premium-funksjoner etter hvert",
            ]}
            cta="Velg Bedrift"
            href="/kom-i-gang?plan=bedrift"
          />
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Ingen bindingstid. Betaling håndteres trygt av Stripe.
        </p>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Spørsmål og svar
          </h2>
          <p className="mt-2 text-slate-600">
            Vanlige spørsmål fra håndverkere og bedrifter som vurderer
            Ordrebase.
          </p>

          <div className="mt-6">
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </section>

      <section
        id="kontakt"
        className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-8"
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Har du spørsmål før du velger abonnement?
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                Hvis du lurer på hvordan Ordrebase fungerer eller hvilket
                abonnement som passer best for bedriften din, kan du kontakte
                oss.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="text-sm font-semibold text-slate-900">
                Ta kontakt
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <a
                  href="mailto:kontakt@ordrebase.no"
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Send e-post
                </a>

                <Link
                  href="/contact"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold transition hover:bg-slate-50"
                >
                  Gå til kontaktsiden
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6">
        <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-10 md:flex md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Klar for å få bedre kontroll på jobber og kunder?
            </h3>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Velg abonnement, betal og få tilgang til Ordrebase med en gang.
            </p>
            <p className="mt-3 text-sm text-white/80">
              Har du allerede konto?{" "}
              <Link
                href="/login"
                className="font-semibold text-white underline underline-offset-4"
              >
                Logg inn her
              </Link>
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-0">
            <Link
              href="/kom-i-gang"
              className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Prøv 14 dager gratis
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Logg inn
            </Link>
            <Link
              href="/demo"
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Se demo
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <div className="text-sm text-slate-600">
            © {new Date().getFullYear()} Ordrebase
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <Link className="transition hover:text-slate-900" href="/privacy">
              Personvern
            </Link>
            <Link className="transition hover:text-slate-900" href="/terms">
              Vilkår
            </Link>
            <Link className="transition hover:text-slate-900" href="/contact">
              Kontakt
            </Link>
            <Link
              className="font-semibold transition hover:text-slate-900"
              href="/login"
            >
              Logg inn
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
      <span>{text}</span>
    </div>
  );
}

function QuickStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-lg font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-sm leading-relaxed text-slate-600">{label}</div>
    </div>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold tracking-tight text-slate-900">
        {title}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function FlowRow({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium">
      {text}
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
          {n}
        </div>
        <div className="font-semibold tracking-tight">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function ProblemCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "bad" | "good";
}) {
  const styles =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50"
      : "border-slate-200 bg-slate-50";

  const dot = tone === "good" ? "bg-emerald-500" : "bg-slate-400";

  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <div className="font-semibold tracking-tight text-slate-900">{title}</div>
      <ul className="mt-4 space-y-3 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="font-semibold tracking-tight">{title}</div>
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
        "rounded-3xl border bg-white p-6 shadow-sm",
        highlight
          ? "border-emerald-200 ring-2 ring-emerald-200"
          : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold tracking-tight">{name}</div>
          <div className="mt-2 text-3xl font-semibold">{price}</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-600">
            {sub}
          </div>
        </div>

        {highlight && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Anbefalt
          </span>
        )}
      </div>

      <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
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
          "mt-6 block w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold transition",
          highlight
            ? "bg-emerald-700 text-white hover:bg-emerald-600"
            : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        ].join(" ")}
      >
        {cta}
      </Link>
    </div>
  );
}
