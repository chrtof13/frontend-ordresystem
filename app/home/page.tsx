// app/home/page.tsx
import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-600">Laster...</div>}>
      <HomeClient />
    </Suspense>
  );
}
