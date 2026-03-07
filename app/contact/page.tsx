import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kontakt | Ordrebase",
  description: "Kontakt Ordrebase for spørsmål eller hjelp.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6"
      >
        ← Tilbake til forsiden
      </Link>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Kontakt oss</h1>

        <p className="mt-4 text-slate-600">
          Har du spørsmål om Ordrebase, abonnement eller funksjoner? Ta gjerne
          kontakt.
        </p>

        <div className="mt-8 space-y-6 text-sm text-slate-700">
          <div>
            <h2 className="font-semibold">E-post</h2>
            <p>ordrebase@gmail.com</p>
          </div>

          <div>
            <h2 className="font-semibold">Support</h2>
            <p>Vi svarer normalt innen 24 timer på hverdager.</p>
          </div>

          <div>
            <h2 className="font-semibold">Om Ordrebase</h2>
            <p>
              Ordrebase er et system for oppdragsstyring laget for håndverkere
              og små bedrifter som ønsker bedre kontroll på oppdrag, tilbud og
              kontrakter.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
