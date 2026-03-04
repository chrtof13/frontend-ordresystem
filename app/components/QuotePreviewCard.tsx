"use client";

import type { Quote } from "../lib/quoteTypes";
import {
  fmtMoney,
  sumExVatFromInc,
  sumIncVatFromLines,
  vatFromInc,
} from "../lib/quoteUtils";

export default function QuotePreviewCard({ q }: { q: Quote }) {
  const inc = sumIncVatFromLines(q);
  const ex = sumExVatFromInc(inc, q.vatRate ?? 0);
  const vat = vatFromInc(inc, q.vatRate ?? 0);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6">
      <h2 className="text-lg font-semibold">Oppsummering</h2>

      <div className="mt-3 text-sm text-slate-700 space-y-1">
        <div className="flex justify-between gap-3">
          <span>Sum eks. mva</span>
          <span className="font-semibold tabular-nums">{fmtMoney(ex)} kr</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Mva ({q.vatRate ?? 0}%)</span>
          <span className="font-semibold tabular-nums">{fmtMoney(vat)} kr</span>
        </div>
        <div className="flex justify-between gap-3 border-t border-slate-200 pt-2">
          <span className="font-semibold">Sum inkl. mva</span>
          <span className="font-bold tabular-nums">{fmtMoney(inc)} kr</span>
        </div>
      </div>
    </div>
  );
}
