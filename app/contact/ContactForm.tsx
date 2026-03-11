"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleOpenMail() {
    const subject = "Spørsmål om Ordrebase";

    const body = [
      `Navn: ${name.trim() || "-"}`,
      `E-post: ${email.trim() || "-"}`,
      "",
      "Melding:",
      message.trim() || "-",
    ].join("\n");

    const mailto = `mailto:ordrebase.app@gmail.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Navn
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Ditt navn"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          E-post
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="navn@firma.no"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Melding
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Skriv spørsmålet ditt her..."
        />
      </div>

      <button
        type="button"
        onClick={handleOpenMail}
        className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Åpne e-postmelding
      </button>
    </div>
  );
}
