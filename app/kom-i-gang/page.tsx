import { Suspense } from "react";
import KomIGangClient from "./KomIGangClient";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-slate-50 p-6">Laster…</div>}
    >
      <KomIGangClient />
    </Suspense>
  );
}
