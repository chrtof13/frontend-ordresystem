"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch, authedUpload, API } from "../../lib/client";
import type { FirmaDocumentSettings } from "../../lib/documentSettingsTypes";
import type { SubscriptionPlan } from "../../lib/subscription";
import { hasAtLeast } from "../../lib/subscription";

const emptyState: FirmaDocumentSettings = {
  navn: "",
  epost: "",
  telefon: "",
  logoPath: "",
  adresse: "",
  postnr: "",
  poststed: "",
  website: "",
  orgnr: "",
  documentTerms: "",
  documentSignature: "",
};

type FirmaOverview = {
  id: number;
  navn: string;
  status: string;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
  userCount: number;
};

export default function DocumentSettingsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<FirmaDocumentSettings>(emptyState);
  const [subscriptionPlan, setSubscriptionPlan] =
    useState<SubscriptionPlan>("BASIC");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasAccess = hasAtLeast(subscriptionPlan, "STANDARD");

  const canSave = useMemo(() => {
    return String(form.navn ?? "").trim().length > 0 && hasAccess;
  }, [form, hasAccess]);

  function logoSrc(path?: string | null) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API}${path}`;
  }

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const firmaRes = await authedFetch(router, "/api/firma/me");
      const firma = (await firmaRes.json()) as FirmaOverview;
      setSubscriptionPlan(firma.subscriptionPlan ?? "BASIC");

      if (!hasAtLeast(firma.subscriptionPlan, "STANDARD")) {
        setLoading(false);
        return;
      }

      const res = await authedFetch(router, "/api/firma/document-settings");
      const data = (await res.json()) as FirmaDocumentSettings;

      setForm({
        ...emptyState,
        ...data,
      });
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke hente dokumentinnstillinger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!hasAccess) return;

    setSaving(true);
    setError(null);
    setMsg(null);

    try {
      const res = await authedFetch(router, "/api/firma/document-settings", {
        method: "PUT",
        body: JSON.stringify({
          navn: form.navn?.trim() || null,
          epost: form.epost?.trim() || null,
          telefon: form.telefon?.trim() || null,
          logoPath: form.logoPath?.trim() || null,
          adresse: form.adresse?.trim() || null,
          postnr: form.postnr?.trim() || null,
          poststed: form.poststed?.trim() || null,
          website: form.website?.trim() || null,
          orgnr: form.orgnr?.trim() || null,
          documentTerms: form.documentTerms?.trim() || null,
          documentSignature: form.documentSignature?.trim() || null,
        }),
      });

      const saved = (await res.json()) as FirmaDocumentSettings;
      setForm({
        ...emptyState,
        ...saved,
      });
      setMsg("Dokumentmal lagret ✅");
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke lagre");
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(file: File) {
    if (!hasAccess) return;

    setUploadingLogo(true);
    setError(null);
    setMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await authedUpload(
        router,
        "/api/firma/document-settings/logo",
        formData,
      );
      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        logoPath: data.logoPath ?? "",
      }));

      setMsg("Logo lastet opp ✅");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke laste opp logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function deleteLogo() {
    if (!hasAccess) return;

    const ok = confirm("Slette logo?");
    if (!ok) return;

    setError(null);
    setMsg(null);
    setUploadingLogo(true);

    try {
      await authedFetch(router, "/api/firma/document-settings/logo", {
        method: "DELETE",
      });

      setForm((prev) => ({
        ...prev,
        logoPath: "",
      }));

      setMsg("Logo slettet ✅");
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke slette logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  function patch<K extends keyof FirmaDocumentSettings>(
    key: K,
    value: FirmaDocumentSettings[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <p className="text-slate-600">Laster...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-100">
        <main className="mx-auto max-w-4xl p-4 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">
                Dokumentmal
              </h1>
              <p className="text-slate-600 mt-1">
                Sett opp firmaprofil, logo og standardtekst for pristilbud.
              </p>
            </div>

            <button
              onClick={() => router.push("/quotes")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tilbake
            </button>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="text-lg font-semibold text-amber-900">
              Denne funksjonen krever Standard-abonnement
            </div>
            <p className="mt-2 text-sm text-amber-800">
              Dokumentmal, firmalogo og standardvilkår er ikke tilgjengelig i
              Basic.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/company")}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Se abonnement
              </button>

              <button
                onClick={() => router.push("/quotes")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Tilbake
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Dokumentmal</h1>
            <p className="text-slate-600 mt-1">
              Sett opp firmaprofil, logo og standardtekst for pristilbud.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/quotes")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tilbake
            </button>

            <button
              onClick={save}
              disabled={saving || uploadingLogo || !canSave}
              className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
            >
              {saving ? "Lagrer..." : "Lagre"}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Card title="Firmainfo">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Firmanavn *"
                  value={form.navn ?? ""}
                  onChange={(v) => patch("navn", v)}
                />
                <Input
                  label="E-post"
                  value={form.epost ?? ""}
                  onChange={(v) => patch("epost", v)}
                />
                <Input
                  label="Telefon"
                  value={form.telefon ?? ""}
                  onChange={(v) => patch("telefon", v)}
                />
                <Input
                  label="Org.nr"
                  value={form.orgnr ?? ""}
                  onChange={(v) => patch("orgnr", v)}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Adresse"
                    value={form.adresse ?? ""}
                    onChange={(v) => patch("adresse", v)}
                  />
                </div>
                <Input
                  label="Postnr"
                  value={form.postnr ?? ""}
                  onChange={(v) => patch("postnr", v)}
                />
                <Input
                  label="Poststed"
                  value={form.poststed ?? ""}
                  onChange={(v) => patch("poststed", v)}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Hjemmeside"
                    value={form.website ?? ""}
                    onChange={(v) => patch("website", v)}
                  />
                </div>
              </div>
            </Card>

            <Card title="Logo">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadLogo(file);
                }}
              />

              <div className="space-y-4">
                {form.logoPath ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <img
                      src={logoSrc(form.logoPath)}
                      alt="Logo"
                      className="max-h-24 max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    Ingen logo lastet opp
                  </div>
                )}

                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingLogo}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                  >
                    {uploadingLogo ? "Laster opp..." : "Velg logo"}
                  </button>

                  {form.logoPath && (
                    <button
                      type="button"
                      onClick={deleteLogo}
                      disabled={uploadingLogo}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      Slett logo
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  Bruk helst PNG med transparent bakgrunn.
                </p>
              </div>
            </Card>

            <Card title="Standardvilkår">
              <Textarea
                label="Vilkår som vises på side 2 i pristilbud"
                value={form.documentTerms ?? ""}
                onChange={(v) => patch("documentTerms", v)}
                rows={8}
              />
            </Card>

            <Card title="Standard signatur">
              <Textarea
                label="Signatur / avslutning"
                value={form.documentSignature ?? ""}
                onChange={(v) => patch("documentSignature", v)}
                rows={6}
              />
            </Card>
          </div>

          <div>
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-semibold">Forhåndsvisning</h2>
              </div>

              <div className="p-4 space-y-4">
                {form.logoPath ? (
                  <img
                    src={logoSrc(form.logoPath)}
                    alt="Logo"
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    Ingen logo valgt
                  </div>
                )}

                <div>
                  <div className="font-semibold text-slate-900">
                    {form.navn || "Firmanavn"}
                  </div>
                  <div className="text-sm text-slate-600 whitespace-pre-line">
                    {[
                      form.adresse,
                      [form.postnr, form.poststed].filter(Boolean).join(" "),
                      form.telefon,
                      form.epost,
                      form.website,
                    ]
                      .filter(Boolean)
                      .join("\n")}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-semibold">Pristilbud</div>
                  <div className="mt-2 text-sm text-slate-600 whitespace-pre-line">
                    {form.documentTerms || "Standardvilkår vises her..."}
                  </div>
                </div>

                <div className="text-sm text-slate-700 whitespace-pre-line">
                  {form.documentSignature || "Standard signatur vises her..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 6,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-slate-700 mb-1">{label}</label>
      <textarea
        className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
    </div>
  );
}
