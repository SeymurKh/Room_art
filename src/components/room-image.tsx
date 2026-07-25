"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

export function RoomImage({
  fallbackText = "Image unavailable",
  className,
  fill,
  alt,
  sizes,
  src,
  ...props
}: ImageProps & { fallbackText?: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    if (fill) {
      return (
        <div
          className={`flex items-center justify-center bg-[#e2ded4] text-[#6f6a61] text-xs uppercase tracking-[0.14em] ${className ?? ""}`}
        >
          {fallbackText}
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center bg-[#e2ded4] text-[#6f6a61] text-xs uppercase tracking-[0.14em] p-8">
        {fallbackText}
      </div>
    );
  }

    return (
    <Image
      {...props}
      src={src}
      fill={fill}
      sizes={sizes ?? (fill ? "(max-width: 768px) 100vw, 50vw" : undefined)}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTRlMGQ4Ii8+PC9zdmc+"
      className={className}
      alt={alt ?? ""}
      onError={() => setError(true)}
    />
  );
}
