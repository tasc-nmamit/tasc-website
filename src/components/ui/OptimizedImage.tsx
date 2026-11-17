"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackSrc?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
  quality?: number;
}

/**
 * Lightweight image component rendering directly via next/image (when `fill` or explicit
 * `width` & `height` are provided) or a standard `<img>`, with native lazy loading,
 * async decoding, and fallback handling without App Check / fetch restrictions.
 */
export default function OptimizedImage({
  src,
  fallbackSrc,
  alt,
  fill,
  width,
  height,
  className = "",
  style,
  sizes,
  priority,
  unoptimized = true,
  quality,
  loading,
  decoding = "async",
  referrerPolicy,
  onError,
  onLoad,
  ...rest
}: OptimizedImageProps) {
  const rawSrc = src || fallbackSrc || "";
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!rawSrc) return null;

  const currentSrc = failedSrc === rawSrc && fallbackSrc ? fallbackSrc : rawSrc;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setFailedSrc(rawSrc);
    }
    onError?.(e);
  };

  if (fill || (width && height)) {
    return (
      <Image
        src={currentSrc}
        alt={alt || ""}
        fill={fill}
        width={fill ? undefined : Number(width)}
        height={fill ? undefined : Number(height)}
        sizes={sizes ?? (fill ? "(max-width: 768px) 100vw, 50vw" : undefined)}
        priority={priority}
        loading={priority ? undefined : loading || "lazy"}
        decoding={decoding}
        unoptimized={unoptimized}
        quality={quality}
        referrerPolicy={referrerPolicy}
        className={className}
        style={style}
        onError={handleError}
        onLoad={onLoad}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || ""}
      width={width}
      height={height}
      loading={priority ? "eager" : loading || "lazy"}
      decoding={decoding}
      fetchPriority={priority ? "high" : undefined}
      referrerPolicy={referrerPolicy}
      className={className}
      style={style}
      onError={handleError}
      onLoad={onLoad}
      {...rest}
    />
  );
}
