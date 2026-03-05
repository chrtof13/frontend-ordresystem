// app/layout.tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

import { Inter } from "next/font/google";
import AppShell from "./components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ordrebase.no"),
  title: "Ordrebase | Oppdragsstyring for håndverkere",
  description:
    "Ordrebase hjelper håndverkere og små bedrifter med oppdragsstyring: tilbud, kontrakt, kundegodkjenning og ordrestatus.",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    title: "Ordrebase",
    description:
      "Oppdragsstyring for håndverkere – tilbud, kontrakt og kundegodkjenning.",
    url: "https://www.ordrebase.no",
    siteName: "Ordrebase",
    images: [
      {
        url: "/screenshot-dashboard.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "nb_NO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no">
      <body className={inter.className}>
        <AppShell>{children}</AppShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
