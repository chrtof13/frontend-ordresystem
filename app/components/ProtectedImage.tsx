"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch, API } from "../lib/client";

export default function ProtectedImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const router = useRouter();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let currentBlobUrl: string | null = null;

    async function load() {
      try {
        setError(false);
        setBlobUrl(null);

        const finalUrl = src.startsWith("http") ? src : `${API}${src}`;

        const res = await authedFetch(router, finalUrl, {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Kunne ikke hente bilde");
        }

        const blob = await res.blob();
        currentBlobUrl = URL.createObjectURL(blob);

        if (active) {
          setBlobUrl(currentBlobUrl);
        }
      } catch {
        if (active) setError(true);
      }
    }

    load();

    return () => {
      active = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [router, src]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-red-600">
        Kunne ikke laste bilde
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
        Laster bilde...
      </div>
    );
  }

  return <img src={blobUrl} alt={alt} className={className} />;
}
