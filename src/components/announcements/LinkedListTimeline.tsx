"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronDownIcon, ChevronUpIcon, UserIcon, BellIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date | string;
  author: {
    name: string | null;
    image?: string | null;
    role?: string | null;
  };
}

interface LinkedListTimelineProps {
  announcements: AnnouncementItem[];
}

export default function LinkedListTimeline({ announcements }: LinkedListTimelineProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(announcements.length > 0 ? [announcements[0].id] : [])
  );
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(announcements.map((a) => a.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  if (announcements.length === 0) {
    return (
      <div className="relative max-w-xl mx-auto py-12 px-4">
        {/* Linked list empty state */}
        <div className="flex flex-col items-center">
          {/* Head Node */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest text-purple-300 uppercase bg-purple-950/80 border border-purple-500/40 px-2.5 py-0.5">
              HEAD
            </span>
          </div>

          <div className="h-7 w-7 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white" />

          {/* Vertical Pointer Track */}
          <div className="relative w-[2px] h-20 bg-purple-500/40 my-2 flex items-center justify-center">
            <div className="absolute top-1/2 -translate-y-1/2 text-purple-300 text-[10px]">
              ▼
            </div>
          </div>

          {/* NULL Node */}
          <div className="px-3.5 py-1 bg-black/80 border border-white/20 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            NULL
          </div>

          <div className="mt-8 text-center bg-black/80 border border-white/15 p-8 max-w-md w-full backdrop-blur-md">
            <BellIcon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No announcements yet</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Check back soon for academic circulars, contest alerts, and official updates from TASC.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {announcements.length} Linked {announcements.length === 1 ? "Node" : "Nodes"} in History
          </span>
        </div>
        <div className="flex items-center gap-2">
          
        </div>
      </div>

      {/* Main Linked List Timeline Layout */}
      <div className="relative pl-12 sm:pl-16">
        
        {/* Continuous Side Pointer Track (Dual-Layer Precision Line) */}
        <div className="absolute left-[19px] sm:left-[27px] top-6 bottom-8 w-[2px] bg-purple-500/40">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-400 via-purple-500/50 to-purple-800/20" />
        </div>

        <div className="space-y-6 relative">
          {announcements.map((item, index) => {
            const isHead = index === 0;
            const isTail = index === announcements.length - 1;
            const isExpanded = expandedIds.has(item.id);
            const isHovered = activeHoverId === item.id;
            const nodeIndexStr = `NODE_${String(index + 1).padStart(2, "0")}`;
            const nextNodeStr = isTail ? "NULL" : `NODE_${String(index + 2).padStart(2, "0")}`;
            const dateObj = new Date(item.createdAt);

            return (
              <div
                key={item.id}
                className="relative group transition-transform duration-200"
                onMouseEnter={() => setActiveHoverId(item.id)}
                onMouseLeave={() => setActiveHoverId(null)}
              >
                {/* Horizontal Branch Connector Line: From Vertical Line into Card */}
                <div
                  className={`absolute -left-7 sm:-left-9 top-6 w-7 sm:w-9 h-[2px] transition-all duration-200 ${
                    isExpanded || isHovered
                      ? "bg-purple-400 scale-x-105 origin-left"
                      : "bg-purple-500/40 group-hover:bg-purple-400"
                  }`}
                />

                {/* Timeline Circular Node sitting at intersection */}
                <div
                  className={`absolute -left-[37px] sm:-left-[45px] top-3.5 z-20 flex items-center justify-center transition-all duration-200 ${
                    isHovered || isExpanded ? "scale-110" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    aria-label={`Toggle announcement: ${item.title}`}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                      isHead
                        ? "bg-purple-600 text-white border-2 border-white"
                        : isExpanded || isHovered
                        ? "bg-purple-950 text-purple-200 border-2 border-purple-400"
                        : "bg-black text-slate-300 border border-white/30"
                    }`}
                  >
                    {isHead ? (
                      <SparklesIcon className="h-3.5 w-3.5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>
                </div>

                {/* Announcement Card Node with Smooth Hover & Expansion Transitions */}
                <div
                  className={`border backdrop-blur-md transition-all duration-200 ${
                    isExpanded
                      ? "bg-black/85 border-purple-500/50"
                      : isHovered
                      ? "bg-black/80 border-white/40 -translate-y-0.5"
                      : "bg-black/75 border-white/20 hover:border-white/30"
                  }`}
                >
                  {/* Card Header (Clickable Trigger) */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    aria-expanded={isExpanded}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Meta Tags / DSA pointer indicator */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                        {isHead && (
                          <span className="font-bold tracking-widest text-white bg-purple-600 px-2 py-0.5 uppercase">
                            HEAD
                          </span>
                        )}
                        <span className="font-bold tracking-wider text-purple-300 uppercase bg-purple-950/80 border border-purple-500/30 px-2 py-0.5">
                          {nodeIndexStr}
                        </span>
                        <span className="text-slate-300">
                          {format(dateObj, "MMM d, yyyy · h:mm a")}
                        </span>
                        <span className="text-slate-400 hidden sm:inline">
                          ({formatDistanceToNow(dateObj, { addSuffix: true })})
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
                        {item.title}
                      </h2>
                    </div>

                    {/* Expand/Collapse Chevron with Rotation Transition */}
                    <div className="shrink-0 p-1.5 border border-white/10 text-slate-300 group-hover:text-white group-hover:border-white/30 transition-colors bg-white/5 mt-1">
                      <div className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}>
                        <ChevronDownIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </button>

                  {/* Expandable Message Body with Smooth Grid Transition */}
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-white/10 space-y-4">
                        
                        {/* Content text */}
                        <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                          {item.content}
                        </div>

                        {/* Node Metadata Footer */}
                        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                          {/* Author info */}
                          <div className="flex items-center gap-2">
                            {item.author.image ? (
                              <Image
                                src={item.author.image}
                                alt={item.author.name || "Author"}
                                width={24}
                                height={24}
                                className="h-6 w-6 rounded-full object-cover border border-white/20"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-[10px] font-bold text-purple-200">
                                <UserIcon className="h-3 w-3" />
                              </div>
                            )}
                            <span className="font-semibold text-slate-300">
                              Posted by {item.author.name || "TASC Technical Team"}
                            </span>
                          </div>

                          {/* DSA Linked List Pointer Info */}
                          <div className="flex items-center gap-2 text-[11px] font-mono text-purple-300/80 bg-purple-950/40 border border-purple-500/20 px-2.5 py-1 self-start sm:self-auto">
                            <span>POINTER:</span>
                            <span className="font-bold text-white">{nodeIndexStr}</span>
                            <span>→</span>
                            <span className={isTail ? "text-amber-400 font-bold" : "text-white font-bold"}>
                              {nextNodeStr}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Terminal NULL Node at the end of the Linked List with pointer arrow */}
        <div className="pt-10 flex items-center gap-3 relative -left-[27px] sm:-left-[35px]">
          <div className="h-4 w-4 rounded-full bg-slate-800 border border-slate-500 flex items-center justify-center text-[8px] text-slate-300">
            ▼
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/80 border border-white/20 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            <span>[ NULL ]</span>
            <span className="text-[9px] text-slate-500 font-normal">END OF LINKED LIST</span>
          </div>
        </div>

      </div>
    </div>
  );
}
