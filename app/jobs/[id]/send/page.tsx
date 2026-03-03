// app/jobs/[id]/send/page.tsx
import { Suspense } from "react";
import SendMailClient from "./sendMailClient";

export default function SendMailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 p-6 text-slate-600">
          Laster...
        </div>
      }
    >
      <SendMailClient />
    </Suspense>
  );
}
