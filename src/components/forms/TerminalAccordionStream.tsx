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

  const isAimlUser = !!user?.isAiml || user?.role === "ADMIN" || user?.role === "OWNER";

  // Filter out AIML-exclusive forms if user does not belong to AIML branch
  const accessibleForms = useMemo(() => {
    if (isAimlUser) return forms;
    return forms.filter((f) => !f.requireAiml);
  }, [forms, isAimlUser]);

  // Categorize and filter forms
  const categorizedForms = useMemo(() => {
    return accessibleForms.map((form) => {
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
  }, [accessibleForms, now]);

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
      <div className="space-y-4 font-space-grotesk">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms & voting polls..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card/80 border border-brand/25 focus:border-brand-accent text-foreground placeholder:text-muted-foreground text-sm outline-none transition-all font-space-grotesk backdrop-blur-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded cursor-pointer font-mono-tech"
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
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg bg-background/60 border border-brand/20 hover:border-brand/40 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg bg-background/60 border border-brand/20 hover:border-brand/40 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-1 border-b border-brand/20 pb-3">
          {(
            [
              { key: "all" as const, label: "All Forms", count: counts.all },
              { key: "active" as const, label: "Active", count: counts.active },
              ...(isAimlUser
                ? [{ key: "aiml" as const, label: "AIML Only", count: counts.aiml }]
                : []),
              { key: "closed" as const, label: "Closed", count: counts.closed },
            ]
          ).map((tab) => {
            const isSelected = selectedFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedFilter(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono-tech uppercase tracking-wider transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-brand/20 border-brand-accent text-brand-accent font-bold shadow-sm"
                    : "bg-background/60 border-brand/15 text-muted-foreground hover:text-foreground hover:border-brand/30"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    isSelected ? "bg-brand/20 text-brand-accent" : "bg-brand/10 text-muted-foreground"
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
        <div className="py-16 text-center rounded-xl border border-brand/20 bg-card/60 backdrop-blur-md p-8 space-y-3">
          <SparklesIcon className="h-7 w-7 text-brand-accent mx-auto opacity-70" />
          <h3 className="text-base font-bold text-foreground font-space-grotesk">No matching forms found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto font-space-grotesk">
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
                  className="group rounded-xl border border-brand/15 bg-card/60 backdrop-blur-md transition-all duration-200 hover:border-brand/30"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(form.id)}
                    className="w-full px-5 py-3.5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-bold font-mono-tech text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                        Closed
                      </span>
                      <span className="font-space-grotesk font-medium text-foreground truncate text-sm sm:text-base group-hover:text-brand-accent transition-colors">
                        {form.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground font-mono-tech">
                      {form.endTime && (
                        <span>Ended {format(new Date(form.endTime), "MMM d, yyyy")}</span>
                      )}
                      <span>({form.responsesCount} responses)</span>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-200 text-muted-foreground ${
                          isExpanded ? "rotate-180 text-foreground" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded details for closed form */}
                  {isExpanded && form.description && (
                    <div className="px-5 pb-4 pt-1 border-t border-brand/15 text-xs text-muted-foreground font-space-grotesk leading-relaxed whitespace-pre-wrap">
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
                className={`rounded-xl border transition-all duration-200 backdrop-blur-xl overflow-hidden shadow-sm ${
                  isExpanded
                    ? "bg-card border-brand-accent/50 shadow-md"
                    : "bg-card/80 border-brand/20 hover:border-brand/40"
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
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {form.requireAiml && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono-tech font-bold text-brand-accent bg-brand/15 border border-brand/30 px-2.5 py-0.5 rounded uppercase tracking-wider">
                          <LockIcon className="h-3 w-3" />
                          AIML Only
                        </span>
                      )}
                      {form.isActive && (
                        <span className="text-[11px] font-mono-tech font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded uppercase tracking-wider">
                          Active
                        </span>
                      )}
                      {form.isNotStarted && (
                        <span className="text-[11px] font-mono-tech font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded uppercase tracking-wider">
                          Opens Soon
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-space-grotesk font-bold text-base sm:text-lg text-foreground truncate group-hover:text-brand-accent transition-colors">
                      {form.title}
                    </h2>
                  </div>

                  {/* Right Side: Timeline & Chevron */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs">
                    <div className="flex items-center gap-1.5 text-xs text-brand-accent bg-brand/10 border border-brand/20 px-3 py-1 rounded-lg font-mono-tech">
                      <ClockIcon className="h-3.5 w-3.5 text-brand-accent" />
                      <span>
                        {form.isNotStarted && form.startTime
                          ? `Opens ${formatDistanceToNow(new Date(form.startTime), { addSuffix: true })}`
                          : form.endTime
                          ? `Closes ${formatDistanceToNow(new Date(form.endTime), { addSuffix: true })}`
                          : "Ongoing"}
                      </span>
                    </div>

                    <div
                      className={`p-1.5 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-brand-accent" : ""
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
                    <div className="px-5 pb-5 pt-2 border-t border-brand/15 space-y-4 font-space-grotesk">
                      {/* Description */}
                      {form.description ? (
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {form.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No additional description provided.</p>
                      )}

                      {/* Footer & Action Buttons */}
                      <div className="pt-3 border-t border-brand/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono-tech">
                          <UsersIcon className="h-3.5 w-3.5 text-brand-accent" />
                          <span>{form.responsesCount} Submissions Recorded</span>
                        </div>

                        <div>
                          {!user ? (
                            <Link
                              href="/auth/signin"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand hover:bg-brand/90 text-white font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-md cursor-pointer font-space-grotesk"
                            >
                              <span>Sign In to Participate</span>
                              <ArrowRightIcon className="h-3.5 w-3.5" />
                            </Link>
                          ) : aimlRestricted ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold font-mono-tech">
                              <XCircleIcon className="h-3.5 w-3.5" />
                              <span>Restricted to AIML Branch Students</span>
                            </div>
                          ) : form.isNotStarted ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold font-mono-tech">
                              <ClockIcon className="h-3.5 w-3.5" />
                              <span>Form Not Yet Open</span>
                            </div>
                          ) : (
                            <Link
                              href={`/forms/${form.id}`}
                              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand hover:bg-brand/90 text-white font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-md hover:scale-[1.02] cursor-pointer font-space-grotesk"
                            >
                              <span>Fill Response</span>
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
