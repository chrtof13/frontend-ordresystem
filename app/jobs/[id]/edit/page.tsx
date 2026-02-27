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
                <option value="PAGAR">PAGAR</option>
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

          <div className="border-t border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Sett header-bilde</h2>

            {/* FILE upload */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex flex-col">
                <label className={label}>Velg bilde (PC/mobil)</label>
                <input
                  className={input}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => setHeaderFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="flex flex-col">
                <label className={label}>Caption</label>
                <input
                  className={input}
                  value={headerCaption}
                  onChange={(e) => setHeaderCaption(e.target.value)}
                  placeholder="Før-bilde"
                />
              </div>
            </div>

            <div className="flex justify-end mt-3 gap-2">
              <button
                onClick={uploadHeaderFile}
                disabled={saving || !headerFile}
                className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Lagrer..." : "Last opp header"}
              </button>
            </div>

            {/* OPTIONAL: URL legacy */}
            <div className="mt-6 rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-semibold text-slate-800 mb-2">
                (Valgfritt) Bruk URL i stedet
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 flex flex-col">
                  <label className={label}>Bilde-URL</label>
                  <input
                    className={input}
                    value={headerUrl}
                    onChange={(e) => setHeaderUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={saveHeaderUrl}
                    disabled={saving || !headerUrl.trim()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Lagre URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Materialer */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Materialkostnader</h2>
            <div className="text-sm font-semibold text-slate-700">
              Sum: {matSum.toFixed(2)} kr
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2 flex flex-col">
              <label className={label}>Navn</label>
              <input
                className={input}
                value={matNavn}
                onChange={(e) => setMatNavn(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Pris per stk</label>
              <input
                className={input}
                inputMode="decimal"
                value={matPris}
                onChange={(e) => setMatPris(e.target.value)}
                placeholder="49.90"
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Antall</label>
              <input
                className={input}
                inputMode="decimal"
                value={matAntall}
                onChange={(e) => setMatAntall(e.target.value)}
                placeholder="10"
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Enhet</label>
              <input
                className={input}
                value={matEnhet}
                onChange={(e) => setMatEnhet(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={addMaterial}
              disabled={saving || !matNavn.trim()}
              className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Legg til material
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-200">
            {materialer.length === 0 && (
              <div className="py-6 text-center text-slate-500">
                Ingen materialer lagt til.
              </div>
            )}

            {materialer
              .slice()
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((m) => (
                <div
                  key={m.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {m.navn}
                    </div>
                    <div className="text-sm text-slate-600">
                      {m.antall} {m.enhet ?? "stk"} × {m.prisPerStk} kr
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-slate-900">
                      {(m.prisPerStk * m.antall).toFixed(2)} kr
                    </div>
                    <button
                      onClick={() => deleteMaterial(m.id)}
                      disabled={saving}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Slett
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Progresjonsbilder */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Bilder underveis</h2>

          {/* FILE upload */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 flex flex-col">
              <label className={label}>Velg bilde</label>
              <input
                className={input}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setProgFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Caption</label>
              <input
                className={input}
                value={progCaption}
                onChange={(e) => setProgCaption(e.target.value)}
                placeholder="Montering startet"
              />
            </div>
          </div>

          <div className="flex justify-end mt-3 gap-2">
            <button
              onClick={uploadProgressFile}
              disabled={saving || !progFile}
              className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Legg til bilde
            </button>
          </div>

          {/* OPTIONAL: URL legacy */}
          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-800 mb-2">
              (Valgfritt) Bruk URL i stedet
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex flex-col">
                <label className={label}>Bilde-URL</label>
                <input
                  className={input}
                  value={progUrl}
                  onChange={(e) => setProgUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addProgressUrl}
                  disabled={saving || !progUrl.trim()}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Legg til URL
                </button>
              </div>
            </div>
          </div>

          {/* Liste */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {progress.length === 0 && (
              <div className="col-span-full py-6 text-center text-slate-500">
                Ingen progresjonsbilder enda.
              </div>
            )}

            {progress.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl overflow-hidden border border-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc(b.url)}
                  alt={b.caption ?? "Bilde"}
                  className="w-full h-56 object-cover"
                />
                <div className="p-3 flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-700 min-w-0 truncate">
                    {b.caption ?? "—"}
                  </div>
                  <button
                    onClick={() => deleteBilde(b.id)}
                    disabled={saving}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Slett
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
