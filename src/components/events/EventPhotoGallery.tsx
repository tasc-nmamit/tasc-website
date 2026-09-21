"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, X, Maximize2, ExternalLink } from "lucide-react";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";

interface EventPhotoGalleryProps {
  photos: string[];
  eventTitle: string;
}

export default function EventPhotoGallery({ photos, eventTitle }: EventPhotoGalleryProps) {
  const validPhotos = React.useMemo(() => {
    if (!Array.isArray(photos)) return [];
    return photos.filter(
      (p) => typeof p === "string" && (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("/"))
    );
  }, [photos]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = useCallback(() => {
    if (lightboxIndex === null || validPhotos.length === 0) return;
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % validPhotos.length : null));
  }, [lightboxIndex, validPhotos.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null || validPhotos.length === 0) return;
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + validPhotos.length) % validPhotos.length : null));
  }, [lightboxIndex, validPhotos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  if (validPhotos.length === 0) return null;

  return (
    <section className="relative rounded-xl border border-brand/30 bg-card/80 backdrop-blur-xl p-6 md:p-8 shadow-xl">
      <CircuitTrace corners={true} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10 border-b border-brand/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand/15 text-brand-accent border border-brand/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono-tech uppercase tracking-widest text-brand-accent">
              EVENT MEDIA ARCHIVE
            </span>
            <h2 className="text-2xl font-bold font-space-grotesk text-foreground">
              Event Gallery
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded bg-brand/10 border border-brand/20 font-mono-tech text-xs text-brand-accent">
            {validPhotos.length} {validPhotos.length === 1 ? "SNAPSHOT" : "SNAPSHOTS"}
          </span>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 relative z-10">
        {validPhotos.map((photoUrl, index) => (
          <div
            key={index}
            onClick={() => openLightbox(index)}
            className="group relative aspect-4/3 rounded-lg overflow-hidden border border-brand/20 bg-background/50 cursor-pointer transition-all duration-300 hover:border-brand-accent/70 hover:shadow-lg hover:shadow-brand/20 hover:scale-[1.02]"
          >
            <Image
              src={photoUrl}
              alt={`${eventTitle} - Photo ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="p-2 rounded-full bg-brand/80 text-white shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>

            {/* Photo index badge */}
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-mono-tech text-white/80 opacity-70 group-hover:opacity-100 transition-opacity">
              #{index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 md:p-6 bg-black/95 backdrop-blur-md animate-fadeIn"
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl flex items-center justify-between py-2 text-white z-20"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono-tech text-xs text-brand-accent uppercase tracking-wider hidden sm:inline">
                {eventTitle}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-brand/30 border border-brand/40 font-mono-tech text-xs text-white">
                {lightboxIndex + 1} / {validPhotos.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={validPhotos[lightboxIndex]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open original image"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={closeLightbox}
                aria-label="Close photo preview"
                className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo Viewport */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-2"
          >
            {/* Previous Button */}
            {validPhotos.length > 1 && (
              <button
                onClick={showPrev}
                aria-label="Previous photograph"
                className="absolute left-2 md:left-4 z-30 p-3 rounded-full bg-black/50 hover:bg-brand/80 border border-white/10 hover:border-brand-accent text-white shadow-xl backdrop-blur-xs transition-all hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Photo Container */}
            <div className="relative w-full h-[65vh] md:h-[72vh] flex items-center justify-center">
              <Image
                src={validPhotos[lightboxIndex]}
                alt={`${eventTitle} - Photo ${lightboxIndex + 1}`}
                fill
                className="object-contain select-none"
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>

            {/* Next Button */}
            {validPhotos.length > 1 && (
              <button
                onClick={showNext}
                aria-label="Next photograph"
                className="absolute right-2 md:right-4 z-30 p-3 rounded-full bg-black/50 hover:bg-brand/80 border border-white/10 hover:border-brand-accent text-white shadow-xl backdrop-blur-xs transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Filmstrip Thumbnails */}
          {validPhotos.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 no-scrollbar z-20"
            >
              {validPhotos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative shrink-0 w-14 h-10 md:w-16 md:h-12 rounded-md overflow-hidden border-2 transition-all ${
                    idx === lightboxIndex
                      ? "border-brand-accent scale-105 shadow-md shadow-brand/40"
                      : "border-white/20 opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
