"use client";

import { useState } from "react";

export type FaqItem = { q: string; a: string };

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <Faq key={i} item={item} />
      ))}
    </div>
  );
}

function Faq({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
      >
        <span className="font-semibold">{item.q}</span>
        <span className="text-slate-500">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
          {item.a}
        </div>
      )}
    </div>
  );
}
