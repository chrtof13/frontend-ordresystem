"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Oppdrag } from "../../lib/api";
import { getToken, API } from "../../lib/client";

function StatusBadge({ status }: { status?: string | null }) {
  const base =
    "inline-flex items-center rounded-lg px-3 py-1 text-sm font-semibold";

  if (status === "PLANLAGT")
    return (
      <span className={`${base} bg-emerald-500 text-white`}>Planlagt</span>
    );

  if (status === "PÅGÅR" || status === "PAGAR")
    return <span className={`${base} bg-emerald-700 text-white`}>Pågår</span>;

  if (status === "FERDIG" || status === "FULLFØRT")
    return <span className={`${base} bg-amber-400 text-white`}>Ferdig</span>;

  return (
    <span className={`${base} bg-slate-300 text-slate-800`}>
      {status ?? "—"}
    </span>
  );
}

export default function JobsTable({ jobs }: { jobs: Oppdrag[] }) {
  const router = useRouter();

  const [rows, setRows] = useState<Oppdrag[]>(jobs);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setRows(jobs), [jobs]);

  function goToJob(id: number) {
    router.push(`/jobs/${id}`);
  }

  function goToEdit(e: React.MouseEvent, id: number) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/jobs/${id}/edit`);
  }

  async function onDelete(e: React.MouseEvent, id: number) {
    e.preventDefault();
    e.stopPropagation();

    setError(null);

    const token = getToken();
    if (!token) {
      setError("Du er ikke innlogget (mangler token).");
      return;
    }

    const ok = confirm("Er du sikker på at du vil slette dette oppdraget?");
    if (!ok) return;

    setDeletingId(id);

    try {
      const res = await fetch(`${API}/api/oppdrag/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Kunne ikke slette (HTTP ${res.status}).`);

      setRows((prev) => prev.filter((x) => x.id !== id));
    } catch (err: any) {
      setError(err?.message ?? "Noe gikk galt.");
    } finally {
      setDeletingId(null);
    }
  }

  const hasData = useMemo(() => rows.length > 0, [rows]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!hasData && (
        <div className="rounded-2xl bg-white px-6 py-10 text-center text-slate-500">
          Ingen oppdrag funnet.
        </div>
      )}

      {/* ========================= */}
      {/* 📱 Mobil */}
      {/* ========================= */}

      <div className="md:hidden space-y-3">
        {rows.map((job) => (
          <div
            key={job.id}
            role="button"
            tabIndex={0}
            onClick={() => goToJob(job.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goToJob(job.id);
            }}
            className="rounded-2xl bg-white p-4 shadow-sm cursor-pointer hover:bg-slate-50 transition outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 truncate">
                  {job.tittel}
                </div>
                <div className="text-sm text-slate-500">
                  #{job.id} {job.type ? `· ${job.type}` : ""}
                </div>
              </div>
              <StatusBadge status={job.status} />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Kunde</span>
                <span className="font-medium text-slate-900">
                  {job.kunde ?? "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Telefon</span>
                <span className="font-medium text-slate-900">
                  {job.telefon ?? "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Tid</span>
                <span className="font-medium text-slate-900">
                  {job.estimatTimer != null ? `${job.estimatTimer} t` : "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Pris</span>
                <span className="font-medium text-slate-900">
                  {job.timepris != null ? `${job.timepris} kr/t` : "—"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={(e) => goToEdit(e, job.id)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Rediger
              </button>

              <button
                onClick={(e) => onDelete(e, job.id)}
                disabled={deletingId === job.id}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deletingId === job.id ? "Sletter..." : "Slett"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================= */}
      {/* 🖥 Desktop */}
      {/* ========================= */}

      <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_0.7fr_0.7fr_0.9fr] gap-4 px-6 py-4 text-xs font-semibold bg-slate-100 text-slate-600">
          <div>Oppdrag</div>
          <div>Kunde</div>
          <div>Status</div>
          <div>Tid</div>
          <div>Pris</div>
          <div className="text-right">Handling</div>
        </div>

        {/* Rows */}
        <div>
          {rows.map((job, idx) => (
            <div
              key={job.id}
              role="button"
              tabIndex={0}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goToJob(job.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goToJob(job.id);
              }}
              className={[
                "grid grid-cols-[2fr_1fr_1fr_0.7fr_0.7fr_0.9fr]",
                "gap-4 px-6 py-6 cursor-pointer",
                "outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                "transition-colors duration-150",
                "odd:bg-white even:bg-slate-50",
                "hover:bg-slate-100",
                idx === 0 ? "" : "border-t border-slate-200",
              ].join(" ")}
            >
              <div>
                <div className="font-semibold text-slate-900">{job.tittel}</div>
                <div className="text-sm text-slate-500">
                  {job.type ?? "—"}{" "}
                  {job.estimatTimer != null ? `· ${job.estimatTimer} t` : ""}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-900">
                  {job.kunde ?? "—"}
                </div>
                <div className="text-sm text-slate-500">
                  {job.telefon ?? ""}
                </div>
              </div>

              <div className="flex items-center">
                <StatusBadge status={job.status} />
              </div>

              <div className="font-semibold text-slate-900">
                {job.estimatTimer != null ? `${job.estimatTimer} t` : "—"}
              </div>

              <div className="font-semibold text-slate-900">
                {job.timepris != null ? `${job.timepris} kr/t` : "—"}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={(e) => goToEdit(e, job.id)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Rediger
                </button>

                <button
                  onClick={(e) => onDelete(e, job.id)}
                  disabled={deletingId === job.id}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deletingId === job.id ? "Sletter..." : "Slett"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
