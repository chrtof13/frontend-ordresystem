"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authedFetch } from "../../lib/client";

export default function NewJobPage() {
  const router = useRouter();

  const [tittel, setTittel] = useState("");
  const [kunde, setKunde] = useState("");
  const [telefon, setTelefon] = useState("");

  const [status, setStatus] = useState("PLANLAGT");
  const [type, setType] = useState("");
  const [dato, setDato] = useState(""); // YYYY-MM-DD
  const [sted, setSted] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [timepris, setTimepris] = useState<string>("");
  const [estimatTimer, setEstimatTimer] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = "text-sm font-medium text-slate-700 mb-1";
  const input =
    "rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white";

  async function create() {
    if (!tittel.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const body = {
        tittel: tittel.trim(),
        kunde: kunde.trim() || null,
        telefon: telefon.trim() || null,
        status: status || "PLANLAGT",
        type: type.trim() || null,
        dato: dato || null,
        sted: sted.trim() || null,
        beskrivelse: beskrivelse.trim() || null,
        timepris: timepris ? Number(timepris) : null,
        estimatTimer: estimatTimer ? Number(estimatTimer) : null,
        timerGjort: 0,
      };

      const res = await authedFetch(router, `/api/oppdrag`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const created = (await res.json()) as { id: number };
      router.replace(`/jobs/${created.id}/edit`);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke opprette oppdrag");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl">
        <div className="ob-page-heading"><div><span className="ob-eyebrow">OPPDRAG / NYTT OPPDRAG</span><h1>Opprett et oppdrag</h1><p>Start med det viktigste. Du kan legge til flere detaljer senere.</p></div></div>
        {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <form onSubmit={e => { e.preventDefault(); if (!saving) create(); }} className="space-y-5">
          <section className="ob-panel"><div className="ob-panel-title"><div><h2>1. Hva skal gjøres?</h2><p>Gi oppdraget et navn som er lett å finne igjen. Kun tittel er påkrevd.</p></div></div><div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col sm:col-span-2"><label htmlFor="job-title" className={label}>Tittel <span className="text-emerald-800">*</span></label><input id="job-title" required className={input} value={tittel} onChange={e => setTittel(e.target.value)} placeholder="For eksempel: Oppussing av bad – Storgata 12" /></div>
            <div className="flex flex-col"><label htmlFor="job-status" className={label}>Status</label><select id="job-status" className={input} value={status} onChange={e => setStatus(e.target.value)}><option value="PLANLAGT">Planlagt</option><option value="PÅGÅR">Pågår</option><option value="FERDIG">Ferdig</option><option value="FULLFØRT">Fullført</option></select></div>
            <div className="flex flex-col"><label htmlFor="job-type" className={label}>Type arbeid</label><input id="job-type" className={input} value={type} onChange={e => setType(e.target.value)} placeholder="For eksempel: Rørleggerarbeid" /></div>
            <div className="flex flex-col sm:col-span-2"><label htmlFor="job-description" className={label}>Beskrivelse</label><textarea id="job-description" className={input} rows={4} value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} placeholder="Hva er avtalt med kunden?" /></div>
          </div></section>
          <section className="ob-panel"><div className="ob-panel-title"><div><h2>2. Kunde og sted</h2><p>Kontaktinformasjon og hvor arbeidet skal utføres.</p></div></div><div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col"><label htmlFor="job-customer" className={label}>Kundenavn</label><input id="job-customer" className={input} value={kunde} onChange={e => setKunde(e.target.value)} autoComplete="name" placeholder="Navn eller firma" /></div>
            <div className="flex flex-col"><label htmlFor="job-phone" className={label}>Telefon</label><input id="job-phone" className={input} type="tel" autoComplete="tel" value={telefon} onChange={e => setTelefon(e.target.value)} placeholder="Telefonnummer" /></div>
            <div className="flex flex-col"><label htmlFor="job-place" className={label}>Sted / adresse</label><input id="job-place" className={input} value={sted} onChange={e => setSted(e.target.value)} placeholder="Adresse for oppdraget" /></div>
            <div className="flex flex-col"><label htmlFor="job-date" className={label}>Planlagt dato</label><input id="job-date" className={input} type="date" value={dato} onChange={e => setDato(e.target.value)} /></div>
          </div></section>
          <section className="ob-panel"><div className="ob-panel-title"><div><h2>3. Tid og pris</h2><p>Valgfritt estimat. Dette kan justeres underveis.</p></div></div><div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col"><label htmlFor="job-rate" className={label}>Timepris (kr/t)</label><input id="job-rate" className={input} type="number" min="0" step="0.01" inputMode="decimal" value={timepris} onChange={e => setTimepris(e.target.value)} placeholder="0" /></div>
            <div className="flex flex-col"><label htmlFor="job-hours" className={label}>Estimerte timer</label><input id="job-hours" className={input} type="number" min="0" step="0.01" inputMode="decimal" value={estimatTimer} onChange={e => setEstimatTimer(e.target.value)} placeholder="0" /></div>
          </div></section>
          <div className="flex flex-wrap items-center justify-end gap-3"><button type="button" disabled={saving} onClick={() => router.push("/jobs")} className="ob-secondary">Avbryt</button><button type="submit" disabled={saving || !tittel.trim()} className="ob-primary disabled:opacity-60">{saving ? "Oppretter…" : "Opprett oppdrag"}</button></div>
        </form>
      </main>
    </div>
  );
}
