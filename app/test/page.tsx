"use client";

import { useSearchParams } from "next/navigation";

export default function TestPage() {
  const sp = useSearchParams();

  return <div>{sp.get("plan")}</div>;
}
