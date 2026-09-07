"use client";

import { useState, useMemo } from "react";
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

export type NoticeType = "ALL" | "ANNOUNCEMENT" | "EVENT" | "FORM" | "GALLERY";

export interface NoticeItem {
  id: string;
  type: "ANNOUNCEMENT" | "EVENT" | "FORM" | "GALLERY";
  title: string;
  content?: string | null;
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

  // Lightbox State for Photo Galleries
  const [activeGalleryPhotos, setActiveGalleryPhotos] = useState<string[] | null>(null);
  const [galleryPhotoIndex, setGalleryPhotoIndex] = useState(0);

  const openLightbox = (photos: string[], index: number = 0) => {
    setActiveGalleryPhotos(photos);
    setGalleryPhotoIndex(index);
  };

  const closeLightbox = () => {
    setActiveGalleryPhotos(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeGalleryPhotos) return;
    setGalleryPhotoIndex((prev) => (prev + 1) % activeGalleryPhotos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeGalleryPhotos) return;
    setGalleryPhotoIndex((prev) => (prev - 1 + activeGalleryPhotos.length) % activeGalleryPhotos.length);
  };

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
                        onClick={() => openLightbox(item.eventMeta!.photos!, idx)}
                        className="relative aspect-video rounded-lg overflow-hidden border border-brand/20 cursor-pointer group bg-black/40 shadow-sm hover:border-brand-accent/60 transition-all"
                      >
                        <img
                          src={photoUrl}
                          alt="Event highlight"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {idx === 3 && item.eventMeta!.photos!.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-mono-tech font-bold text-sm">
                            +{item.eventMeta!.photos!.length - 4} MORE
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

      {/* Lightbox Modal for Photo Gallery */}
      {activeGalleryPhotos && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-red-400 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>

            {/* Photo Container */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-black">
              <img
                src={activeGalleryPhotos[galleryPhotoIndex]}
                alt="Highlight preview"
                className="w-full h-full object-contain"
              />

              {/* Prev / Next Controls */}
              {activeGalleryPhotos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all border border-white/20 cursor-pointer"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all border border-white/20 cursor-pointer"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Counter Footer */}
            <div className="mt-3 text-xs font-mono-tech text-slate-400">
              PHOTO {galleryPhotoIndex + 1} OF {activeGalleryPhotos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
