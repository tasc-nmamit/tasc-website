"use client";

import React, { useState, useEffect } from "react";
import Image, { type ImageProps } from "next/image";
import { getAppCheckToken } from "@/lib/firebase";

// Module-level global caches (persists across re-renders and client route transitions)
const blobCache = new Map<string, string>();
const inFlightCache = new Map<string, Promise<string>>();

const TRANSPARENT_PIXEL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";

/**
 * Checks if a given URL is hosted on Firebase Cloud Storage
 */
export function isFirebaseStorageUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;
  return (
    url.includes("firebasestorage.googleapis.com") ||
    url.includes(".appspot.com") ||
    url.includes("storage.googleapis.com")
  );
}

/**
 * Fetches an image from Firebase Storage attaching the X-Firebase-AppCheck header,
 * converts it into a local object URL (blob:...), and caches it in memory.
 */
export async function fetchStorageBlobUrl(url: string): Promise<string> {
  const cached = blobCache.get(url);
  if (cached) return cached;

  const inFlight = inFlightCache.get(url);
  if (inFlight) return inFlight;

  const fetchPromise = (async () => {
    try {
      const token = await getAppCheckToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["X-Firebase-AppCheck"] = token;
      }
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`Storage fetch failed: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      blobCache.set(url, blobUrl);
      return blobUrl;
    } catch (err) {
      console.warn(`[AppCheckImage] Error fetching ${url}:`, err);
      // Fallback to original url so browser can attempt standard load or trigger onError
      return url;
    } finally {
      inFlightCache.delete(url);
    }
  })();

  inFlightCache.set(url, fetchPromise);
  return fetchPromise;
}

export interface AppCheckImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackSrc?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
  quality?: number;
}

export default function AppCheckImage({
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
  onError,
  onLoad,
  ...rest
}: AppCheckImageProps) {
  const rawSrc = src || fallbackSrc || "";
  const isFirebase = isFirebaseStorageUrl(rawSrc);

  // Initialize from cache if already loaded in browser memory
  const initialSrc = isFirebase
    ? blobCache.get(rawSrc) || TRANSPARENT_PIXEL
    : rawSrc || TRANSPARENT_PIXEL;

  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
  const [isLoading, setIsLoading] = useState<boolean>(
    isFirebase && !blobCache.has(rawSrc)
  );

  useEffect(() => {
    if (!rawSrc) return;

    if (!isFirebase) {
      setCurrentSrc(rawSrc);
      setIsLoading(false);
      return;
    }

    if (blobCache.has(rawSrc)) {
      setCurrentSrc(blobCache.get(rawSrc)!);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchStorageBlobUrl(rawSrc).then((resolvedUrl) => {
      if (isMounted) {
        setCurrentSrc(resolvedUrl);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [rawSrc, isFirebase]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
    }
    onError?.(e);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentSrc !== TRANSPARENT_PIXEL) {
      setIsLoading(false);
    }
    onLoad?.(e);
  };

  // If using Next.js Image layout features (fill or explicit width & height)
  if (fill || (width && height)) {
    return (
      <Image
        src={currentSrc}
        alt={alt || ""}
        fill={fill}
        width={fill ? undefined : Number(width)}
        height={fill ? undefined : Number(height)}
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        quality={quality}
        className={`${className} ${isLoading && isFirebase ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        style={style}
        onError={handleError}
        onLoad={handleLoad}
      />
    );
  }

  // Fluid / responsive standard image rendering (like standard HTML <img>)
  return (
    <img
      src={currentSrc}
      alt={alt || ""}
      width={width}
      height={height}
      className={`${className} ${isLoading && isFirebase ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      {...rest}
    />
  );
}
