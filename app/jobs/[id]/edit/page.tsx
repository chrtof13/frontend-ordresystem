"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Oppdrag, OppdragBilde, OppdragMaterial } from "../../../lib/api";
import { authedFetch, authedUpload, API } from "../../../lib/client";

export default function JobEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [job, setJob] = useState<Oppdrag | null>(null);
  const [bilder, setBilder] = useState<OppdragBilde[]>([]);
  const [materialer, setMaterialer] = useState<OppdragMaterial[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // edit fields
  const [tittel, setTittel] = useState("");
  const [kunde, setKunde] = useState("");
  const [telefon, setTelefon] = useState("");
  const [status, setStatus] = useState("PLANLAGT");
  const [dato, setDato] = useState("");
  const [sted, setSted] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [type, setType] = useState("");
  const [timepris, setTimepris] = useState<string>("");
  const [estimatTimer, setEstimatTimer] = useState<string>("");

  // ✅ NYTT: timer gjort
  const [timerGjort, setTimerGjort] = useState<string>("");

  // image/material forms
  const [headerCaption, setHeaderCaption] = useState("");
  const [progCaption, setProgCaption] = useState("");

  // (valgfritt) behold URL inputs om du vil (kan fjernes helt)
  const [headerUrl, setHeaderUrl] = useState("");
  const [progUrl, setProgUrl] = useState("");

  // FILE inputs
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [progFile, setProgFile] = useState<File | null>(null);

  // material form
  const [matNavn, setMatNavn] = useState("");
  const [matPris, setMatPris] = useState<string>("");
  const [matAntall, setMatAntall] = useState<string>("");
  const [matEnhet, setMatEnhet] = useState("stk");

  const imgSrc = (u: string) => (u.startsWith("http") ? u : `${API}${u}`);

  async function loadAll() {
    setError(null);
    setLoading(true);

    try {
      const [jobRes, bilderRes, matRes] = await Promise.all([
        authedFetch(router, `/api/oppdrag/${id}`),
        authedFetch(router, `/api/oppdrag/${id}/bilder`),
        authedFetch(router, `/api/oppdrag/${id}/materialer`),
      ]);

      const jobData = (await jobRes.json()) as Oppdrag;
      setJob(jobData);
      setBilder((await bilderRes.json()) as OppdragBilde[]);
      setMaterialer((await matRes.json()) as OppdragMaterial[]);

      // populate fields
      setTittel(jobData.tittel ?? "");
      setKunde(jobData.kunde ?? "");
      setTelefon(jobData.telefon ?? "");
      setStatus(jobData.status ?? "PLANLAGT");
      setDato(jobData.dato ?? "");
      setSted(jobData.sted ?? "");
      setBeskrivelse(jobData.beskrivelse ?? "");
      setType(jobData.type ?? "");
      setTimepris(jobData.timepris != null ? String(jobData.timepris) : "");
      setEstimatTimer(
        jobData.estimatTimer != null ? String(jobData.estimatTimer) : "",
      );

      // ✅ NYTT: timerGjort
      setTimerGjort(
        jobData.timerGjort != null ? String(jobData.timerGjort) : "",
      );
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const header = useMemo(
    () => bilder.find((b) => b.kind === "HEADER") ?? null,
    [bilder],
  );

  const progress = useMemo(
    () =>
      bilder
        .filter((b) => b.kind === "PROGRESS")
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [bilder],
  );

  const matSum = useMemo(() => {
    return materialer.reduce(
      (sum, m) => sum + (m.prisPerStk ?? 0) * (m.antall ?? 0),
      0,
    );
  }, [materialer]);

  async function saveJob() {
    if (!tittel.trim()) return;

    // ✅ parse timerGjort trygt
    const timerGjortNum =
      timerGjort.trim() === "" ? null : Number(timerGjort.replace(",", "."));
    if (
      timerGjortNum != null &&
      (!Number.isFinite(timerGjortNum) || timerGjortNum < 0)
    ) {
      setError("Timer gjort må være et gyldig tall (0 eller mer).");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const body = {
        tittel: tittel.trim(),
        kunde: kunde.trim() || null,
        telefon: telefon.trim() || null,
        status: status || "PLANLAGT",
        dato: dato || null,
        sted: sted.trim() || null,
        beskrivelse: beskrivelse.trim() || null,
        type: type.trim() || null,
        timepris: timepris ? Number(timepris) : null,
        estimatTimer: estimatTimer ? Number(estimatTimer) : null,

        // ✅ NYTT
        timerGjort: timerGjortNum,
      };

      await authedFetch(router, `/api/oppdrag/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke lagre oppdrag");
    } finally {
      setSaving(false);
    }
  }

  // ----------- BILDER: FILE UPLOAD (anbefalt) -----------
  async function uploadHeaderFile() {
    if (!headerFile) return;

    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("kind", "HEADER");
      form.append("caption", headerCaption.trim() ? headerCaption.trim() : "");
      form.append("sortOrder", "0");
      form.append("file", headerFile);

      await authedUpload(router, `/api/oppdrag/${id}/bilder/upload`, form);

      setHeaderFile(null);
      setHeaderCaption("");
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke laste opp header-bilde");
    } finally {
      setSaving(false);
    }
  }

  async function uploadProgressFile() {
    if (!progFile) return;

    setSaving(true);
    setError(null);
    try {
      const nextSort =
        progress.length === 0
          ? 0
          : (progress[progress.length - 1].sortOrder ?? 0) + 1;

      const form = new FormData();
      form.append("kind", "PROGRESS");
      form.append("caption", progCaption.trim() ? progCaption.trim() : "");
      form.append("sortOrder", String(nextSort));
      form.append("file", progFile);

      await authedUpload(router, `/api/oppdrag/${id}/bilder/upload`, form);

      setProgFile(null);
      setProgCaption("");
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke laste opp bilde");
    } finally {
      setSaving(false);
    }
  }

  // ----------- (valgfritt) BILDER: URL (legacy) -----------
  async function saveHeaderUrl() {
    if (!headerUrl.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await authedFetch(router, `/api/oppdrag/${id}/bilder`, {
        method: "POST",
        body: JSON.stringify({
          kind: "HEADER",
          url: headerUrl.trim(),
          caption: headerCaption.trim() ? headerCaption.trim() : null,
          sortOrder: 0,
        }),
      });

      setHeaderUrl("");
      setHeaderCaption("");
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke lagre header-bilde");
    } finally {
      setSaving(false);
    }
  }

  async function addProgressUrl() {
    if (!progUrl.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const nextSort =
        progress.length === 0
          ? 0
          : (progress[progress.length - 1].sortOrder ?? 0) + 1;

      await authedFetch(router, `/api/oppdrag/${id}/bilder`, {
        method: "POST",
        body: JSON.stringify({
          kind: "PROGRESS",
          url: progUrl.trim(),
          caption: progCaption.trim() ? progCaption.trim() : null,
          sortOrder: nextSort,
        }),
      });

      setProgUrl("");
      setProgCaption("");
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke legge til bilde");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBilde(bildeId: number) {
    const ok = confirm("Slette bilde?");
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      await authedFetch(router, `/api/oppdrag/${id}/bilder/${bildeId}`, {
        method: "DELETE",
      });
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke slette bilde");
    } finally {
      setSaving(false);
    }
  }

  async function addMaterial() {
    if (!matNavn.trim()) return;

    const pris = Number(matPris);
    const ant = Number(matAntall);
    if (!Number.isFinite(pris) || !Number.isFinite(ant)) {
      setError("Pris og antall må være tall.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const nextSort =
        materialer.length === 0
          ? 0
          : (materialer[materialer.length - 1].sortOrder ?? 0) + 1;

      await authedFetch(router, `/api/oppdrag/${id}/materialer`, {
        method: "POST",
        body: JSON.stringify({
          navn: matNavn.trim(),
          prisPerStk: pris,
          antall: ant,
          enhet: matEnhet || "stk",
          sortOrder: nextSort,
        }),
      });

      setMatNavn("");
      setMatPris("");
      setMatAntall("");
      setMatEnhet("stk");
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke legge til material");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMaterial(matId: number) {
    const ok = confirm("Slette material?");
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      await authedFetch(router, `/api/oppdrag/${id}/materialer/${matId}`, {
        method: "DELETE",
      });
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke slette material");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Laster...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Fant ikke oppdrag.</p>
        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  const label = "text-sm font-medium text-slate-700 mb-1";
  const input =
    "rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white";

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-5xl p-4 sm:p-6 space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">
            Rediger oppdrag
          </h1>
          <p className="text-slate-600 mt-1">#{job.id}</p>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/home")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Hjem
            </button>
            <button
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Til oversikt
            </button>

            <button
              onClick={saveJob}
              disabled={saving || !tittel.trim()}
              className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Lagrer..." : "Lagre endringer"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Oppdrag-felter */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Oppdrag</h2>

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

            {/* ✅ NYTT: timer gjort */}
            <div className="flex flex-col">
              <label className={label}>Timer gjort</label>
              <input
                className={input}
                inputMode="decimal"
                value={timerGjort}
                onChange={(e) => setTimerGjort(e.target.value)}
                placeholder="0"
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

        {/* ... resten av filen din (bilder/material/progress) er uendret ... */}

        {/* Header-bilde */}
        <div className="rounded-2xl bg-white overflow-hidden shadow-sm">
          {header ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc(header.url)}
                alt={header.caption ?? "Header"}
                className="w-full max-h-[340px] object-cover"
              />
              <div className="flex items-center justify-between gap-2 p-4">
                <div className="text-sm text-slate-600">
                  {header.caption ?? "Header-bilde"}
                </div>
                <button
                  onClick={() => deleteBilde(header.id)}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  disabled={saving}
                >
                  Slett header
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-slate-600">Ingen header-bilde enda.</div>
          )}

          {/* ... resten av din kode fortsetter uendret ... */}
          {/* Jeg stopper her for å ikke gjenta 400 linjer helt likt */}
        </div>
      </main>
    </div>
  );
}
