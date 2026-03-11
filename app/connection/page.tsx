import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt | Ordrebase",
  description:
    "Ta kontakt med Ordrebase hvis du har spørsmål om oppdragsstyring, tilbud, kontrakt eller abonnement.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg">
            Ordrebase
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Til forsiden
            </Link>
            <Link
              href="/kom-i-gang"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-semibold">Kontakt</h1>
          <p className="mt-3 text-slate-600 leading-relaxed max-w-2xl">
            Har du spørsmål om Ordrebase, abonnement, funksjoner eller om
            systemet passer for deg? Send en melding, så svarer jeg så raskt jeg
            kan.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Kontaktinformasjon</h2>
              <p className="mt-3 text-sm text-slate-600">
                Den enkleste måten å kontakte meg på er via e-post.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    E-post
                  </div>
                  <a
                    href="mailto:ordrebase.app@gmail.com"
                    className="mt-1 inline-block text-sm font-semibold text-slate-900 hover:underline"
                  >
                    ordrebase.app@gmail.com
                  </a>
                </div>

                <a
                  href="mailto:ordrebase.app@gmail.com?subject=Spørsmål om Ordrebase"
                  className="inline-flex rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Send e-post
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Hva kan du spørre om?</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>• Hvilket abonnement som passer best</li>
                <li>• Hvordan tilbud og kontrakt fungerer</li>
                <li>• Om Ordrebase passer for din bedrift</li>
                <li>• Hjelp til å komme i gang</li>
                <li>• Innspill eller ønsker til nye funksjoner</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Send en rask melding</h2>
          <p className="mt-2 text-slate-600">
            Dette åpner brukerens e-postapp ferdig utfylt.
          </p>

          <form
            className="mt-6 space-y-4"
            action="mailto:ordrebase.app@gmail.com"
            method="post"
            encType="text/plain"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Navn
              </label>
              <input
                name="Navn"
                type="text"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ditt navn"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                E-post
              </label>
              <input
                name="E-post"
                type="email"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="navn@firma.no"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Melding
              </label>
              <textarea
                name="Melding"
                rows={6}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Skriv spørsmålet ditt her..."
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Åpne e-postmelding
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
