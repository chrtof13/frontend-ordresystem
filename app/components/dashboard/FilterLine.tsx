"use client";

import Link from "next/link";
import { Plus, ArrowRightIcon } from "lucide-react";

export type SortOrder = "NEWEST" | "OLDEST";
export type StatusFilter = "ALL" | "PLANLAGT" | "PÅGÅR" | "FERDIG";

export type Filters = {
  status: StatusFilter;
  sort: SortOrder;
};

export default function FilterLine({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
}) {
  return (
    <div className="mb-5">
      {/* ✅ Mobil: Rad 1 = 2 dropdowns, Rad 2 = knapp */}
      <div className="md:hidden space-y-3">
        {/* Rad 1 */}
        <div className="grid grid-cols-2 gap-3">
          {/* Status */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Status
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
              value={value.status}
              onChange={(e) =>
                onChange({
                  ...value,
                  status: e.target.value as Filters["status"],
                })
              }
            >
              <option value="ALL">Alle</option>
              <option value="PLANLAGT">Planlagt</option>
              <option value="PÅGÅR">Pågår</option>
              <option value="FERDIG">Ferdig</option>
            </select>
          </div>

          {/* Sort */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Sortering
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
              value={value.sort}
              onChange={(e) =>
                onChange({
                  ...value,
                  sort: e.target.value as Filters["sort"],
                })
              }
            >
              <option value="NEWEST">Nyeste</option>
              <option value="OLDEST">Eldste</option>
            </select>
          </div>
        </div>

        {/* Rad 2 */}
        <Link
          href="/jobs/newJob"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
          Nytt Oppdrag
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* ✅ Desktop: behold “filtre til venstre, knapp til høyre” */}
      <div className="hidden md:flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-sm">
            <label className="text-sm font-medium text-slate-600">
              Status:
            </label>
            <select
              className="bg-transparent text-sm outline-none"
              value={value.status}
              onChange={(e) =>
                onChange({
                  ...value,
                  status: e.target.value as Filters["status"],
                })
              }
            >
              <option value="ALL">Alle</option>
              <option value="PLANLAGT">Planlagt</option>
              <option value="PÅGÅR">Pågår</option>
              <option value="FERDIG">Ferdig</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-sm">
            <label className="text-sm font-medium text-slate-600">
              Sorter:
            </label>
            <select
              className="bg-transparent text-sm outline-none"
              value={value.sort}
              onChange={(e) =>
                onChange({ ...value, sort: e.target.value as Filters["sort"] })
              }
            >
              <option value="NEWEST">Nyeste</option>
              <option value="OLDEST">Eldste</option>
            </select>
          </div>
        </div>

        <Link
          href="/jobs/newJob"
          className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
          Nytt Oppdrag
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
