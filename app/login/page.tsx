"use client";

import Link from "next/link";
import { Eye, EyeOff, Layers, ArrowRight } from "lucide-react";
import { API } from "../lib/client";
import { useRouter } from "next/navigation";
import { useState } from "react";



type LoginResponse = { accessToken: string };

export default function LoginPage() {
  const router = useRouter();

  const [uname, setUname] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brukernavn: uname.trim(),
          passord: password,
        }),
      });

      if (!res.ok) {
        setError("Feil brukernavn eller passord");
        setLoading(false);
        return;
      }

      const data = (await res.json()) as LoginResponse;
      const token = data.accessToken;

      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      if (remember) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      router.replace("/home");
    } catch {
      setError("Kunne ikke kontakte server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ob-login">
      <aside className="ob-login-story"><Link href="/" className="ob-brand"><span className="ob-brand-icon"><Layers size={22} /></span>ordrebase<span className="ob-brand-dot">.</span></Link><div><span className="ob-eyebrow">MER OVERSIKT. MINDRE PAPIRARBEID.</span><h2>Alt du trenger for en ryddigere arbeidsdag.</h2><p>Oppdrag, pristilbud og dokumentasjon på ett sted. Så du kan bruke mer tid på jobben du skal gjøre.</p></div><footer>Laget for håndverkere og små bedrifter.</footer></aside>
      <main className="ob-login-form"><h1>Velkommen tilbake</h1><p>Logg inn for å fortsette der du slapp.</p>
        {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-5">
          <div><label htmlFor="uname">Brukernavn</label><input id="uname" value={uname} onChange={e => setUname(e.target.value)} required autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Skriv brukernavnet ditt" /></div>
          <div><label htmlFor="password">Passord</label><div className="relative"><input id="password" value={password} onChange={e => setPassword(e.target.value)} required type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Skriv passordet ditt" style={{ paddingRight: 48 }} /><button type="button" className="absolute right-1 top-1 p-3 text-slate-500" aria-label={showPassword ? "Skjul passord" : "Vis passord"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
          <div className="flex flex-wrap items-center justify-between gap-3"><label style={{ display: "flex", gap: 8, alignItems: "center", margin: 0 }}><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />Husk meg</label><Link href="/contact" className="text-sm text-emerald-800 hover:underline">Trenger du hjelp?</Link></div>
          <button type="submit" disabled={loading} className="ob-primary disabled:opacity-60">{loading ? "Logger inn…" : "Logg inn"}<ArrowRight size={18} /></button>
        </form>
        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">Ny i Ordrebase? <Link href="/kom-i-gang" className="font-semibold text-emerald-800 hover:underline">Kom i gang</Link></div>
        <div className="mt-10 flex justify-center gap-5 text-xs text-slate-500"><Link href="/privacy">Personvern</Link><Link href="/terms">Vilkår</Link><Link href="/">Til forsiden</Link></div>
      </main>
    </div>
  );
}
