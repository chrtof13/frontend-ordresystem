"use client";

import { useMemo } from "react";
import type { QuoteLine } from "../lib/quoteTypes";
import { fmtMoney, lineTotal } from "../lib/quoteUtils";

type Props = {
  lines: QuoteLine[];
  onChange: (next: QuoteLine[]) => void;
  disabled?: boolean;
};

export default function QuoteLinesEditor({ lines, onChange, disabled }: Props) {
  const sorted = useMemo(
    () =>
      (lines ?? [])
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [lines],
  );

  function patch(idx: number, patch: Partial<QuoteLine>) {
    const next = sorted.map((l, i) => (i === idx ? { ...l, ...patch } : l));
    // re-apply sortOrder in list order
    const normalized = next.map((l, i) => ({ ...l, sortOrder: i }));
    onChange(normalized);
  }

  function addLine() {
    const next = [
      ...sorted,
      {
        type: "WORK",
        name: "",
        qty: 1,
        unit: "stk",
        unitPrice: 0,
        sortOrder: sorted.length,
      },
    ];
    onChange(next);
  }

  function removeLine(idx: number) {
    const next = sorted
      .filter((_, i) => i !== idx)
      .map((l, i) => ({ ...l, sortOrder: i }));
    onChange(
      next.length
        ? next
        : [
            {
              type: "WORK",
              name: "",
              qty: 1,
              unit: "stk",
              unitPrice: 0,
              sortOrder: 0,
            },
          ],
    );
  }

  const input =
    "rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white";
  const th = "text-left px-3 py-2 text-xs font-semibold text-slate-600";
  const td = "px-3 py-2 align-top";

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Linjer</h2>
          <p className="text-sm text-slate-600 mt-1">
            Legg inn linjer for pristilbudet. Totaler regnes automatisk.
          </p>
          <p className="text-sm text-slate-600 mt-1">Eks:</p>
          <p className="text-sm text-slate-600 mt-1">
            Beskrivelse: Arbeid - Antall: 30 - Enhet: Timer - Pris: 600 - sum;
          </p>
        </div>

        <button
          type="button"
          onClick={addLine}
          disabled={disabled}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          + Ny linje
        </button>
      </div>

      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className={th}>Beskrivelse</th>
              <th className={th}>Antall</th>
              <th className={th}>Enhet</th>
              <th className={th}>Pris</th>
              <th className={th}>Sum</th>
              <th className={th} />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {sorted.map((l, idx) => (
              <tr key={idx} className="bg-white">
                <td className={td}>
                  <input
                    disabled={disabled}
                    className={input + " w-full"}
                    value={l.name ?? ""}
                    onChange={(e) => patch(idx, { name: e.target.value })}
                    placeholder="F.eks. Arbeid, materialer, fastpris…"
                  />
                </td>

                <td className={td}>
                  <input
                    disabled={disabled}
                    className={input + " w-28 tabular-nums"}
                    inputMode="decimal"
                    value={l.qty ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(",", ".");
                      const n = v.trim() === "" ? null : Number(v);
                      patch(idx, {
                        qty: Number.isFinite(n as any) ? (n as any) : null,
                      });
                    }}
                    placeholder="1"
                  />
                </td>

                <td className={td}>
                  <input
                    disabled={disabled}
                    className={input + " w-24"}
                    value={l.unit ?? ""}
                    onChange={(e) => patch(idx, { unit: e.target.value })}
                    placeholder="stk"
                  />
                </td>

                <td className={td}>
                  <input
                    disabled={disabled}
                    className={input + " w-32 tabular-nums"}
                    inputMode="decimal"
                    value={l.unitPrice ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(",", ".");
                      const n = v.trim() === "" ? null : Number(v);
                      patch(idx, {
                        unitPrice: Number.isFinite(n as any)
                          ? (n as any)
                          : null,
                      });
                    }}
                    placeholder="0,00"
                  />
                </td>

                <td className={td + " tabular-nums font-semibold"}>
                  {fmtMoney(lineTotal(l))} kr
                </td>

                <td className={td + " text-right"}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeLine(idx)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    Slett
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil */}
      <div className="md:hidden p-4 space-y-3">
        {sorted.map((l, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">
                  Beskrivelse
                </div>
                <input
                  disabled={disabled}
                  className={input + " w-full"}
                  value={l.name ?? ""}
                  onChange={(e) => patch(idx, { name: e.target.value })}
                  placeholder="F.eks. Arbeid…"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">
                    Antall
                  </div>
                  <input
                    disabled={disabled}
                    className={input + " w-full tabular-nums"}
                    inputMode="decimal"
                    value={l.qty ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(",", ".");
                      const n = v.trim() === "" ? null : Number(v);
                      patch(idx, {
                        qty: Number.isFinite(n as any) ? (n as any) : null,
                      });
                    }}
                    placeholder="1"
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">
                    Enhet
                  </div>
                  <input
                    disabled={disabled}
                    className={input + " w-full"}
                    value={l.unit ?? ""}
                    onChange={(e) => patch(idx, { unit: e.target.value })}
                    placeholder="stk"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">
                    Pris
                  </div>
                  <input
                    disabled={disabled}
                    className={input + " w-full tabular-nums"}
                    inputMode="decimal"
                    value={l.unitPrice ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(",", ".");
                      const n = v.trim() === "" ? null : Number(v);
                      patch(idx, {
                        unitPrice: Number.isFinite(n as any)
                          ? (n as any)
                          : null,
                      });
                    }}
                    placeholder="0,00"
                  />
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-600 mb-1">
                    Sum
                  </div>
                  <div className="font-semibold tabular-nums text-slate-900">
                    {fmtMoney(lineTotal(l))} kr
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeLine(idx)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  Slett
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
