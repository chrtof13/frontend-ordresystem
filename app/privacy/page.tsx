import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personvern | Ordrebase",
  description: "Hvordan Ordrebase behandler personopplysninger.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Personvernerklæring</h1>

        <p className="mt-4 text-slate-600">
          Denne personvernerklæringen forklarer hvordan Ordrebase samler inn og
          bruker informasjon når du bruker tjenesten vår.
        </p>

        <section className="mt-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <div>
            <h2 className="font-semibold text-lg">
              1. Hvilke opplysninger vi samler inn
            </h2>
            <p>Når du bruker Ordrebase kan vi lagre informasjon som:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Navn og e-postadresse</li>
              <li>Firmaopplysninger</li>
              <li>Kundedata du selv legger inn</li>
              <li>Oppdragsinformasjon og dokumenter</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              2. Hvordan vi bruker informasjonen
            </h2>
            <p>
              Opplysningene brukes for å levere og forbedre tjenesten,
              inkludert:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Administrere brukerkontoer</li>
              <li>Sende tilbud, kontrakter og rapporter</li>
              <li>Forbedre funksjonalitet og sikkerhet</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg">3. Lagring av data</h2>
            <p>
              Data lagres sikkert hos våre leverandører. Vi bruker moderne
              sikkerhetstiltak for å beskytte informasjon mot uautorisert
              tilgang.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">4. Deling av data</h2>
            <p>
              Vi selger aldri personopplysninger. Data deles kun med nødvendige
              leverandører som hosting eller e-posttjenester for å levere
              tjenesten.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">5. Dine rettigheter</h2>
            <p>
              Du har rett til å få innsyn i, rette eller slette dine
              opplysninger. Kontakt oss dersom du ønsker dette.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">6. Kontakt</h2>
            <p>
              Har du spørsmål om personvern kan du kontakte oss på:
              <br />
              <strong>post@ordrebase.no</strong>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
