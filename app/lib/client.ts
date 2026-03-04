"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function getToken() {
  if (typeof window === "undefined") return null;

  const t =
    window.localStorage.getItem("token") ??
    window.sessionStorage.getItem("token");

  const token = t?.trim();
  return token ? token : null;
}

// Bruk env hvis du har den i Vercel, ellers fallback til din Render URL:
export const API =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "https://backend-ordresystem.onrender.com";

function tryParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function authedFetch(
  router: AppRouterInstance,
  path: string,
  init?: RequestInit,
) {
  const token = getToken();
  if (!token) {
    router.replace("/login");
    throw new Error("Mangler token");
  }

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (!res.ok) {
    // Kun ekte token/auth-problem skal sende deg til login:
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      router.replace("/login");
      throw new Error("Ikke autorisert");
    }

    const text = await res.text().catch(() => "");
    const json = tryParseJson(text);
    const msg = json?.message || text || "Feil fra server";
    throw new Error(msg);
  }

  return res;
}

export async function authedUpload(
  router: any,
  path: string,
  form: FormData,
) {
  const token =
    localStorage.getItem("token") ?? sessionStorage.getItem("token");

  if (!token) {
    router.replace("/login");
    throw new Error("Mangler token");
  }

  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload feilet (HTTP ${res.status})`);
  }

  return res;
}

export function logout(router?: AppRouterInstance | null) {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");

  if (router) router.replace("/login");
  else window.location.href = "/login";
}

/** JWT-hjelpere (for rollebasert UI) */
type JwtPayload = { rolle?: string; role?: string; [k: string]: any };

function base64UrlDecode(input: string) {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(base64);
  try {
    return decodeURIComponent(
      Array.from(decoded)
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
  } catch {
    return decoded;
  }
}

export function getJwtPayload(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

export function isOwner(): boolean {
  const p = getJwtPayload();
  return p?.rolle === "OWNER" || p?.role === "OWNER";
}

export function isAdmin(): boolean {
  const p: any = getJwtPayload();
  const r = String(p?.rolle ?? p?.role ?? "").toUpperCase();
  const roles = Array.isArray(p?.roles) ? p.roles.map((x: any) => String(x).toUpperCase()) : [];
  const auth = Array.isArray(p?.authorities) ? p.authorities.map((x: any) => String(x).toUpperCase()) : [];

  return (
    r === "ADMIN" ||
    roles.includes("ADMIN") ||
    roles.includes("ROLE_ADMIN") ||
    auth.includes("ADMIN") ||
    auth.includes("ROLE_ADMIN")
  );
}

/** API-kall: endre passord */
export async function changePassword(
  router: AppRouterInstance,
  gammeltPassord: string,
  nyttPassord: string,
) {
  // Backend forventer { gammeltPassord, nyttPassord }
  await authedFetch(router, "/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ gammeltPassord, nyttPassord }),
  });
}

export async function updateTimerGjort(
  router: AppRouterInstance,
  oppdragId: number,
  timerGjort: number,
) {
  const res = await authedFetch(router, `/api/oppdrag/${oppdragId}/timer-gjort`, {
    method: "PUT",
    body: JSON.stringify({ timerGjort }),
  });

  // backend returnerer Oppdrag (json)
  return (await res.json()) as any;
}