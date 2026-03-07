import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vilkår | Ordrebase",
  description: "Vilkår for bruk av Ordrebase.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Vilkår for bruk</h1>

        <p className="mt-4 text-slate-600">
          Ved å bruke Ordrebase godtar du følgende vilkår.
        </p>

        <section className="mt-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <div>
            <h2 className="font-semibold text-lg">1. Om tjenesten</h2>
            <p>
              Ordrebase er et digitalt system for oppdragsstyring som hjelper
              bedrifter med å administrere oppdrag, tilbud og kontrakter.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">2. Brukerkonto</h2>
            <p>
              Du er ansvarlig for å holde innloggingsinformasjonen din sikker og
              for all aktivitet som skjer på din konto.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">3. Betaling og abonnement</h2>
            <p>
              Ordrebase tilbys som abonnement. Pris og funksjoner kan endres
              over tid. Eventuelle endringer varsles i forkant.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">4. Ansvar</h2>
            <p>
              Ordrebase leverer programvaren "som den er". Vi kan ikke holdes
              ansvarlig for økonomisk tap som følge av bruk av tjenesten.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">5. Oppsigelse</h2>
            <p>
              Du kan når som helst avslutte abonnementet ditt. Tilgang til
              tjenesten vil da opphøre ved slutten av betalingsperioden.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">6. Endringer i vilkår</h2>
            <p>
              Vi kan oppdatere disse vilkårene ved behov. Oppdaterte vilkår vil
              publiseres på denne siden.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
