"use client";

import { useMemo, useState } from "react";
import type { Quote } from "../lib/quoteTypes";
import QuoteLinesEditor from "./QuoteLinesEditor";
import QuotePreviewCard from "./QuotePreviewCard";

type Props = {
  value: Quote;
  onChange: (next: Quote) => void;
  disabled?: boolean;
};

function isValidEmail(s: string | null | undefined) {
  if (!s) return false;
  const e = s.trim();
  if (!e) return false;
  return e.includes("@") && e.includes(".");
}

export default function QuoteEditor({ value, onChange, disabled }: Props) {
  const q = value;

  const label = "text-sm font-medium text-slate-700 mb-1";
  const input =
    "rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white";

  const [touched, setTouched] = useState(false);

  const valid = useMemo(() => {
    if (!String(q.kundeNavn ?? "").trim()) return false;
    if (q.kundeEpost && !q.kundeEpost.includes("@")) return false;

    // ✅ krever reply-to epost
    if (!isValidEmail(q.replyToEmail)) return false;

    if (!Array.isArray(q.lines) || q.lines.length === 0) return false;
    if (q.lines.some((l) => !String(l.name ?? "").trim())) return false;
    return true;
  }, [q]);

  const replyOk = useMemo(() => isValidEmail(q.replyToEmail), [q.replyToEmail]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Kunde & detaljer</h2>
          <p className="text-sm text-slate-600 mt-1">
            Fyll inn kundedata og metadata for tilbudet.
          </p>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className={label}>Kundenavn *</label>
            <input
              disabled={disabled}
              className={input}
              value={q.kundeNavn}
              onChange={(e) => {
                setTouched(true);
                onChange({ ...q, kundeNavn: e.target.value });
              }}
              placeholder="Ola Nordmann"
            />
          </div>

          <div className="flex flex-col">
            <label className={label}>Kunde e-post</label>
            <input
              disabled={disabled}
              className={input}
              value={q.kundeEpost ?? ""}
              onChange={(e) => {
                setTouched(true);
                onChange({ ...q, kundeEpost: e.target.value.trim() || null });
              }}
              placeholder="ola@kunde.no"
              inputMode="email"
            />
          </div>

          <div className="flex flex-col">
            <label className={label}>Kunde telefon</label>
            <input
              disabled={disabled}
              className={input}
              value={q.kundeTelefon ?? ""}
              onChange={(e) => {
                setTouched(true);
                onChange({ ...q, kundeTelefon: e.target.value.trim() || null });
              }}
              placeholder="999 99 999"
            />
          </div>

          <div className="flex flex-col">
            <label className={label}>Tittel</label>
            <input
              disabled={disabled}
              className={input}
              value={q.title ?? ""}
              onChange={(e) => {
                setTouched(true);
                onChange({ ...q, title: e.target.value || null });
              }}
              placeholder="F.eks. Pristilbud bad"
            />
          </div>

          <div className="flex flex-col">
            <label className={label}>Status</label>
            <select
              disabled={disabled}
              className={input}
              value={(q.status ?? "DRAFT").toUpperCase()}
              onChange={(e) => {
                setTouched(true);
                onChange({ ...q, status: e.target.value as any });
              }}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="SENT">SENT</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>

            {["ACCEPTED", "DECLINED"].includes(
              (q.status ?? "").toUpperCase(),
            ) && (
              <div className="mt-2 text-xs text-slate-500">
                Status <b>{(q.status ?? "").toUpperCase()}</b> er satt av kunden
                via lenken.
              </div>
            )}

            <div className="mt-1 text-xs text-slate-500">
              Du kan endre status manuelt.
            </div>
          </div>

          <div className="flex flex-col">
            <label className={label}>Gyldig til</label>
            <input
              disabled={disabled}
              className={input}
              type="date"
              value={q.validUntil ?? ""}
              onChange={(e) => {
                setTouched(true);
                onChange({ ...q, validUntil: e.target.value || null });
              }}
            />
          </div>

          <div className="flex flex-col">
            <label className={label}>MVA %</label>
            <input
              disabled={disabled}
              className={input}
              inputMode="numeric"
              value={String(q.vatRate ?? 25)}
              onChange={(e) => {
                setTouched(true);
                const n = Number(e.target.value);
                onChange({ ...q, vatRate: Number.isFinite(n) ? n : 25 });
              }}
              placeholder="25"
            />
          </div>

          {/* ✅ NYTT: Reply-To */}
          <div className="md:col-span-2 flex flex-col">
            <label className={label}>Svar til e-post (Reply-To) *</label>
            <input
              disabled={disabled}
              className={input}
              value={q.replyToEmail ?? ""}
              onChange={(e) => {
                setTouched(true);
                onChange({ ...q, replyToEmail: e.target.value.trim() || null });
              }}
              placeholder="f.eks. post@firma.no"
              inputMode="email"
            />
            {!replyOk && touched && (
              <div className="mt-2 text-sm text-red-600">
                Skriv inn en gyldig e-post. Denne brukes når kunden trykker
                “Svar” på e-posten.
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col">
            <label className={label}>Melding (valgfritt)</label>
            <textarea
              disabled={disabled}
              className={input}
              rows={4}
              value={q.message ?? ""}
              onChange={(e) => {
                setTouched(true);
                onChange({ ...q, message: e.target.value || null });
              }}
              placeholder="F.eks. Dette tilbudet inkluderer..."
            />
          </div>

          {!valid && touched && (
            <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Husk: Kundenavn + svar-til e-post + minst én linje med beskrivelse
              må fylles ut.
            </div>
          )}
        </div>
      </div>

      <QuoteLinesEditor
        lines={q.lines}
        onChange={(lines) => onChange({ ...q, lines })}
        disabled={disabled}
      />

      <QuotePreviewCard q={q} />
    </div>
  );
}
