"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ClockIcon,
  LockIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  SearchIcon,
  UsersIcon,
  CheckCircle2Icon,
  XCircleIcon,
  SparklesIcon,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export interface FormItem {
  id: string;
  title: string;
  description: string | null;
  startTime: Date | string | null;
  endTime: Date | string | null;
  requireAiml: boolean;
  published: boolean;
  createdAt: Date | string;
  responsesCount: number;
}

interface TerminalAccordionStreamProps {
  forms: FormItem[];
  user: {
    id: string;
    isAiml: boolean;
    role: string;
  } | null;
}

type FilterTab = "all" | "active" | "aiml" | "closed";

export default function TerminalAccordionStream({ forms, user }: TerminalAccordionStreamProps) {
  const now = new Date();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Categorize and filter forms
  const categorizedForms = useMemo(() => {
    return forms.map((form) => {
      const isNotStarted = form.startTime && now < new Date(form.startTime);
      const isEnded = form.endTime && now > new Date(form.endTime);
      const isActive = !isNotStarted && !isEnded;
      return {
        ...form,
        isNotStarted,
        isEnded,
        isActive,
      };
    });
  }, [forms, now]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: categorizedForms.length,
      active: categorizedForms.filter((f) => f.isActive).length,
      aiml: categorizedForms.filter((f) => f.requireAiml).length,
      closed: categorizedForms.filter((f) => f.isEnded).length,
    };
  }, [categorizedForms]);

  // Filtered & searched results
  const filteredForms = useMemo(() => {
    return categorizedForms
      .filter((form) => {
        // Tab filter
        if (selectedFilter === "active" && !form.isActive) return false;
        if (selectedFilter === "aiml" && !form.requireAiml) return false;
        if (selectedFilter === "closed" && !form.isEnded) return false;

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const titleMatch = form.title.toLowerCase().includes(q);
          const descMatch = form.description?.toLowerCase().includes(q);
          return titleMatch || descMatch;
        }

        return true;
      })
      .sort((a, b) => {
        // Active first, then starting soon, then ended
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        if (a.isNotStarted && b.isEnded) return -1;
        if (a.isEnded && b.isNotStarted) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [categorizedForms, selectedFilter, searchQuery]);

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
    setExpandedIds(new Set(filteredForms.map((f) => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-valley">
      
      {/* Interactive Toolbar: Search Bar & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms & voting polls..."
              className="w-full pl-10 pr-4 py-2.5 rounded-none bg-black/60 border border-white/15 focus:border-purple-400 text-white placeholder:text-slate-500 text-sm outline-none transition-all font-valley backdrop-blur-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded-none cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Expand Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-none bg-black/50 border border-white/15 hover:border-white/30 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-none bg-black/50 border border-white/15 hover:border-white/30 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-1 border-b border-white/10 pb-3">
          {(
            [
              { key: "all", label: "All Forms", count: counts.all },
              { key: "active", label: "Active", count: counts.active },
              { key: "aiml", label: "AIML Only", count: counts.aiml },
              { key: "closed", label: "Closed", count: counts.closed },
            ] as const
          ).map((tab) => {
            const isSelected = selectedFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedFilter(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                    : "bg-black/50 border border-white/15 text-slate-400 hover:text-white hover:border-white/30"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-none ${
                    isSelected ? "bg-white/20 text-white" : "bg-white/10 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Forms List Stream */}
      {filteredForms.length === 0 ? (
        <div className="py-16 text-center rounded-none border border-white/10 bg-black/50 backdrop-blur-md p-8 space-y-3">
          <SparklesIcon className="h-7 w-7 text-purple-400 mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white font-valley">No matching forms found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No forms match your search "${searchQuery}". Try different keywords.`
              : "No forms currently match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredForms.map((form) => {
            const isExpanded = expandedIds.has(form.id);
            const aimlRestricted = form.requireAiml && (!user || !user.isAiml);

            // Compact Closed Form Strip
            if (form.isEnded) {
              return (
                <div
                  key={form.id}
                  className="group rounded-none border border-white/10 bg-black/40 backdrop-blur-md transition-all duration-200 hover:border-white/25"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(form.id)}
                    className="w-full px-5 py-3.5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 bg-white/10 border border-white/10 px-2 py-0.5 rounded-none uppercase tracking-wider shrink-0">
                        Closed
                      </span>
                      <span className="font-valley font-medium text-slate-300 truncate text-sm sm:text-base group-hover:text-white transition-colors">
                        {form.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400">
                      {form.endTime && (
                        <span>Ended {format(new Date(form.endTime), "MMM d, yyyy")}</span>
                      )}
                      <span>({form.responsesCount} responses)</span>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded details for closed form */}
                  {isExpanded && form.description && (
                    <div className="px-5 pb-4 pt-1 border-t border-white/10 text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {form.description}
                    </div>
                  )}
                </div>
              );
            }

            // Active / Upcoming Form Strip
            return (
              <div
                key={form.id}
                className={`rounded-none border transition-all duration-200 backdrop-blur-md overflow-hidden ${
                  isExpanded
                    ? "bg-black/85 border-purple-500/50 shadow-lg shadow-purple-950/20"
                    : "bg-black/60 border-white/15 hover:border-white/35 hover:bg-black/75"
                }`}
              >
                {/* Header Trigger */}
                <button
                  type="button"
                  onClick={() => toggleExpand(form.id)}
                  aria-expanded={isExpanded}
                  className="w-full p-4 sm:p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  {/* Left Side: Status / Badge / Title */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Active Pulse Dot */}
                    <div className="shrink-0 flex items-center">
                      {form.isActive ? (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-none h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-none bg-amber-400" />
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {form.requireAiml && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-300 bg-purple-950/70 border border-purple-500/40 px-2.5 py-0.5 rounded-none uppercase tracking-wider">
                          <LockIcon className="h-3 w-3" />
                          AIML Only
                        </span>
                      )}
                      {form.isActive && (
                        <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-none uppercase tracking-wider">
                          Active
                        </span>
                      )}
                      {form.isNotStarted && (
                        <span className="text-[11px] font-bold text-amber-300 bg-amber-950/50 border border-amber-500/30 px-2.5 py-0.5 rounded-none uppercase tracking-wider">
                          Opens Soon
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-valley font-bold text-base sm:text-lg text-white truncate group-hover:text-purple-200 transition-colors">
                      {form.title}
                    </h2>
                  </div>

                  {/* Right Side: Timeline & Chevron */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-xs text-purple-200 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-none">
                      <ClockIcon className="h-3.5 w-3.5 text-purple-400" />
                      <span>
                        {form.isNotStarted && form.startTime
                          ? `Opens ${formatDistanceToNow(new Date(form.startTime), { addSuffix: true })}`
                          : form.endTime
                          ? `Closes ${formatDistanceToNow(new Date(form.endTime), { addSuffix: true })}`
                          : "Ongoing"}
                      </span>
                    </div>

                    <div
                      className={`p-1.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-purple-300" : ""
                      }`}
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </div>
                  </div>
                </button>

                {/* Smooth Expandable Body */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-2 border-t border-white/10 space-y-4">
                      {/* Description */}
                      {form.description ? (
                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                          {form.description}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No additional description provided.</p>
                      )}

                      {/* Footer & Action Buttons */}
                      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <UsersIcon className="h-3.5 w-3.5 text-purple-400" />
                          <span>{form.responsesCount} Submissions Recorded</span>
                        </div>

                        <div>
                          {!user ? (
                            <Link
                              href="/auth/signin"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-md hover:shadow-purple-600/30 cursor-pointer"
                            >
                              <span>Sign In to Participate</span>
                              <ArrowRightIcon className="h-3.5 w-3.5" />
                            </Link>
                          ) : aimlRestricted ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none border border-red-500/30 bg-red-950/40 text-red-300 text-xs font-semibold">
                              <XCircleIcon className="h-3.5 w-3.5" />
                              <span>Restricted to AIML Department</span>
                            </div>
                          ) : form.isNotStarted ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none border border-amber-500/30 bg-amber-950/40 text-amber-300 text-xs font-semibold">
                              <ClockIcon className="h-3.5 w-3.5" />
                              <span>Form Not Open Yet</span>
                            </div>
                          ) : (
                            <Link
                              href={`/forms/${form.id}`}
                              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-none bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-md hover:shadow-purple-600/30 hover:scale-[1.02] cursor-pointer"
                            >
                              <span>Open Form</span>
                              <ArrowRightIcon className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
