"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authedFetch } from "../../lib/client";
import Sidebar from "../../components/layout/Sidebar";

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
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <main className="mx-auto max-w-5xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Nytt oppdrag</h1>
            <p className="text-slate-600 mt-1">
              Start med tittel + kunde + status. Resten kan fylles inn senere.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/home")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Avbryt
            </button>
            <button
              onClick={create}
              disabled={saving || !tittel.trim()}
              className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Lagrer..." : "Opprett"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={label}>Tittel *</label>
              <input
                className={input}
                value={tittel}
                onChange={(e) => setTittel(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Status</label>
              <select
                className={input}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="PLANLAGT">PLANLAGT</option>
                <option value="PÅGÅR">PÅGÅR</option>
                <option value="FERDIG">FERDIG</option>
                <option value="FULLFØRT">FULLFØRT</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className={label}>Kunde</label>
              <input
                className={input}
                value={kunde}
                onChange={(e) => setKunde(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Telefon</label>
              <input
                className={input}
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Type</label>
              <input
                className={input}
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Dato</label>
              <input
                className={input}
                type="date"
                value={dato}
                onChange={(e) => setDato(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Sted</label>
              <input
                className={input}
                value={sted}
                onChange={(e) => setSted(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Timepris (kr/t)</label>
              <input
                className={input}
                inputMode="decimal"
                value={timepris}
                onChange={(e) => setTimepris(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Estimat (timer)</label>
              <input
                className={input}
                inputMode="decimal"
                value={estimatTimer}
                onChange={(e) => setEstimatTimer(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className={label}>Beskrivelse</label>
            <textarea
              className={input}
              rows={5}
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
