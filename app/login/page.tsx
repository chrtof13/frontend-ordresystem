"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API = "https://backend-ordresystem.onrender.com";

type LoginResponse = { accessToken: string };

export default function LoginPage() {
  const router = useRouter();

  const [uname, setUname] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labelClass = "text-sm sm:text-base font-medium text-slate-700 mb-1";
  const inputClass =
    "rounded-md border border-slate-300 px-3 py-2 sm:py-3 outline-none focus:ring-2 focus:ring-blue-400";

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
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-[#123250] to-[#2c76b7] px-4">
      <div className="-translate-y-20 sm:-translate-y-10 w-full">
        <div className="flex justify-center items-center gap-3 mb-6 sm:mb-10">
          {/*<Image
            src="/logoV2.png"
            alt="Ordrebase logo"
            width={40}
            height={40}
            className="sm:w-14 sm:h-14"
          /> */}
          <h1 className="text-3xl sm:text-5xl font-bold text-white">
            Ordrebase
          </h1>
        </div>

        <div className="bg-white/85 w-full max-w-md sm:max-w-xl px-6 sm:px-8 py-10 sm:pt-20 rounded-md shadow-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl text-center mb-6 sm:mb-8 text-[#2c76b7]">
            Logg inn
          </h2>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4 text-black">
            <div className="flex flex-col">
              <label htmlFor="uname" className={labelClass}>
                Brukernavn
              </label>
              <input
                value={uname}
                onChange={(e) => setUname(e.target.value)}
                type="text"
                id="uname"
                placeholder="per123.."
                className={inputClass}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password" className={labelClass}>
                Passord
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                placeholder="••••••••"
                className={inputClass}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-700/90 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-green-600 rounded-md w-full py-3 sm:py-4 mt-2 text-white"
            >
              <span className="flex justify-center text-lg">
                {loading ? "Logger inn..." : "Logg inn"}
              </span>
            </button>

            <div className="flex justify-between gap-3 text-sm sm:text-lg pt-5">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Husk meg
              </label>

              <a
                href="#"
                className="text-blue-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Glemt passord kan vi lage senere 🙂");
                }}
              >
                Glemt passord?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
