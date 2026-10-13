"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  ImageIcon,
  SparklesIcon,
  ExternalLinkIcon,
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
  XIcon,
  ChevronLeftIcon,
  SearchIcon,
  LayersIcon,
} from "lucide-react";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import ClientPortal from "@/components/ui/ClientPortal";

export type NoticeType = "ALL" | "ANNOUNCEMENT" | "EVENT" | "FORM" | "GALLERY";

export interface NoticeItem {
  id: string;
  type: "ANNOUNCEMENT" | "EVENT" | "FORM" | "GALLERY";
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  date: Date | string;
  badge: string;
  badgeVariant?: "gold" | "primary" | "muted";
  link?: string;
  linkText?: string;
  author?: {
    name?: string | null;
    image?: string | null;
    role?: string | null;
  };
  eventMeta?: {
    date: Date | string;
    venue?: string | null;
    image?: string | null;
    type?: string;
    isLive?: boolean;
    isCompleted?: boolean;
    photos?: string[];
  };
  formMeta?: {
    endTime?: Date | string | null;
  };
}

interface NoticeBoardClientProps {
  initialNotices: NoticeItem[];
}

export default function NoticeBoardClient({ initialNotices }: NoticeBoardClientProps) {
  const [selectedTab, setSelectedTab] = useState<NoticeType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Lightbox State for Photo Galleries & Multi-image Bulletins
  const [lightboxState, setLightboxState] = useState<{
    photos: string[];
    title: string;
    currentIndex: number;
  } | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const openLightbox = useCallback((photos: string[], index: number = 0, title: string = "Photo Preview") => {
    const validPhotos = photos.filter(
      (p) => typeof p === "string" && (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("/"))
    );
    if (validPhotos.length === 0) return;
    const safeIndex = Math.max(0, Math.min(index, validPhotos.length - 1));
    setIsImageLoading(true);
    setLightboxState({
      photos: validPhotos,
      title,
      currentIndex: safeIndex,
    });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxState(null);
    setIsImageLoading(false);
  }, []);

  const nextPhoto = useCallback(() => {
    setLightboxState((prev) => {
      if (!prev || prev.photos.length <= 1) return prev;
      const nextIdx = (prev.currentIndex + 1) % prev.photos.length;
      return { ...prev, currentIndex: nextIdx };
    });
    setIsImageLoading(true);
  }, []);

  const prevPhoto = useCallback(() => {
    setLightboxState((prev) => {
      if (!prev || prev.photos.length <= 1) return prev;
      const prevIdx = (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length;
      return { ...prev, currentIndex: prevIdx };
    });
    setIsImageLoading(true);
  }, []);

  const goToPhoto = useCallback((index: number) => {
    setLightboxState((prev) => {
      if (!prev || index < 0 || index >= prev.photos.length) return prev;
      return { ...prev, currentIndex: index };
    });
    setIsImageLoading(true);
  }, []);

  // Preload adjacent photos for seamless transitions
  useEffect(() => {
    if (!lightboxState || lightboxState.photos.length <= 1) return;
    const { photos, currentIndex } = lightboxState;
    const nextUrl = photos[(currentIndex + 1) % photos.length];
    const prevUrl = photos[(currentIndex - 1 + photos.length) % photos.length];
    if (nextUrl) {
      const img = new window.Image();
      img.src = nextUrl;
    }
    if (prevUrl) {
      const img = new window.Image();
      img.src = prevUrl;
    }
  }, [lightboxState]);

  // Lock body & Keyboard navigation
  useEffect(() => {
    if (!lightboxState) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxState, closeLightbox, nextPhoto, prevPhoto]);

  // Filter Notices
  const filteredNotices = useMemo(() => {
    return initialNotices.filter((item) => {
      // Category filter
      if (selectedTab !== "ALL" && item.type !== selectedTab) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesContent = (item.content || "").toLowerCase().includes(q);
        const matchesVenue = item.eventMeta?.venue?.toLowerCase().includes(q) || false;
        return matchesTitle || matchesContent || matchesVenue;
      }
      return true;
    });
  }, [initialNotices, selectedTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      ALL: initialNotices.length,
      ANNOUNCEMENT: initialNotices.filter((n) => n.type === "ANNOUNCEMENT").length,
      EVENT: initialNotices.filter((n) => n.type === "EVENT").length,
      FORM: initialNotices.filter((n) => n.type === "FORM").length,
      GALLERY: initialNotices.filter((n) => n.type === "GALLERY").length,
    };
  }, [initialNotices]);

  return (
    <div className="space-y-8">
      {/* Interactive Controls & Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bulletins, events, forms, or galleries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-brand/25 bg-card/70 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-brand-accent font-space-grotesk backdrop-blur-md shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-mono-tech"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 pt-1 border-b border-brand/20 pb-4">
          {[
            { key: "ALL", label: "All Updates", icon: LayersIcon },
            { key: "ANNOUNCEMENT", label: "Bulletins", icon: BellIcon },
            { key: "EVENT", label: "Events", icon: CalendarIcon },
            { key: "FORM", label: "Forms & Polls", icon: FileTextIcon },
            { key: "GALLERY", label: "Photo Galleries", icon: ImageIcon },
          ].map((tab) => {
            const count = counts[tab.key as NoticeType];
            const Icon = tab.icon;
            const isSelected = selectedTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as NoticeType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono-tech uppercase tracking-wider transition-all border ${
                  isSelected
                    ? "bg-brand/20 border-brand-accent text-brand-accent font-bold shadow-sm"
                    : "bg-background/60 border-brand/15 text-muted-foreground hover:text-foreground hover:border-brand/30"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] bg-brand/10 border border-brand/20 px-1.5 py-0.2 rounded font-bold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notice Feed Stream */}
      <div className="space-y-6">
        {filteredNotices.length === 0 ? (
          <div className="relative rounded-xl border border-brand/20 bg-card/60 backdrop-blur-md p-12 text-center shadow-lg space-y-3">
            <CircuitTrace corners={true} />
            <BellIcon className="w-8 h-8 text-muted-foreground mx-auto" />
            <h3 className="font-bold font-space-grotesk text-base text-foreground">No notices found</h3>
            <p className="text-xs text-muted-foreground font-space-grotesk">
              There are no updates matching your current search or category filter.
            </p>
          </div>
        ) : (
          filteredNotices.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl border border-brand/20 bg-card/85 backdrop-blur-xl p-6 sm:p-7 shadow-lg transition-all hover:border-brand-accent/40 space-y-4"
            >
              <CircuitTrace corners={true} />

              {/* Notice Top Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand/15 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <TechnicalLabel variant={item.badgeVariant || "primary"}>
                    {item.badge}
                  </TechnicalLabel>

                  {item.type === "EVENT" && item.eventMeta?.isLive && (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-red-500/40 bg-red-500/15 text-[10px] font-mono-tech uppercase font-bold text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      LIVE NOW
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono-tech text-muted-foreground">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold font-space-grotesk text-foreground leading-snug">
                  {item.title}
                </h2>

                {item.content && (
                  <p className="text-sm text-muted-foreground font-space-grotesk leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                )}
              </div>

              {/* Announcement / Notice Photo Attachment(s) */}
              {(() => {
                const photos = Array.isArray(item.imageUrls) && item.imageUrls.length > 0
                  ? item.imageUrls
                  : item.imageUrl
                  ? [item.imageUrl]
                  : [];
                if (photos.length === 0) return null;

                if (photos.length === 1) {
                  return (
                    <div
                      onClick={() => openLightbox(photos, 0, item.title)}
                      className="rounded-xl overflow-hidden border border-brand/25 bg-black/40 cursor-pointer group relative shadow-md hover:border-brand-accent/60 transition-all max-h-[480px]"
                    >
                      <img
                        src={photos[0]}
                        alt={item.title}
                        className="w-full h-full object-cover max-h-[480px] group-hover:scale-[1.015] transition-transform duration-500"
                      />
                      <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono-tech px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none">
                        <ImageIcon className="w-3.5 h-3.5 text-brand-accent" />
                        <span>Click to view full image</span>
                      </div>
                    </div>
                  );
                }

                if (photos.length === 2) {
                  return (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono-tech uppercase text-muted-foreground">
                        <span>Attached Photos</span>
                        <span className="text-brand-accent font-bold">2 Photos</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {photos.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => openLightbox(photos, idx, item.title)}
                            className="relative aspect-video rounded-xl overflow-hidden border border-brand/20 cursor-pointer group bg-black/40 shadow-sm hover:border-brand-accent/60 transition-all"
                          >
                            <img
                              src={url}
                              alt={`${item.title} - Photo ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono-tech text-white/90">
                              #{idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (photos.length === 3) {
                  return (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono-tech uppercase text-muted-foreground">
                        <span>Attached Photos</span>
                        <span className="text-brand-accent font-bold">3 Photos</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {photos.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => openLightbox(photos, idx, item.title)}
                            className="relative aspect-video rounded-xl overflow-hidden border border-brand/20 cursor-pointer group bg-black/40 shadow-sm hover:border-brand-accent/60 transition-all"
                          >
                            <img
                              src={url}
                              alt={`${item.title} - Photo ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono-tech text-white/90">
                              #{idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // 4 or more photos
                return (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono-tech uppercase text-muted-foreground">
                      <span>Attached Photos</span>
                      <span className="text-brand-accent font-bold">{photos.length} Photos</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {photos.slice(0, 4).map((url, idx) => (
                        <div
                          key={idx}
                          onClick={() => openLightbox(photos, idx, item.title)}
                          className="relative aspect-video rounded-lg overflow-hidden border border-brand/20 cursor-pointer group bg-black/40 shadow-sm hover:border-brand-accent/60 transition-all"
                        >
                          <img
                            src={url}
                            alt={`${item.title} - Photo ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {idx === 3 && photos.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 hover:bg-black/70 flex flex-col items-center justify-center text-white font-mono-tech font-bold text-sm transition-colors">
                              <span>+{photos.length - 4} MORE</span>
                              <span className="text-[10px] text-brand-accent font-normal mt-0.5">View all</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Event Alert Details */}
              {item.type === "EVENT" && item.eventMeta && (
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 p-3 rounded-lg border border-brand/15 bg-background/50 text-xs font-space-grotesk text-foreground">
                    <CalendarIcon className="w-4 h-4 text-brand-accent shrink-0" />
                    <span>
                      Date: {new Date(item.eventMeta.date).toLocaleDateString()}
                    </span>
                  </div>
                  {item.eventMeta.venue && (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg border border-brand/15 bg-background/50 text-xs font-space-grotesk text-foreground">
                      <MapPinIcon className="w-4 h-4 text-gold shrink-0" />
                      <span>Venue: {item.eventMeta.venue}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Event Photo Gallery Strip */}
              {item.type === "GALLERY" && item.eventMeta?.photos && item.eventMeta.photos.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono-tech uppercase text-muted-foreground">
                    <span>Photo Highlights</span>
                    <span className="text-gold font-bold">{item.eventMeta.photos.length} Captured Photos</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {item.eventMeta.photos.slice(0, 4).map((photoUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => openLightbox(item.eventMeta!.photos!, idx, item.title)}
                        className="relative aspect-video rounded-lg overflow-hidden border border-brand/20 cursor-pointer group bg-black/40 shadow-sm hover:border-brand-accent/60 transition-all"
                      >
                        <img
                          src={photoUrl}
                          alt={`${item.title} - Highlight ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {idx === 3 && item.eventMeta!.photos!.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 hover:bg-black/70 flex flex-col items-center justify-center text-white font-mono-tech font-bold text-sm transition-colors">
                            <span>+{item.eventMeta!.photos!.length - 4} MORE</span>
                            <span className="text-[10px] text-gold font-normal mt-0.5">View all photos</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Author / Footer / Action Links */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-brand/15">
                {item.author?.name ? (
                  <div className="flex items-center gap-2.5">
                    {item.author.image ? (
                      <img
                        src={item.author.image}
                        alt={item.author.name}
                        className="w-7 h-7 rounded-full border border-brand/30 object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-[10px] font-bold text-brand-accent">
                        {item.author.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold font-space-grotesk text-foreground leading-none">
                        {item.author.name}
                      </p>
                      <p className="text-[10px] font-mono-tech text-muted-foreground uppercase mt-0.5">
                        {item.author.role || "TASC COMMITTEE"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] font-mono-tech text-muted-foreground uppercase">
                    [ OFFICIAL_NOTICE_DISPATCH ]
                  </div>
                )}

                {item.link && (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-background/60 px-4 py-2 text-xs font-bold font-space-grotesk text-brand-accent hover:bg-brand/15 transition-all shadow-sm"
                  >
                    <span>{item.linkText || "View Details"}</span>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox Modal for Photo Gallery & Multi-image Bulletins */}
      {lightboxState && (
        <ClientPortal>
          <div
            role="dialog"
            aria-modal="true"
            onClick={closeLightbox}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-3 sm:p-5 bg-black/95 backdrop-blur-md animate-fadeIn select-none"
          >
            {/* Top Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl flex items-center justify-between py-2 text-white z-20 shrink-0"
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <span className="font-mono-tech text-xs text-brand-accent uppercase tracking-wider truncate max-w-md hidden sm:inline">
                  {lightboxState.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-brand/20 border border-brand/40 font-mono-tech text-xs text-brand-accent shrink-0">
                  PHOTO {lightboxState.currentIndex + 1} OF {lightboxState.photos.length}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={lightboxState.photos[lightboxState.currentIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open original image"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                  title="Open full image in new tab"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                </a>
                <button
                  onClick={closeLightbox}
                  aria-label="Close photo preview"
                  className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Photo Viewport */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl flex-1 flex items-center justify-center min-h-0 my-2"
            >
              {/* Prev Button */}
              {lightboxState.photos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                  aria-label="Previous photo"
                  className="absolute left-1 sm:left-3 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-brand/80 border border-white/10 hover:border-brand-accent text-white shadow-xl backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Photo Container */}
              <div className="relative w-full h-[60vh] sm:h-[72vh] flex items-center justify-center">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-accent border-t-transparent animate-spin" />
                  </div>
                )}
                <img
                  key={lightboxState.photos[lightboxState.currentIndex]}
                  src={lightboxState.photos[lightboxState.currentIndex]}
                  alt={`${lightboxState.title} - Photo ${lightboxState.currentIndex + 1}`}
                  onLoad={() => setIsImageLoading(false)}
                  className={`max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-opacity duration-200 select-none ${
                    isImageLoading ? "opacity-0" : "opacity-100"
                  }`}
                />
              </div>

              {/* Next Button */}
              {lightboxState.photos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                  aria-label="Next photo"
                  className="absolute right-1 sm:right-3 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-brand/80 border border-white/10 hover:border-brand-accent text-white shadow-xl backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
            </div>

            {/* Bottom Filmstrip Thumbnails */}
            {lightboxState.photos.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 no-scrollbar z-20 shrink-0"
              >
                {lightboxState.photos.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToPhoto(idx)}
                    className={`relative shrink-0 w-14 h-10 sm:w-16 sm:h-12 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === lightboxState.currentIndex
                        ? "border-brand-accent scale-105 shadow-md shadow-brand/40"
                        : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
