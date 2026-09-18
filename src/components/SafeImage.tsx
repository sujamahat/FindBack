"use client";

import { useState, type ReactNode } from "react";

/**
 * <img> that swaps to `fallback` when the source is missing or fails to load
 * (dead URL, offline, blocked host) instead of showing a broken-image icon.
 */
export function SafeImage({
  src,
  alt,
  className,
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}
