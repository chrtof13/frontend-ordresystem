// app/jobs/page.tsx
import { Suspense } from "react";
import JobsClient from "./JobsClient";

export default function JobsPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-slate-600">Laster oppdrag...</div>}
    >
      <JobsClient />
    </Suspense>
  );
}
