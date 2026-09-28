"use client";
export type SortOrder = "NEWEST" | "OLDEST";
export type StatusFilter = "ALL" | "PLANLAGT" | "PÅGÅR" | "FERDIG";
export type Filters = { status: StatusFilter; sort: SortOrder };
const statuses: { value: StatusFilter; label: string }[] = [{ value: "ALL", label: "Alle" }, { value: "PLANLAGT", label: "Planlagt" }, { value: "PÅGÅR", label: "Pågår" }, { value: "FERDIG", label: "Ferdig" }];
export default function FilterLine({ value, onChange }: { value: Filters; onChange: (next: Filters) => void }) {
  return <div className="ob-filters"><div className="ob-filter-tabs" role="group" aria-label="Filtrer etter status">{statuses.map(status => <button key={status.value} aria-pressed={value.status === status.value} onClick={() => onChange({ ...value, status: status.value })}>{status.label}</button>)}</div><label className="ob-sort">Sorter etter<select value={value.sort} onChange={e => onChange({ ...value, sort: e.target.value as SortOrder })}><option value="NEWEST">Nyeste først</option><option value="OLDEST">Eldste først</option></select></label></div>;
}
