"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Quote } from "../../lib/quoteTypes";
import { authedFetch } from "../../lib/client";
import {
  fmtMoney,
  lineTotal,
  sumExVatFromInc,
  sumIncVatFromLines,
  vatFromInc,
} from "../../lib/quoteUtils";

function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nb-NO");
}

type SendMode = "offer" | "contract" | null;

export default function QuoteReadPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [q, setQ] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sendMode, setSendMode] = useState<SendMode>(null);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch(router, `/api/quotes/${id}`);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          txt || `Kunne ikke hente pristilbud (HTTP ${res.status})`,
        );
      }
      setQ((await res.json()) as Quote);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke hente pristilbud");
      setQ(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  const statusUpper = useMemo(() => (q?.status ?? "DRAFT").toUpperCase(), [q]);

  const canSendOffer = useMemo(() => {
    if (!q?.kundeEpost) return false;
    if (busy) return false;
    return statusUpper === "DRAFT";
  }, [q?.kundeEpost, busy, statusUpper]);

  const canSendContract = useMemo(() => {
    if (!q?.kundeEpost) return false;
    if (busy) return false;
    return statusUpper === "ACCEPTED";
  }, [q?.kundeEpost, busy, statusUpper]);

  const totals = useMemo(() => {
    if (!q) return { ex: 0, vat: 0, inc: 0 };

    const inc = (q.sumIncVat ?? sumIncVatFromLines(q)) as number;
    const ex = sumExVatFromInc(inc, q.vatRate ?? 0);
    const vat = vatFromInc(inc, q.vatRate ?? 0);

    return { ex, vat, inc };
  }, [q]);

  const replyTo = (q as any)?.replyToEmail ?? "—";

  async function loadPdfPreview(mode: "offer" | "contract") {
    if (!q?.id) return;

    setPdfLoading(true);
    setPdfError(null);

    try {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
        setPdfPreviewUrl(null);
      }

      const endpoint =
        mode === "offer"
          ? `/api/quotes/${q.id}/pdf`
          : `/api/quotes/${q.id}/contract/pdf`;

      const res = await authedFetch(router, endpoint);

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          txt || `Kunne ikke hente PDF-preview (HTTP ${res.status})`,
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (e: any) {
      setPdfError(e?.message ?? "Kunne ikke laste PDF-forhåndsvisning");
    } finally {
      setPdfLoading(false);
    }
  }

  async function openSendModal(mode: Exclude<SendMode, null>) {
    if (!q) return;

    setMsg(null);
    setError(null);
    setPdfError(null);

    if (mode === "offer") {
      setMailSubject(
        `Pristilbud: ${q.title?.trim() ? q.title.trim() : `#${q.id}`}`,
      );
      setMailBody(
        q.message?.trim()
          ? q.message.trim()
          : "Hei!\n\nVedlagt finner du pristilbudet.\n\nDu kan også svare på tilbudet via lenken i e-posten.",
      );
    } else {
      setMailSubject(
        `Kontrakt: ${q.title?.trim() ? q.title.trim() : `#${q.id}`}`,
      );
      setMailBody(
        "Hei!\n\nVedlagt ligger kontrakten basert på akseptert pristilbud.\n\nTa kontakt dersom du har spørsmål.",
      );
    }

    setSendMode(mode);
    await loadPdfPreview(mode);
  }

  function closeSendModal() {
    if (busy) return;
    setSendMode(null);
    setPdfError(null);

    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  }

  async function downloadPdf() {
    if (!q?.id) return;
    setBusy(true);
    setError(null);
    setMsg(null);

    try {
      const res = await authedFetch(router, `/api/quotes/${q.id}/pdf`);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Kunne ikke hente PDF (HTTP ${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke hente PDF");
    } finally {
      setBusy(false);
    }
  }

  async function confirmSend() {
    if (!q?.id || !sendMode) return;

    setBusy(true);
    setError(null);
    setMsg(null);

    try {
      if (sendMode === "offer") {
        const res = await authedFetch(router, `/api/quotes/${q.id}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: mailSubject,
            body: mailBody,
          }),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `Kunne ikke sende (HTTP ${res.status})`);
        }

        setMsg("Pristilbud sendt ✅");
        closeSendModal();
        await load();
        return;
      }

      if (sendMode === "contract") {
        const res = await authedFetch(
          router,
          `/api/quotes/${q.id}/contract/send`,
          {
            method: "POST",
          },
        );

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(
            txt || `Kunne ikke sende kontrakt (HTTP ${res.status})`,
          );
        }

        setMsg("Kontrakt sendt ✅");
        closeSendModal();
        await load();
      }
    } catch (e: any) {
      setError(
        e?.message ??
          (sendMode === "offer"
            ? "Kunne ikke sende pristilbud"
            : "Kunne ikke sende kontrakt"),
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Laster...</p>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Fant ikke pristilbud.</p>
        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  const badge = (status?: string) => {
    const s = (status ?? "DRAFT").toUpperCase();
    const base =
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";
    if (s === "SENT") return `${base} bg-emerald-50 text-emerald-700`;
    if (s === "ACCEPTED") return `${base} bg-blue-50 text-blue-700`;
    if (s === "DECLINED") return `${base} bg-red-50 text-red-700`;
    return `${base} bg-slate-100 text-slate-700`;
  };

  const attachmentName =
    sendMode === "contract" ? `kontrakt-${q.id}.pdf` : `pristilbud-${q.id}.pdf`;

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Pristilbud #{q.id}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={badge(q.status)}>
                {(q.status ?? "DRAFT").toUpperCase()}
              </span>
              <span className="text-sm text-slate-600">
                Kunde:{" "}
                <span className="font-semibold text-slate-900">
                  {q.kundeNavn}
                </span>
              </span>
              <span className="text-sm text-slate-500">
                · {fmtDate(q.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push("/quotes")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tilbake
            </button>

            <button
              onClick={() => router.push(`/quotes/${q.id}/edit`)}
              className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Rediger
            </button>

            <button
              onClick={downloadPdf}
              disabled={busy}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
            >
              {busy ? "Henter..." : "Last ned PDF"}
            </button>

            <button
              onClick={() => openSendModal("offer")}
              disabled={!canSendOffer}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
              title={
                !q.kundeEpost
                  ? "Kunde e-post mangler"
                  : statusUpper !== "DRAFT"
                    ? "Tilbud er allerede sendt / avgjort"
                    : ""
              }
            >
              Send pristilbud
            </button>

            <button
              onClick={() => openSendModal("contract")}
              disabled={!canSendContract}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              title={
                statusUpper !== "ACCEPTED"
                  ? "Kontrakt kan kun sendes etter at kunden har godtatt"
                  : ""
              }
            >
              Send kontrakt
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {msg && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {msg}
          </div>
        )}

        {statusUpper === "ACCEPTED" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Kunden har <b>godtatt</b> tilbudet ✅
          </div>
        )}

        {statusUpper === "DECLINED" && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Kunden har <b>avslått</b> tilbudet ❌
          </div>
        )}

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Detaljer</h2>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500">Kundenavn</div>
              <div className="font-semibold text-slate-900">{q.kundeNavn}</div>
            </div>

            <div>
              <div className="text-slate-500">Kunde e-post</div>
              <div className="font-medium text-slate-900">
                {q.kundeEpost ?? "—"}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Kunde telefon</div>
              <div className="font-medium text-slate-900">
                {q.kundeTelefon ?? "—"}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Gyldig til</div>
              <div className="font-medium text-slate-900">
                {q.validUntil ? fmtDate(q.validUntil) : "—"}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Tittel</div>
              <div className="font-medium text-slate-900">{q.title ?? "—"}</div>
            </div>

            <div>
              <div className="text-slate-500">MVA</div>
              <div className="font-medium text-slate-900">
                {q.vatRate ?? 0}%
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-slate-500">Reply-To</div>
              <div className="font-medium text-slate-900">{replyTo}</div>
            </div>
          </div>

          {q.message && (
            <div className="mt-4">
              <div className="text-slate-500 text-sm">Melding</div>
              <p className="mt-1 text-slate-800 whitespace-pre-line">
                {q.message}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Linjer</h2>
          </div>

          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Beskrivelse
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Antall
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Enhet
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Pris (inkl)
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Sum (inkl)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {(q.lines ?? [])
                  .slice()
                  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                  .map((l, idx) => (
                    <tr key={l.id ?? idx} className="bg-white">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {l.name}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {l.qty ?? ""}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {l.unit ?? ""}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {fmtMoney(l.unitPrice ?? 0)} kr
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        {fmtMoney(lineTotal(l))} kr
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Oppsummering</h2>
          <div className="mt-3 text-sm text-slate-700 space-y-1">
            <div className="flex justify-between gap-3">
              <span>Sum eks. mva</span>
              <span className="font-semibold tabular-nums">
                {fmtMoney(totals.ex)} kr
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Mva ({q.vatRate ?? 0}%)</span>
              <span className="font-semibold tabular-nums">
                {fmtMoney(totals.vat)} kr
              </span>
            </div>
            <div className="flex justify-between gap-3 border-t border-slate-200 pt-2">
              <span className="font-semibold">Sum inkl. mva</span>
              <span className="font-bold tabular-nums">
                {fmtMoney(totals.inc)} kr
              </span>
            </div>
          </div>
        </div>
      </main>

      {sendMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-7xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {sendMode === "offer"
                    ? "Forhåndsvis og send pristilbud"
                    : "Forhåndsvis og send kontrakt"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Se både e-posten og PDF-dokumentet før det sendes til kunden.
                </p>
              </div>

              <button
                onClick={closeSendModal}
                disabled={busy}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
              >
                Lukk
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)]">
              <div className="border-b xl:border-b-0 xl:border-r border-slate-200 p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Til
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                    {q.kundeEpost ?? "—"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Reply-To
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                    {replyTo}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mail-subject"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Emne
                  </label>
                  <input
                    id="mail-subject"
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    disabled={busy || sendMode === "contract"}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                  {sendMode === "contract" && (
                    <p className="mt-1 text-xs text-slate-500">
                      Kontrakt sendes med standardtekst fra backend.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="mail-body"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Melding
                  </label>
                  <textarea
                    id="mail-body"
                    rows={10}
                    value={mailBody}
                    onChange={(e) => setMailBody(e.target.value)}
                    disabled={busy || sendMode === "contract"}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 resize-none"
                  />
                  {sendMode === "contract" && (
                    <p className="mt-1 text-xs text-slate-500">
                      Hvis du vil redigere kontraktmailen her også, må backend
                      senere utvides.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Vedlegg
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                    {attachmentName}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    E-postforhåndsvisning
                  </div>
                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Emne
                      </div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {mailSubject || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Kunde
                      </div>
                      <div className="mt-1 text-slate-900">
                        {q.kundeNavn ?? "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Sum
                      </div>
                      <div className="mt-1 text-slate-900 font-semibold">
                        {fmtMoney(totals.inc)} kr inkl. mva
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Melding
                      </div>
                      <div className="mt-1 rounded-xl border border-slate-200 bg-white p-3 whitespace-pre-line text-slate-800">
                        {mailBody || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      PDF-forhåndsvisning
                    </h3>
                    <p className="text-sm text-slate-600">
                      Dette er dokumentet kunden faktisk vil motta som vedlegg.
                    </p>
                  </div>

                  {pdfPreviewUrl && (
                    <a
                      href={pdfPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      Åpne større
                    </a>
                  )}
                </div>

                <div className="h-[72vh] overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
                  {pdfLoading ? (
                    <div className="flex h-full items-center justify-center text-slate-500">
                      Laster PDF-forhåndsvisning...
                    </div>
                  ) : pdfError ? (
                    <div className="flex h-full items-center justify-center p-6 text-center text-red-600">
                      {pdfError}
                    </div>
                  ) : pdfPreviewUrl ? (
                    <iframe
                      src={pdfPreviewUrl}
                      className="h-full w-full"
                      title="PDF-forhåndsvisning"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                      Ingen forhåndsvisning tilgjengelig.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4 bg-white">
              <button
                onClick={closeSendModal}
                disabled={busy}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
              >
                Avbryt
              </button>

              <button
                onClick={confirmSend}
                disabled={busy || pdfLoading || !!pdfError}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                  sendMode === "offer"
                    ? "bg-emerald-700 hover:bg-emerald-600"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {busy
                  ? "Sender..."
                  : sendMode === "offer"
                    ? "Send pristilbud"
                    : "Send kontrakt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
