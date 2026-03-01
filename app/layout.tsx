// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

// Hvis du bruker next/font:
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

// Hvis du har en Providers-komponent (valgfritt):
// import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Ordrebase",
    template: "%s | Ordrebase",
  },
  description: "Ordre- og oppdragssystem",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className={inter.className}>
        {/* <Providers> */}
        {children}
        {/* </Providers> */}
      </body>
    </html>
  );
}
