import type { Quote, QuoteLine } from "./quoteTypes";
import { newEmptyQuote } from "./quoteUtils";

export function normalizeQuote(raw: any): Quote {
  const base = newEmptyQuote();

  const lines: QuoteLine[] = Array.isArray(raw?.lines)
    ? raw.lines.map((l: any, idx: number) => ({
        id: l?.id ?? undefined,
        type: l?.type ?? "WORK",
        name: String(l?.name ?? ""),
        qty: l?.qty ?? 1,
        unit: l?.unit ?? "stk",
        unitPrice: l?.unitPrice ?? 0,
        sortOrder: Number.isFinite(l?.sortOrder) ? l.sortOrder : idx,
      }))
    : base.lines;

  return {
    ...base,
    ...raw,

    // tving disse til å aldri være null i UI:
    kundeNavn: String(raw?.kundeNavn ?? ""),
    kundeEpost: raw?.kundeEpost ?? null,
    kundeTelefon: raw?.kundeTelefon ?? null,
    title: raw?.title ?? null,
    message: raw?.message ?? null,
    validUntil: raw?.validUntil ?? null,
    vatRate: Number.isFinite(raw?.vatRate) ? raw.vatRate : 25,

    lines,
  };
}