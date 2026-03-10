"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import TopbarDesktop from "../../../components/layout/TopbarDesktop";
import TopbarMobile from "../../../components/layout/TopbarMobile";
import ProtectedImage from "../../../components/ProtectedImage";

import type { Oppdrag, OppdragBilde, OppdragMaterial } from "../../../lib/api";
import { authedFetch, API } from "../../../lib/client";

type Fields = {
  includeTitle: boolean;
  includeDescription: boolean;
  includeStatus: boolean;
  includeDate: boolean;
  includeLocation: boolean;
  includeTimerGjort: boolean;
  includeEstimatTimer: boolean;
  includeTimepris: boolean;
  includeMaterials: boolean;
  includeImages: boolean;
};

export default function SendMailClient() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [job, setJob] = useState<Oppdrag | null>(null);
  const [bilder, setBilder] = useState<OppdragBilde[]>([]);
  const [materialer, setMaterialer] = useState<OppdragMaterial[]>([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentOk, setSentOk] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);

  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [intro, setIntro] = useState(
    "Hei! Her er en oppsummering av arbeidet som er utført.",
  );

  const [fields, setFields] = useState<Fields>({
    includeTitle: true,
    includeDescription: true,
    includeStatus: true,
    includeDate: true,
    includeLocation: true,
    includeTimerGjort: true,
    includeEstimatTimer: true,
    includeTimepris: false,
    includeMaterials: true,
    includeImages: true,
  });

  function isProtectedImage(viewUrl?: string | null) {
    return !!viewUrl && viewUrl.startsWith("/api/");
  }

  function imageSrc(viewUrl?: string | null) {
    if (!viewUrl) return "";
    return viewUrl.startsWith("http") ? viewUrl : `${API}${viewUrl}`;
  }

  async function loadAll() {
    if (!Number.isFinite(id)) return;

    setError(null);
    setLoading(true);
    setSentOk(false);

    try {
      const [jobRes, bilderRes, matRes] = await Promise.all([
        authedFetch(router, `/api/oppdrag/${id}`),
        authedFetch(router, `/api/oppdrag/${id}/bilder`),
        authedFetch(router, `/api/oppdrag/${id}/materialer`),
      ]);

      const j = (await jobRes.json()) as Oppdrag;
      setJob(j);
      setBilder((await bilderRes.json()) as OppdragBilde[]);
      setMaterialer((await matRes.json()) as OppdragMaterial[]);

      setSubject(
        (prev) => prev || `Ferdigstilt oppdrag: ${j.tittel ?? `#${id}`}`,
      );
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!previewOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [previewOpen]);

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

  function toggle<K extends keyof Fields>(key: K) {
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function openPreview() {
    setError(null);
    setSentOk(false);

    const email = toEmail.trim();
    if (!validateEmail(email)) {
      setError("Skriv inn en gyldig e-postadresse til kunden.");
      return;
    }

    if (!job) {
      setError("Oppdraget er ikke lastet.");
      return;
    }

    setPreviewOpen(true);
  }

  function closePreview() {
    if (sending) return;
    setPreviewOpen(false);
  }

  async function sendMail() {
    setError(null);
    setSentOk(false);

    const email = toEmail.trim();
    if (!validateEmail(email)) {
      setError("Skriv inn en gyldig e-postadresse til kunden.");
      return;
    }

    if (!job) {
      setError("Oppdraget er ikke lastet.");
      return;
    }

    setSending(true);

    try {
      const body = {
        toEmail: email,
        subject:
          subject.trim() || `Ferdigstilt oppdrag: ${job.tittel ?? `#${id}`}`,
        messageIntro: intro.trim() || null,
        fields,
      };

      const res = await authedFetch(router, `/api/oppdrag/${id}/send-mail`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let msg = `Kunne ikke sende e-post (HTTP ${res.status}).`;

        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const data: any = await res.json();
            msg = data?.message || data?.error || data?.detail || msg;
          } else {
            const txt = await res.text();
            if (txt?.trim()) msg = txt.trim();
          }
        } catch {
          // behold standardmelding
        }

        throw new Error(msg);
      }

      setSentOk(true);
      setPreviewOpen(false);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke sende e-post");
    } finally {
      setSending(false);
    }
  }

  const card =
    "rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/60";
  const label = "text-sm font-semibold text-slate-700";
  const input =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400";

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
        <button
          onClick={() => router.push("/jobs")}
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Til oppdrag
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <div className="flex-1">
        <TopbarDesktop showSearch={false} />
        <TopbarMobile />

        <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
          <div className={card}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                  Send e-post til kunde
                </h1>
                <p className="text-slate-600 mt-1">
                  Oppdrag:{" "}
                  <span className="font-semibold text-slate-900">
                    {job.tittel}
                  </span>{" "}
                  <span className="text-slate-400">·</span> #{job.id}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Til oversikt
                </button>
                <button
                  onClick={openPreview}
                  disabled={sending}
                  className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? "Sender..." : "Forhåndsvis og send"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {sentOk && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                E-post sendt ✅
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <div className={label}>Kunde e-post *</div>
                  <input
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    placeholder="kunde@firma.no"
                    inputMode="email"
                    autoCapitalize="none"
                    className={input}
                  />
                </div>

                <div>
                  <div className={label}>Emne</div>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={input}
                  />
                </div>

                <div>
                  <div className={label}>Intro (valgfri)</div>
                  <textarea
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                    rows={4}
                    className={input}
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900 mb-3">
                    Velg hva som skal med
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <CheckRow
                      label="Tittel"
                      checked={fields.includeTitle}
                      onClick={() => toggle("includeTitle")}
                    />
                    <CheckRow
                      label="Beskrivelse"
                      checked={fields.includeDescription}
                      onClick={() => toggle("includeDescription")}
                    />
                    <CheckRow
                      label="Status"
                      checked={fields.includeStatus}
                      onClick={() => toggle("includeStatus")}
                    />
                    <CheckRow
                      label="Dato"
                      checked={fields.includeDate}
                      onClick={() => toggle("includeDate")}
                    />
                    <CheckRow
                      label="Sted"
                      checked={fields.includeLocation}
                      onClick={() => toggle("includeLocation")}
                    />
                    <CheckRow
                      label="Timer gjort"
                      checked={fields.includeTimerGjort}
                      onClick={() => toggle("includeTimerGjort")}
                    />
                    <CheckRow
                      label="Estimat"
                      checked={fields.includeEstimatTimer}
                      onClick={() => toggle("includeEstimatTimer")}
                    />
                    <CheckRow
                      label="Timepris"
                      checked={fields.includeTimepris}
                      onClick={() => toggle("includeTimepris")}
                    />
                    <CheckRow
                      label="Materialer"
                      checked={fields.includeMaterials}
                      onClick={() => toggle("includeMaterials")}
                    />
                    <CheckRow
                      label="Bilder"
                      checked={fields.includeImages}
                      onClick={() => toggle("includeImages")}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-sm font-semibold text-slate-900">
                    Forhåndsvisning
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Dette er en preview av e-posten og innholdet som sendes.
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <MailPreview
                    job={job}
                    header={header}
                    progress={progress}
                    materialer={materialer}
                    matSum={matSum}
                    toEmail={toEmail}
                    subject={subject}
                    intro={intro}
                    fields={fields}
                    isProtectedImage={isProtectedImage}
                    imageSrc={imageSrc}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Forhåndsvis og send oppdragsmail
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Se gjennom innholdet før e-posten sendes til kunden.
                </p>
              </div>

              <button
                onClick={closePreview}
                disabled={sending}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
              >
                Lukk forhåndsvisning
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)]">
              <div className="min-h-0 overflow-y-auto border-b border-slate-200 p-5 xl:border-b-0 xl:border-r space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Til
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                    {toEmail.trim() || "kunde@firma.no"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Emne
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                    {subject.trim() || `Ferdigstilt oppdrag: ${job.tittel}`}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Intro
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm whitespace-pre-wrap text-slate-900">
                    {intro.trim() || "—"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Hva blir med
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(fields)
                      .filter(([, value]) => value)
                      .map(([key]) => (
                        <span
                          key={key}
                          className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                        >
                          {fieldLabel(key as keyof Fields)}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    E-postforhåndsvisning
                  </div>
                  <div className="mt-3">
                    <MailPreview
                      job={job}
                      header={header}
                      progress={progress}
                      materialer={materialer}
                      matSum={matSum}
                      toEmail={toEmail}
                      subject={subject}
                      intro={intro}
                      fields={fields}
                      compact
                      isProtectedImage={isProtectedImage}
                      imageSrc={imageSrc}
                    />
                  </div>
                </div>
              </div>

              <div className="min-h-0 bg-slate-100 p-5">
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-slate-900">
                    Innhold som sendes
                  </h3>
                  <p className="text-sm text-slate-600">
                    Dette viser rapportinnholdet kunden vil motta i
                    e-posten/PDF.
                  </p>
                </div>

                <div className="h-full min-h-0 overflow-auto rounded-2xl border border-slate-300 bg-white shadow-sm p-5">
                  <MailPreview
                    job={job}
                    header={header}
                    progress={progress}
                    materialer={materialer}
                    matSum={matSum}
                    toEmail={toEmail}
                    subject={subject}
                    intro={intro}
                    fields={fields}
                    isProtectedImage={isProtectedImage}
                    imageSrc={imageSrc}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4">
              <button
                onClick={closePreview}
                disabled={sending}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
              >
                Avbryt
              </button>

              <button
                onClick={sendMail}
                disabled={sending}
                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {sending ? "Sender..." : "Send e-post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function fieldLabel(key: keyof Fields) {
  switch (key) {
    case "includeTitle":
      return "Tittel";
    case "includeDescription":
      return "Beskrivelse";
    case "includeStatus":
      return "Status";
    case "includeDate":
      return "Dato";
    case "includeLocation":
      return "Sted";
    case "includeTimerGjort":
      return "Timer gjort";
    case "includeEstimatTimer":
      return "Estimat";
    case "includeTimepris":
      return "Timepris";
    case "includeMaterials":
      return "Materialer";
    case "includeImages":
      return "Bilder";
    default:
      return key;
  }
}

function MailPreview({
  job,
  header,
  progress,
  materialer,
  matSum,
  toEmail,
  subject,
  intro,
  fields,
  compact = false,
  isProtectedImage,
  imageSrc,
}: {
  job: Oppdrag;
  header: OppdragBilde | null;
  progress: OppdragBilde[];
  materialer: OppdragMaterial[];
  matSum: number;
  toEmail: string;
  subject: string;
  intro: string;
  fields: Fields;
  compact?: boolean;
  isProtectedImage: (viewUrl?: string | null) => boolean;
  imageSrc: (viewUrl?: string | null) => string;
}) {
  const shownProgress = compact ? progress.slice(0, 2) : progress.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="text-xs font-semibold text-slate-500">TIL</div>
        <div className="text-sm font-semibold text-slate-900">
          {toEmail.trim() || "kunde@firma.no"}
        </div>

        <div className="mt-3 text-xs font-semibold text-slate-500">EMNE</div>
        <div className="text-sm font-semibold text-slate-900">
          {subject.trim() || `Ferdigstilt oppdrag: ${job.tittel}`}
        </div>
      </div>

      {intro.trim() && (
        <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-wrap">
          {intro.trim()}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-900 mb-2">
          Oppsummering
        </div>

        <div className="space-y-2 text-sm">
          {fields.includeTitle && <KV k="Tittel" v={job.tittel || "—"} />}
          {fields.includeStatus && <KV k="Status" v={job.status || "—"} />}
          {fields.includeDate && <KV k="Dato" v={job.dato || "—"} />}
          {fields.includeLocation && <KV k="Sted" v={job.sted || "—"} />}
          {fields.includeTimerGjort && (
            <KV
              k="Timer gjort"
              v={job.timerGjort != null ? `${job.timerGjort} t` : "—"}
            />
          )}
          {fields.includeEstimatTimer && (
            <KV
              k="Estimat"
              v={job.estimatTimer != null ? `${job.estimatTimer} t` : "—"}
            />
          )}
          {fields.includeTimepris && (
            <KV
              k="Timepris"
              v={job.timepris != null ? `${job.timepris} kr/t` : "—"}
            />
          )}
        </div>
      </div>

      {fields.includeDescription &&
        (job.beskrivelse?.trim() ? (
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-900 mb-2">
              Beskrivelse
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">
              {job.beskrivelse}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
            Ingen beskrivelse lagt inn.
          </div>
        ))}

      {fields.includeMaterials && (
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-900">
              Materialer
            </div>
            <div className="text-sm font-semibold text-slate-900">
              Sum: {matSum.toFixed(2)} kr
            </div>
          </div>

          {materialer.length === 0 ? (
            <div className="mt-2 text-sm text-slate-500">Ingen materialer.</div>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              {materialer
                .slice()
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {m.navn}
                      </div>
                      <div className="text-slate-600">
                        {m.antall} {m.enhet ?? "stk"} × {m.prisPerStk} kr
                      </div>
                    </div>
                    <div className="font-semibold text-slate-900">
                      {(m.prisPerStk * m.antall).toFixed(2)} kr
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {fields.includeImages && (
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-sm font-semibold text-slate-900 mb-2">
            Bilder
          </div>

          {!header && shownProgress.length === 0 ? (
            <div className="text-sm text-slate-500">Ingen bilder lagt til.</div>
          ) : (
            <div className="space-y-3">
              {header && (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  {isProtectedImage(header.viewUrl) ? (
                    <ProtectedImage
                      src={
                        header.viewUrl?.startsWith("http")
                          ? new URL(header.viewUrl).pathname
                          : (header.viewUrl ?? "")
                      }
                      alt={header.caption ?? "Header"}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <img
                      src={imageSrc(header.viewUrl)}
                      alt={header.caption ?? "Header"}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-3 text-sm text-slate-700">
                    {header.caption ?? "Header-bilde"}
                  </div>
                </div>
              )}

              {shownProgress.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl overflow-hidden border border-slate-200"
                >
                  {isProtectedImage(b.viewUrl) ? (
                    <ProtectedImage
                      src={
                        b.viewUrl?.startsWith("http")
                          ? new URL(b.viewUrl).pathname
                          : (b.viewUrl ?? "")
                      }
                      alt={b.caption ?? "Bilde"}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <img
                      src={imageSrc(b.viewUrl)}
                      alt={b.caption ?? "Bilde"}
                      className="w-full h-32 object-cover"
                    />
                  )}

                  <div className="p-2 text-sm text-slate-700 truncate">
                    {b.caption ?? "—"}
                  </div>
                </div>
              ))}

              {!compact && progress.length > 4 && (
                <div className="text-xs text-slate-500">
                  + {progress.length - 4} flere progresjonsbilder
                </div>
              )}

              {compact && progress.length > 2 && (
                <div className="text-xs text-slate-500">
                  + {progress.length - 2} flere bilder
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-slate-500">Sendt fra Ordrebase.</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left",
        checked
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
      ].join(" ")}
    >
      <span className="font-semibold">{label}</span>
      <span
        className={[
          "h-5 w-5 rounded-md border flex items-center justify-center text-xs font-black",
          checked
            ? "border-emerald-300 bg-emerald-200"
            : "border-slate-300 bg-white",
        ].join(" ")}
        aria-hidden
      >
        {checked ? "✓" : ""}
      </span>
    </button>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-slate-500">{k}</div>
      <div className="font-semibold text-slate-900 text-right">{v}</div>
    </div>
  );
}
