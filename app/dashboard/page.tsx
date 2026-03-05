"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppEntry() {
  const router = useRouter();

  useEffect(() => {
    const token =
      localStorage.getItem("token") ?? sessionStorage.getItem("token");

    router.replace(token ? "/home" : "/login");
  }, [router]);

  return null;
}
