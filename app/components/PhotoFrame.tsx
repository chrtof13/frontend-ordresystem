"use client";

import React from "react";

export default function PhotoFrame({
  src,
  alt,
  ratio = "16/9",
  rounded = "rounded-2xl",
  className = "",
  imgClassName = "object-cover",
}: {
  src: string;
  alt: string;
  ratio?: "16/9" | "21/9" | "4/3" | "3/2" | "1/1";
  rounded?: string;
  className?: string;
  imgClassName?: string;
}) {
  const ratioClass =
    ratio === "21/9"
      ? "aspect-[21/9]"
      : ratio === "4/3"
        ? "aspect-[4/3]"
        : ratio === "3/2"
          ? "aspect-[3/2]"
          : ratio === "1/1"
            ? "aspect-square"
            : "aspect-video"; // 16/9

  return (
    <div
      className={`${rounded} overflow-hidden bg-slate-100 ${ratioClass} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full ${imgClassName}`}
        loading="lazy"
      />
    </div>
  );
}
