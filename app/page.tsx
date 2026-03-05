"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type FaqItem = { q: string; a: string };

export default function LandingPage() {
  const router = useRouter();

  const faqs: FaqItem[] = useMemo(
    () => [
      {
        q: "Må kunden logge inn for å godta tilbud?",
        a: "Nei. Kunden får en lenke på e-post og kan godta/avslå uten innlogging.",
      },
      {
        q: "Hva om kunden ikke får åpnet lenken?",
        a: "Kunden kan fortsatt svare ved å trykke “Svar” i e-posten. Du kan legge inn Reply-To e-post på tilbudet, slik at kunden alltid kan kontakte deg.",
      },
      {
        q: "Kan jeg sende kontrakt uansett status?",
        a: "Ja. Du kan sende kontrakt når som helst (f.eks. etter aksept, eller om dere vil avklare detaljer først).",
      },
      {
        q: "Er kontrakten “juridisk gyldig”?",
        a: "Jeg kan ikke gi juridisk rådgivning, men i praksis brukes tilbud + aksept ofte som avtalegrunnlag. Du kan også legge inn standardvilkår i kontrakten og få kunden til å signere digitalt senere.",
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logoV2.png"
              alt="Ordrebase"
              width={36}
              height={36}
              className="rounded-lg"
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
            <button
              onClick={() => router.push("/login")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Logg inn
            </button>
            <button
              onClick={() => router.push("/register")}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start gratis
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Pristilbud → Aksept → Kontrakt → Ordre
            </span>

            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Send pristilbud som kunden kan godta på mobilen.
            </h1>

            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              Ordrebase gjør det enkelt å lage tilbud, sende PDF på e-post, la
              kunden godta/avslå via lenke, og sende kontrakt når du vil.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/register")}
                className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Start gratis
              </button>
              <button
                onClick={() => router.push("/quotes")}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Gå til systemet
              </button>
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Klar på minutter
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Mobilvennlig
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                PDF + e-post
              </div>
            </div>
          </div>

          {/* “Screenshot” placeholder */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <div className="font-semibold">Forhåndsvisning</div>
              <div className="text-xs text-slate-500">Ordrebase</div>
            </div>

            <div className="p-4">
              <Image
                src="/screenshot.png"
                alt="screenshot-dashboard.png"
                width={1200}
                height={800}
                className="rounded-xl border border-slate-200 shadow-sm"
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
            En enkel flyt som sparer deg tid og gir færre misforståelser.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Step
              n="1"
              title="Lag pristilbud"
              text="Fyll inn kunde, linjer og total. Generer PDF automatisk."
            />
            <Step
              n="2"
              title="Kunden godtar/avslår"
              text="Kunden klikker en lenke på e-post og velger Godta/Avslå."
            />
            <Step
              n="3"
              title="Send kontrakt"
              text="Send kontrakt når dere er klare. Alt samlet på ett sted."
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <h2 className="text-2xl font-semibold">Funksjoner</h2>
        <p className="mt-2 text-slate-600">
          Bygget for små bedrifter og håndverkere som vil jobbe raskere.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature
            title="Pristilbud med PDF"
            text="Lag profesjonelle tilbud og send PDF på e-post."
          />
          <Feature
            title="Lenke for godkjenning"
            text="Kunden kan godta/avslå uten innlogging."
          />
          <Feature
            title="Kontrakt på 1 klikk"
            text="Send kontrakt til kunden når som helst."
          />
          <Feature
            title="Reply-To e-post"
            text="Kunden kan alltid trykke “Svar” og kontakte deg."
          />
          <Feature
            title="Oversikt og status"
            text="Hold styr på DRAFT / SENT / ACCEPTED / DECLINED."
          />
          <Feature
            title="Mobilvennlig"
            text="Kunden kan godta tilbudet rett fra mobilen."
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
          <div className="text-sm text-slate-500">
            *Du kan endre prisene når du vil.
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PriceCard
            name="Gratis"
            price="0 kr"
            sub="For å teste systemet"
            features={[
              "Inntil 10 tilbud / mnd",
              "PDF + e-post",
              "Kundelenke (godta/avslå)",
            ]}
            cta="Start gratis"
            onClick={() => router.push("/register")}
          />
          <PriceCard
            highlight
            name="Pro"
            price="199 kr"
            sub="Mest populær"
            features={[
              "Ubegrenset tilbud",
              "Kontrakt på 1 klikk",
              "E-postvarsler",
              "Prioritert støtte",
            ]}
            cta="Kom i gang"
            onClick={() => router.push("/register")}
          />
          <PriceCard
            name="Team"
            price="399 kr"
            sub="For flere brukere"
            features={[
              "Flere brukere",
              "Firmaoppsett",
              "Ubegrenset alt",
              "Avanserte rapporter (senere)",
            ]}
            cta="Kontakt"
            onClick={() => router.push("/contact")}
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

          <div className="mt-6 space-y-3">
            {faqs.map((item, i) => (
              <Faq key={i} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-14">
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold">
              Klar til å sende ditt første pristilbud?
            </h3>
            <p className="mt-2 text-slate-300">
              Opprett konto og test flyten med kundelenke + kontrakt.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/register")}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Start gratis
            </button>
            <button
              onClick={() => router.push("/login")}
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/15"
            >
              Logg inn
            </button>
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
            <a className="hover:text-slate-900" href="/privacy">
              Personvern
            </a>
            <a className="hover:text-slate-900" href="/terms">
              Vilkår
            </a>
            <a className="hover:text-slate-900" href="/contact">
              Kontakt
            </a>
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
  onClick,
  highlight,
}: {
  name: string;
  price: string;
  sub: string;
  features: string[];
  cta: string;
  onClick: () => void;
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

      <button
        onClick={onClick}
        className={[
          "mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold",
          highlight
            ? "bg-emerald-700 text-white hover:bg-emerald-600"
            : "border border-slate-200 bg-white hover:bg-slate-50",
        ].join(" ")}
      >
        {cta}
      </button>
    </div>
  );
}

function Faq({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
      >
        <span className="font-semibold">{item.q}</span>
        <span className="text-slate-500">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
          {item.a}
        </div>
      )}
    </div>
  );
}
