"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

  // saving job fields
  const [saving, setSaving] = useState(false);

  // image uploading
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [uploadingProg, setUploadingProg] = useState(false);

  // ✅ track unsaved edits (so loadAll() won't overwrite inputs)
  const [dirty, setDirty] = useState(false);
  const hydratedOnceRef = useRef(false);

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

  // ✅ timer gjort
  const [timerGjort, setTimerGjort] = useState<string>("");

  // captions for uploads
  const [headerCaption, setHeaderCaption] = useState("");
  const [progCaption, setProgCaption] = useState("");

  // hidden file inputs
  const headerAlbumRef = useRef<HTMLInputElement | null>(null);
  const progAlbumRef = useRef<HTMLInputElement | null>(null);

  // material form
  const [matNavn, setMatNavn] = useState("");
  const [matPris, setMatPris] = useState<string>("");
  const [matAntall, setMatAntall] = useState<string>("");
  const [matEnhet, setMatEnhet] = useState("stk");

  const imgSrc = (u: string) => (u.startsWith("http") ? u : `${API}${u}`);

  // ✅ currency formatter (Norwegian)
  const nok = (n: number) =>
    new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 2,
    }).format(n);

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

      // ✅ populate fields ONLY first time OR when not dirty
      if (!hydratedOnceRef.current || !dirty) {
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
        setTimerGjort(
          jobData.timerGjort != null ? String(jobData.timerGjort) : "",
        );

        hydratedOnceRef.current = true;
      }
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

  const progress = useMemo(() => {
    return bilder
      .filter((b) => b.kind === "PROGRESS")
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [bilder]);

  const matSum = useMemo(() => {
    return materialer.reduce(
      (sum, m) => sum + (m.prisPerStk ?? 0) * (m.antall ?? 0),
      0,
    );
  }, [materialer]);

  async function saveJob() {
    if (!tittel.trim()) return;

    const timerGjortNum =
      timerGjort.trim() === "" ? null : Number(timerGjort.replace(",", "."));

    if (
      timerGjortNum != null &&
      (!Number.isFinite(timerGjortNum) || timerGjortNum < 0)
    ) {
      setError("Timer gjort må være et gyldig tall (0 eller mer).");
      return;
    }

    // validate decimals for timepris/estimat too (optional but nice)
    const timeprisNum =
      timepris.trim() === "" ? null : Number(timepris.replace(",", "."));
    if (
      timeprisNum != null &&
      (!Number.isFinite(timeprisNum) || timeprisNum < 0)
    ) {
      setError("Timepris må være et gyldig tall (0 eller mer).");
      return;
    }

    const estimatNum =
      estimatTimer.trim() === ""
        ? null
        : Number(estimatTimer.replace(",", "."));
    if (
      estimatNum != null &&
      (!Number.isFinite(estimatNum) || estimatNum < 0)
    ) {
      setError("Estimat må være et gyldig tall (0 eller mer).");
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
        timepris: timeprisNum,
        estimatTimer: estimatNum,
        timerGjort: timerGjortNum,
      };

      await authedFetch(router, `/api/oppdrag/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      setDirty(false);
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke lagre oppdrag");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBilde(bildeId: number) {
    const ok = confirm("Slette bilde?");
    if (!ok) return;

    setError(null);
    try {
      await authedFetch(router, `/api/oppdrag/${id}/bilder/${bildeId}`, {
        method: "DELETE",
      });
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke slette bilde");
    }
  }

  // ✅ AUTO UPLOAD: Header
  async function autoUploadHeader(file: File) {
    setUploadingHeader(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("kind", "HEADER");
      form.append("caption", headerCaption.trim() ? headerCaption.trim() : "");
      form.append("sortOrder", "0");
      form.append("file", file);

      await authedUpload(router, `/api/oppdrag/${id}/bilder/upload`, form);

      setHeaderCaption("");
      if (headerAlbumRef.current) headerAlbumRef.current.value = "";
      await loadAll(); // safe: won't overwrite inputs if dirty=true
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke laste opp header-bilde");
    } finally {
      setUploadingHeader(false);
    }
  }

  // ✅ AUTO UPLOAD: Progress
  async function autoUploadProgress(file: File) {
    setUploadingProg(true);
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
      form.append("file", file);

      await authedUpload(router, `/api/oppdrag/${id}/bilder/upload`, form);

      setProgCaption("");
      if (progAlbumRef.current) progAlbumRef.current.value = "";
      await loadAll(); // safe: won't overwrite inputs if dirty=true
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke laste opp bilde");
    } finally {
      setUploadingProg(false);
    }
  }

  async function addMaterial() {
    if (!matNavn.trim()) return;

    const pris = Number(matPris.replace(",", "."));
    const ant = Number(matAntall.replace(",", "."));
    if (
      !Number.isFinite(pris) ||
      !Number.isFinite(ant) ||
      pris < 0 ||
      ant < 0
    ) {
      setError("Pris og antall må være gyldige tall (0 eller mer).");
      return;
    }

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
    }
  }

  async function deleteMaterial(matId: number) {
    const ok = confirm("Slette material?");
    if (!ok) return;

    setError(null);
    try {
      await authedFetch(router, `/api/oppdrag/${id}/materialer/${matId}`, {
        method: "DELETE",
      });
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke slette material");
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
          {dirty && (
            <p className="text-xs text-amber-700 mt-2">
              Du har ulagrede endringer.
            </p>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
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
              disabled={
                saving || uploadingHeader || uploadingProg || !tittel.trim()
              }
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
                onChange={(e) => {
                  setTittel(e.target.value);
                  setDirty(true);
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Status</label>
              <select
                className={input}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setDirty(true);
                }}
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
                onChange={(e) => {
                  setKunde(e.target.value);
                  setDirty(true);
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Telefon</label>
              <input
                className={input}
                value={telefon}
                onChange={(e) => {
                  setTelefon(e.target.value);
                  setDirty(true);
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Type</label>
              <input
                className={input}
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setDirty(true);
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Dato</label>
              <input
                className={input}
                type="date"
                value={dato}
                onChange={(e) => {
                  setDato(e.target.value);
                  setDirty(true);
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Sted</label>
              <input
                className={input}
                value={sted}
                onChange={(e) => {
                  setSted(e.target.value);
                  setDirty(true);
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Timepris (kr/t)</label>
              <input
                className={input}
                inputMode="decimal"
                value={timepris}
                onChange={(e) => {
                  setTimepris(e.target.value);
                  setDirty(true);
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Estimat (timer)</label>
              <input
                className={input}
                inputMode="decimal"
                value={estimatTimer}
                onChange={(e) => {
                  setEstimatTimer(e.target.value);
                  setDirty(true);
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className={label}>Timer gjort</label>
              <input
                className={input}
                inputMode="decimal"
                value={timerGjort}
                onChange={(e) => {
                  setTimerGjort(e.target.value);
                  setDirty(true);
                }}
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
              onChange={(e) => {
                setBeskrivelse(e.target.value);
                setDirty(true);
              }}
            />
          </div>

          <p className="text-xs text-slate-500">
            Tips: Bilder lagres automatisk når du velger dem (feltene dine blir
            ikke overskrevet).
          </p>
        </div>

        {/* HEADER BILDE */}
        <div className="rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Header-bilde</h2>
            <p className="text-sm text-slate-600 mt-1">
              Velg bilde – mobilen kan selv gi valg som album/kamera.
            </p>
          </div>

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
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                  disabled={saving || uploadingHeader || uploadingProg}
                >
                  Slett header
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-slate-600">Ingen header-bilde enda.</div>
          )}

          {/* Hidden input */}
          <input
            ref={headerAlbumRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              autoUploadHeader(file);
            }}
          />

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className={label}>Caption (valgfritt)</label>
                <input
                  className={input}
                  value={headerCaption}
                  onChange={(e) => setHeaderCaption(e.target.value)}
                  disabled={uploadingHeader || saving}
                  placeholder="F.eks. 'Før arbeid'"
                />
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => headerAlbumRef.current?.click()}
                  disabled={uploadingHeader || saving}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                >
                  {uploadingHeader ? "Laster opp..." : "Velg bilde"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS BILDER */}
        <div className="rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Bilder underveis</h2>
            <p className="text-sm text-slate-600 mt-1">
              Velg bilde – det lastes opp automatisk og dukker opp i listen.
            </p>
          </div>

          {/* Hidden input */}
          <input
            ref={progAlbumRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              autoUploadProgress(file);
            }}
          />

          <div className="p-4 sm:p-6 border-b border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className={label}>Caption (valgfritt)</label>
                <input
                  className={input}
                  value={progCaption}
                  onChange={(e) => setProgCaption(e.target.value)}
                  disabled={uploadingProg || saving}
                  placeholder="F.eks. 'Underveis'"
                />
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => progAlbumRef.current?.click()}
                  disabled={uploadingProg || saving}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                >
                  {uploadingProg ? "Laster opp..." : "Legg til bilde"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {progress.length === 0 ? (
              <div className="text-slate-600">
                Ingen progresjonsbilder enda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="flex items-center justify-between gap-2 p-3">
                      <div className="text-sm text-slate-700 truncate">
                        {b.caption ?? "—"}
                      </div>
                      <button
                        onClick={() => deleteBilde(b.id)}
                        disabled={saving || uploadingHeader || uploadingProg}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        Slett
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MATERIALER */}
        <div className="rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Materialer</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Sum materialkostnader:{" "}
                  <span className="font-semibold tabular-nums">
                    {matSum.toLocaleString("nb-NO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    kr
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
              {/* Navn */}
              <div className="lg:col-span-5">
                <label className={label}>Navn</label>
                <input
                  className={input + " w-full"}
                  value={matNavn}
                  onChange={(e) => setMatNavn(e.target.value)}
                  placeholder="F.eks. rør, pakning..."
                />
              </div>

              {/* Enhet */}
              <div className="lg:col-span-2">
                <label className={label}>Enhet</label>
                <select
                  className={input + " w-full"}
                  value={matEnhet}
                  onChange={(e) => setMatEnhet(e.target.value)}
                >
                  <option value="stk">stk</option>
                  <option value="m">m</option>
                  <option value="kg">kg</option>
                  <option value="l">l</option>
                </select>
              </div>

              {/* Pris per stk */}
              <div className="lg:col-span-2">
                <label className={label}>Pris per enhet</label>
                <input
                  className={input + " w-full tabular-nums"}
                  inputMode="decimal"
                  value={matPris}
                  onChange={(e) => setMatPris(e.target.value)}
                  placeholder="0,00"
                />
              </div>

              {/* Antall */}
              <div className="lg:col-span-2">
                <label className={label}>Antall</label>
                <input
                  className={input + " w-full tabular-nums"}
                  inputMode="decimal"
                  value={matAntall}
                  onChange={(e) => setMatAntall(e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Knapp */}
              <div className="lg:col-span-1">
                <button
                  onClick={addMaterial}
                  disabled={
                    !matNavn.trim() || !matPris.trim() || !matAntall.trim()
                  }
                  className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Legg til
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Tips: bruk komma i pris (f.eks. 199,50) – systemet håndterer det.
            </p>
          </div>

          {/* LISTE */}
          <div className="p-4 sm:p-6">
            {materialer.length === 0 ? (
              <div className="text-slate-600">Ingen materialer lagt til.</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {materialer
                  .slice()
                  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                  .map((m) => (
                    <div
                      key={m.id}
                      className="py-4 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {m.navn}
                        </div>
                        <div className="text-sm text-slate-600 tabular-nums">
                          {m.antall} {m.enhet ?? "stk"} ×{" "}
                          {Number(m.prisPerStk).toLocaleString("nb-NO", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          kr
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-slate-900 tabular-nums">
                          {Number(m.prisPerStk * m.antall).toLocaleString(
                            "nb-NO",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}{" "}
                          kr
                        </div>
                        <button
                          onClick={() => deleteMaterial(m.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          Slett
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
