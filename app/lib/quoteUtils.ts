import type { Quote, QuoteLine } from "./quoteTypes";

export function toNum(s: string): number {
  const t = (s ?? "").trim().replace(/\s/g, "").replace(",", ".");
  if (!t) return NaN;
  return Number(t);
}

export function fmtMoney(n: number): string {
  const x = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(x);
}

export function lineTotal(l: QuoteLine): number {
  const qty = l.qty ?? 0;
  const unit = l.unitPrice ?? 0;
  return qty * unit;
}

export function sumExVatFromLines(q: Quote): number {
  return (q.lines ?? []).reduce((acc, l) => acc + lineTotal(l), 0);
}

export function vatAmount(exVat: number, vatRate: number): number {
  const r = Number.isFinite(vatRate) ? vatRate : 0;
  return exVat * (r / 100);
}

export function sumIncVatFromLines(q: Quote): number {
  const ex = sumExVatFromLines(q);
  const vat = vatAmount(ex, q.vatRate ?? 0);
  return ex + vat;
}

export function newEmptyQuote(): Quote {
  return {
    kundeNavn: "",
    kundeEpost: null,
    kundeTelefon: null,
    title: null,
    message: null,
    vatRate: 25,
    validUntil: null,
    lines: [
      {
        type: "WORK",
        name: "",
        qty: 1,
        unit: "stk",
        unitPrice: 0,
        sortOrder: 0,
      },
    ],
  };
}