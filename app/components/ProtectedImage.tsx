"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch } from "../lib/client";

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

        const cleanSrc = src?.trim() ?? "";
        if (!cleanSrc) {
          throw new Error("Mangler src");
        }

        let res: Response;

        // Relative beskyttede backend-ruter -> bruk authedFetch
        if (cleanSrc.startsWith("/")) {
          res = await authedFetch(router, cleanSrc, {
            method: "GET",
          });
        } else {
          // Full URL -> bruk vanlig fetch uten å prepend API en gang til
          res = await fetch(cleanSrc, {
            method: "GET",
          });
        }

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
    return <div className="text-sm text-red-600">Kunne ikke laste bilde</div>;
  }

  if (!blobUrl) {
    return <div className="text-sm text-slate-500">Laster bilde...</div>;
  }

  return <img src={blobUrl} alt={alt} className={className} />;
}
