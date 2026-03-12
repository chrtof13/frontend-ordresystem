"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Oppdrag, OppdragBilde, OppdragMaterial } from "../../lib/api";
import { authedFetch, API } from "../../lib/client";
import ProtectedImage from "../../components/ProtectedImage";

export default function JobReadPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [job, setJob] = useState<Oppdrag | null>(null);
  const [bilder, setBilder] = useState<OppdragBilde[]>([]);
  const [materialer, setMaterialer] = useState<OppdragMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    setError(null);
    setLoading(true);

    try {
      const [jobRes, bilderRes, matRes] = await Promise.all([
        authedFetch(router, `/api/oppdrag/${id}`),
        authedFetch(router, `/api/oppdrag/${id}/bilder`),
        authedFetch(router, `/api/oppdrag/${id}/materialer`),
      ]);

      setJob((await jobRes.json()) as Oppdrag);
      setBilder((await bilderRes.json()) as OppdragBilde[]);
      setMaterialer((await matRes.json()) as OppdragMaterial[]);
    } catch (e: any) {
      setError(e?.message ?? "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  function cleanViewUrl(viewUrl?: string | null) {
    return viewUrl?.trim() ?? "";
  }

  function isProtectedImage(viewUrl?: string | null) {
    return cleanViewUrl(viewUrl).startsWith("/api/");
  }

  function imageSrc(viewUrl?: string | null) {
    const url = cleanViewUrl(viewUrl);
    if (!url) return "";
    return url.startsWith("http") ? url : `${API}${url}`;
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

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-5xl p-4 sm:p-6 space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">{job.tittel}</h1>
          <p className="text-slate-600 mt-1">
            #{job.id}
            {job.status ? ` · ${job.status}` : ""}
            {job.type ? ` · ${job.type}` : ""}
          </p>
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
              onClick={() => router.back()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tilbake
            </button>

            <button
              onClick={() => router.push(`/jobs/${job.id}/edit`)}
              className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Rediger
            </button>
            <button
              onClick={() => router.push(`/jobs/${job.id}/send`)}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Forhåndsvis og send e-post
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Header */}
        {header ? (
          <div className="rounded-2xl bg-white overflow-hidden shadow-sm">
            <div className="relative">
              {isProtectedImage(header.viewUrl) ? (
                <ProtectedImage
                  src={cleanViewUrl(header.viewUrl)}
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

              <div className="p-4 text-sm text-slate-700">
                {header.caption ?? "Header-bilde"}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white overflow-hidden shadow-sm">
            <div className="p-6 text-slate-600">Ingen header-bilde enda.</div>
          </div>
        )}

        {/* Info */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Oversikt</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500">Kunde</div>
              <div className="font-medium">{job.kunde ?? "—"}</div>
            </div>

            <div>
              <div className="text-slate-500">Telefon</div>
              <div className="font-medium">{job.telefon ?? "—"}</div>
            </div>

            <div>
              <div className="text-slate-500">Dato</div>
              <div className="font-medium">{job.dato ?? "—"}</div>
            </div>

            <div>
              <div className="text-slate-500">Sted</div>
              <div className="font-medium">{job.sted ?? "—"}</div>
            </div>

            <div>
              <div className="text-slate-500">Timepris</div>
              <div className="font-medium">
                {job.timepris != null ? `${job.timepris} kr/t` : "—"}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Estimat</div>
              <div className="font-medium">
                {job.estimatTimer != null ? `${job.estimatTimer} t` : "—"}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Timer gjort</div>
              <div className="font-medium">
                {job.timerGjort != null ? `${job.timerGjort} t` : "—"}
              </div>
            </div>
          </div>

          {job.beskrivelse && (
            <div className="mt-4">
              <div className="text-slate-500 text-sm">Beskrivelse</div>
              <p className="mt-1 text-slate-800 whitespace-pre-wrap">
                {job.beskrivelse}
              </p>
            </div>
          )}
        </div>

        {/* Materialer */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Materialkostnader</h2>
            <div className="text-sm font-semibold text-slate-700">
              Sum: {matSum.toFixed(2)} kr
            </div>
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

                  <div className="text-sm font-semibold text-slate-900">
                    {(m.prisPerStk * m.antall).toFixed(2)} kr
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Progresjon */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Bilder underveis</h2>

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
                {isProtectedImage(b.viewUrl) ? (
                  <ProtectedImage
                    src={cleanViewUrl(b.viewUrl)}
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

                <div className="p-3 text-sm text-slate-700 truncate">
                  {b.caption ?? "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
