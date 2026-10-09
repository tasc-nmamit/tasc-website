"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2Icon,
  SearchIcon,
  PlusIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserMinusIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  ZapIcon,
  DownloadIcon,
  PhoneIcon,
  GraduationCapIcon,
  XIcon,
  CheckSquareIcon,
  CopyIcon,
  FilterIcon,
  AlertCircleIcon,
  ChevronDownIcon,
} from "lucide-react";
import ClientPortal from "@/components/ui/ClientPortal";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import { downloadCSV, downloadExcel } from "@/lib/export";

interface OnSpotMember {
  id: string;
  userId?: string;
  name: string;
  email: string;
  usn: string;
  phone: string;
  branch: string;
  year: string;
  responses: Record<string, any>;
}

interface RegistrationsClientProps {
  event: any;
  teams: any[];
  allUsers: any[];
}

export default function RegistrationsClient({
  event,
  teams: initialTeams,
  allUsers,
}: RegistrationsClientProps) {
  const router = useRouter();
  const [currentTeams, setCurrentTeams] = useState<any[]>(initialTeams);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT">("ALL");
  const [loading, setLoading] = useState(false);
  const [verifyingTeamId, setVerifyingTeamId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync state if props change (e.g. router.refresh)
  useEffect(() => {
    setCurrentTeams(initialTeams);
  }, [initialTeams]);

  // Modal State
  const [isOnSpotModalOpen, setIsOnSpotModalOpen] = useState(false);

  // On-Spot Registration Modal State
  const defaultFormat = event.type === "TEAM" ? "TEAM" : "SOLO";
  const [onSpotFormat, setOnSpotFormat] = useState<"SOLO" | "TEAM">(defaultFormat);
  const [onSpotTeamName, setOnSpotTeamName] = useState("");
  const [onSpotMarkPresent, setOnSpotMarkPresent] = useState(true);

  // On-Spot Leader / Primary Student State
  const [onSpotLeaderUser, setOnSpotLeaderUser] = useState<any | null>(null);
  const [onSpotLeaderSearch, setOnSpotLeaderSearch] = useState("");
  const [onSpotLeaderName, setOnSpotLeaderName] = useState("");
  const [onSpotLeaderEmail, setOnSpotLeaderEmail] = useState("");
  const [onSpotLeaderUsn, setOnSpotLeaderUsn] = useState("");
  const [onSpotLeaderPhone, setOnSpotLeaderPhone] = useState("");
  const [onSpotLeaderBranch, setOnSpotLeaderBranch] = useState("AIML");
  const [onSpotLeaderYear, setOnSpotLeaderYear] = useState("3");
  const [leaderResponses, setLeaderResponses] = useState<Record<string, any>>({});

  // On-Spot Teammates State
  const [onSpotMembers, setOnSpotMembers] = useState<OnSpotMember[]>([]);
  const [newMemberSearch, setNewMemberSearch] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberUsn, setNewMemberUsn] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberBranch, setNewMemberBranch] = useState("AIML");
  const [newMemberYear, setNewMemberYear] = useState("3");
  const [newMemberResponses, setNewMemberResponses] = useState<Record<string, any>>({});
  const [isAddingTeammateOpen, setIsAddingTeammateOpen] = useState(false);

  // Lock body scroll during modals
  useEffect(() => {
    if (isOnSpotModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOnSpotModalOpen]);

  // Set of registered user IDs across all teams
  const registeredUserIds = useMemo(() => {
    return new Set(currentTeams.flatMap((t) => (t.registrations || []).map((r: any) => r.userId)));
  }, [currentTeams]);

  // Filter available users for on-spot leader search
  const availableUsersForLeader = useMemo(() => {
    if (!onSpotLeaderSearch.trim()) return [];
    const term = onSpotLeaderSearch.toLowerCase();
    return allUsers
      .filter(
        (u) =>
          !registeredUserIds.has(u.id) &&
          ((u.name || "").toLowerCase().includes(term) ||
            (u.email || "").toLowerCase().includes(term) ||
            (u.displayName || "").toLowerCase().includes(term) ||
            (u.usn || "").toLowerCase().includes(term))
      )
      .slice(0, 8);
  }, [allUsers, registeredUserIds, onSpotLeaderSearch]);

  // Filter available users for on-spot teammate search
  const availableUsersForTeammate = useMemo(() => {
    if (!newMemberSearch.trim()) return [];
    const term = newMemberSearch.toLowerCase();
    const alreadySelectedIds = new Set([
      onSpotLeaderUser?.id,
      ...onSpotMembers.map((m) => m.userId).filter(Boolean),
    ]);

    return allUsers
      .filter(
        (u) =>
          !registeredUserIds.has(u.id) &&
          !alreadySelectedIds.has(u.id) &&
          ((u.name || "").toLowerCase().includes(term) ||
            (u.email || "").toLowerCase().includes(term) ||
            (u.displayName || "").toLowerCase().includes(term) ||
            (u.usn || "").toLowerCase().includes(term))
      )
      .slice(0, 8);
  }, [allUsers, registeredUserIds, onSpotLeaderUser, onSpotMembers, newMemberSearch]);

  // Teammate applicable custom fields (for team events, fields not restricted to leader only)
  const teammateCustomFields = useMemo(() => {
    if (!event.customFields) return [];
    return event.customFields.filter((cf: any) => {
      if (cf.fieldType === "DISPLAY_IMAGE") return false;
      if (cf.registrationMode === "SOLO") return false;
      if (cf.targetRole === "LEADER_ONLY") return false;
      return true;
    });
  }, [event.customFields]);

  // Leader / Team applicable custom fields
  const leaderAndTeamCustomFields = useMemo(() => {
    if (!event.customFields) return [];
    const isTeam = onSpotFormat === "TEAM" || event.type === "TEAM";
    return event.customFields.filter((cf: any) => {
      if (cf.fieldType === "DISPLAY_IMAGE") return false;
      if (!isTeam && cf.registrationMode === "TEAM") return false;
      if (isTeam && cf.registrationMode === "SOLO") return false;
      return true;
    });
  }, [event.customFields, onSpotFormat, event.type]);

  // Attendance stats
  const totalTeamsCount = currentTeams.length;
  const verifiedTeamsCount = currentTeams.filter((t) => t.attended).length;
  const pendingTeamsCount = totalTeamsCount - verifiedTeamsCount;
  const totalParticipantsCount = currentTeams.reduce((acc, t) => acc + (t.registrations?.length || 0), 0);
  const verifiedParticipantsCount = currentTeams.reduce((acc, t) => {
    if (t.attended) {
      return acc + (t.registrations?.length || 0);
    }
    return acc;
  }, 0);
  const attendanceRate = totalTeamsCount > 0 ? Math.round((verifiedTeamsCount / totalTeamsCount) * 100) : 0;

  // Filter teams by search term & attendance filter
  const filteredTeams = useMemo(() => {
    return currentTeams.filter((team) => {
      // 1. Status Filter
      if (statusFilter === "PRESENT" && !team.attended) return false;
      if (statusFilter === "ABSENT" && team.attended) return false;

      // 2. Search Term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();

      const matchesTeamName = (team.name || "").toLowerCase().includes(term);
      const matchesTeamCode = (team.teamCode || "").toLowerCase().includes(term);
      const matchesMember = (team.registrations || []).some(
        (r: any) =>
          (r.user?.name || "").toLowerCase().includes(term) ||
          (r.user?.displayName || "").toLowerCase().includes(term) ||
          (r.user?.email || "").toLowerCase().includes(term) ||
          (r.user?.usn || "").toLowerCase().includes(term) ||
          (r.user?.phone || "").toLowerCase().includes(term) ||
          (r.user?.branch || "").toLowerCase().includes(term)
      );

      return matchesTeamName || matchesTeamCode || matchesMember;
    });
  }, [currentTeams, searchTerm, statusFilter]);

  // Handle Mark Present / Verify Toggle
  const handleToggleAttendance = async (teamId: string, targetStatus?: boolean, userId?: string) => {
    const team = currentTeams.find((t) => t.id === teamId);
    if (!team) return;

    const newStatus = targetStatus !== undefined ? targetStatus : !team.attended;
    setVerifyingTeamId(teamId);

    // Optimistic UI update
    setCurrentTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        if (userId) {
          const updatedRegs = (t.registrations || []).map((r: any) => {
            if (r.userId !== userId) return r;
            const prevResp = r.customFieldResponses || {};
            return {
              ...r,
              customFieldResponses: {
                ...prevResp,
                verified: newStatus,
                verifiedAt: newStatus ? new Date().toISOString() : null,
              },
            };
          });
          const anyVerified = updatedRegs.some(
            (r: any) => r.customFieldResponses?.verified === true
          );
          return {
            ...t,
            attended: anyVerified,
            registrations: updatedRegs,
          };
        }
        return {
          ...t,
          attended: newStatus,
          registrations: (t.registrations || []).map((r: any) => ({
            ...r,
            customFieldResponses: {
              ...(r.customFieldResponses || {}),
              verified: newStatus,
              verifiedAt: newStatus ? new Date().toISOString() : null,
            },
          })),
        };
      })
    );

    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          attended: newStatus,
          userId,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    } catch (err: any) {
      alert("Failed to update attendance status: " + err.message);
      // Rollback on failure
      setCurrentTeams(initialTeams);
    } finally {
      setVerifyingTeamId(null);
    }
  };

  // Delete Entire Team / Participant Registration
  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this registration/team? All members will be removed.")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations?teamId=${teamId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Registration deleted successfully.");
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove Single Member
  const handleRemoveMember = async (userId: string, teamId: string) => {
    if (!confirm("Are you sure you want to remove this member from the team?")) return;

    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations?userId=${userId}&teamId=${teamId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Member removed.");
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Export roster
  const handleExportRoster = async (type: "CSV" | "EXCEL") => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/events/${event.id}/export`);
      if (!res.ok) throw new Error("Failed to export registrations");
      const { data, eventTitle } = await res.json();

      const sanitizedTitle = (eventTitle || "event").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${sanitizedTitle}_registrations_${new Date().toISOString().split("T")[0]}`;

      if (type === "CSV") {
        downloadCSV(data, filename);
      } else {
        downloadExcel(data, filename);
      }
    } catch (err: any) {
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Select user for Leader in On-Spot form
  const handleSelectLeaderUser = (u: any) => {
    setOnSpotLeaderUser(u);
    setOnSpotLeaderName(u.displayName || u.name || "");
    setOnSpotLeaderEmail(u.email || "");
    setOnSpotLeaderUsn(u.usn || "");
    setOnSpotLeaderPhone(u.phone || "");
    setOnSpotLeaderBranch(u.branch || "AIML");
    setOnSpotLeaderYear(u.year ? String(u.year) : "3");
    setOnSpotLeaderSearch("");
  };

  // Add Teammate to On-Spot list
  const handleAddTeammateToList = (u?: any) => {
    if (u) {
      setOnSpotMembers((prev) => [
        ...prev,
        {
          id: `usr-${u.id}-${Date.now()}`,
          userId: u.id,
          name: u.displayName || u.name || "Student",
          email: u.email || "",
          usn: u.usn || "",
          phone: u.phone || "",
          branch: u.branch || "AIML",
          year: u.year ? String(u.year) : "3",
          responses: {},
        },
      ]);
      setNewMemberSearch("");
      setIsAddingTeammateOpen(false);
      return;
    }

    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      alert("Teammate name and email are required.");
      return;
    }

    // Validate required questions for this teammate
    for (const field of teammateCustomFields) {
      if (field.isRequired) {
        const val = newMemberResponses[field.id];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          alert(`Please answer required question "${field.label}" for teammate ${newMemberName}.`);
          return;
        }
      }
    }

    setOnSpotMembers((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}-${Math.random()}`,
        name: newMemberName.trim(),
        email: newMemberEmail.trim().toLowerCase(),
        usn: newMemberUsn.trim().toUpperCase(),
        phone: newMemberPhone.trim(),
        branch: newMemberBranch,
        year: newMemberYear,
        responses: { ...newMemberResponses },
      },
    ]);

    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberUsn("");
    setNewMemberPhone("");
    setNewMemberResponses({});
    setIsAddingTeammateOpen(false);
  };

  // Update a teammate's individual custom question response
  const handleUpdateTeammateResponse = (memberId: string, fieldId: string, val: any) => {
    setOnSpotMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              responses: {
                ...m.responses,
                [fieldId]: val,
              },
            }
          : m
      )
    );
  };

  const resetOnSpotForm = () => {
    setOnSpotLeaderUser(null);
    setOnSpotLeaderSearch("");
    setOnSpotLeaderName("");
    setOnSpotLeaderEmail("");
    setOnSpotLeaderUsn("");
    setOnSpotLeaderPhone("");
    setOnSpotLeaderBranch("AIML");
    setOnSpotLeaderYear("3");
    setLeaderResponses({});
    setOnSpotMembers([]);
    setOnSpotTeamName("");
    setNewMemberSearch("");
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberUsn("");
    setNewMemberPhone("");
    setNewMemberResponses({});
    setIsAddingTeammateOpen(false);
    setOnSpotMarkPresent(true);
  };

  // Submit On-Spot Registration
  const handleOnSpotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSpotLeaderName.trim() || !onSpotLeaderEmail.trim()) {
      alert("Participant name and email are required.");
      return;
    }

    const isTeam = onSpotFormat === "TEAM" || event.type === "TEAM";
    const minSize = event.minTeamSize || 1;
    const totalSize = 1 + onSpotMembers.length;

    if (isTeam && totalSize < minSize) {
      alert(`Team format requires at least ${minSize} members. Please add ${minSize - totalSize} more teammate(s).`);
      return;
    }

    // Validate leader / team required questions
    for (const field of leaderAndTeamCustomFields) {
      if (field.isRequired) {
        const val = leaderResponses[field.id];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          alert(`Please answer required question "${field.label}" for ${isTeam ? "team leader" : "participant"} ${onSpotLeaderName}.`);
          return;
        }
      }
    }

    // Validate each teammate's required questions
    if (isTeam) {
      for (const m of onSpotMembers) {
        for (const field of teammateCustomFields) {
          if (field.isRequired) {
            const val = m.responses?.[field.id];
            if (
              val === undefined ||
              val === null ||
              val === "" ||
              (Array.isArray(val) && val.length === 0)
            ) {
              alert(`Please answer required question "${field.label}" for teammate "${m.name || m.email}".`);
              return;
            }
          }
        }
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        action: "ON_SPOT_REGISTRATION",
        format: onSpotFormat,
        teamName: isTeam ? onSpotTeamName.trim() || undefined : undefined,
        markPresent: onSpotMarkPresent,
        leader: {
          userId: onSpotLeaderUser?.id || undefined,
          name: onSpotLeaderName.trim(),
          email: onSpotLeaderEmail.trim().toLowerCase(),
          usn: onSpotLeaderUsn.trim().toUpperCase() || undefined,
          phone: onSpotLeaderPhone.trim() || undefined,
          branch: onSpotLeaderBranch.trim() || undefined,
          year: onSpotLeaderYear ? Number(onSpotLeaderYear) : undefined,
        },
        members: isTeam
          ? onSpotMembers.map((m) => ({
              userId: m.userId || undefined,
              name: m.name,
              email: m.email,
              usn: m.usn || undefined,
              phone: m.phone || undefined,
              branch: m.branch || undefined,
              year: m.year ? Number(m.year) : undefined,
              responses: m.responses || {},
            }))
          : [],
        responses: leaderResponses,
      };

      const res = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to process on-spot registration");
      }

      alert("⚡ On-Spot Registration completed successfully!");
      setIsOnSpotModalOpen(false);
      resetOnSpotForm();
      router.refresh();
    } catch (err: any) {
      alert("On-Spot Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reusable custom field renderer
  const renderCustomField = (
    field: any,
    value: any,
    onChange: (val: any) => void
  ) => {
    const opts = (field.options as { min?: number | null; max?: number | null }) || {};

    return (
      <div key={field.id} className="space-y-1">
        <label className="block text-[11px] font-mono-tech text-muted-foreground uppercase">
          {field.label} {field.isRequired && <span className="text-red-400 font-bold">*</span>}
        </label>

        {field.fieldType === "TEXT" && (
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label}...`}
            className="w-full rounded-lg border border-brand/30 bg-background/80 px-3 py-1.5 text-xs text-foreground outline-none focus:border-brand-accent transition-colors"
          />
        )}

        {field.fieldType === "TEXTAREA" && (
          <textarea
            rows={2}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label}...`}
            className="w-full rounded-lg border border-brand/30 bg-background/80 px-3 py-1.5 text-xs text-foreground outline-none focus:border-brand-accent transition-colors"
          />
        )}

        {field.fieldType === "NUMBER" && (
          <input
            type="number"
            min={opts.min !== null && opts.min !== undefined ? opts.min : undefined}
            max={opts.max !== null && opts.max !== undefined ? opts.max : undefined}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value !== "" ? Number(e.target.value) : "")}
            placeholder={`Enter number...`}
            className="w-full rounded-lg border border-brand/30 bg-background/80 px-3 py-1.5 text-xs text-foreground outline-none focus:border-brand-accent transition-colors"
          />
        )}

        {field.fieldType === "SELECT" && (
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-brand/30 bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-brand-accent transition-colors"
          >
            <option value="">Select option...</option>
            {(Array.isArray(field.options) ? field.options : []).map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {field.fieldType === "MULTI_SELECT" && (
          <div className="space-y-1.5 rounded-lg border border-brand/20 bg-background/50 p-2.5">
            {(Array.isArray(field.options) ? field.options : []).map((opt: string) => {
              const selected: string[] = Array.isArray(value) ? value : [];
              const isChecked = selected.includes(opt);
              return (
                <label key={opt} className="flex items-center gap-2 text-xs text-foreground cursor-pointer font-space-grotesk">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selected, opt]
                        : selected.filter((x) => x !== opt);
                      onChange(next);
                    }}
                    className="rounded border-brand/30 text-brand focus:ring-brand-accent"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-brand/20 bg-card/60 backdrop-blur-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-mono-tech uppercase">Registered</span>
            <UsersIcon className="w-4 h-4 text-brand-accent" />
          </div>
          <p className="text-2xl font-bold font-space-grotesk text-foreground">
            {totalTeamsCount}
            <span className="text-xs font-normal text-muted-foreground ml-1.5">
              ({totalParticipantsCount} students)
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-mono-tech uppercase">Verified Present</span>
            <CheckCircle2Icon className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-space-grotesk text-emerald-400">
            {verifiedTeamsCount}
            <span className="text-xs font-normal text-emerald-300/70 ml-1.5">
              ({verifiedParticipantsCount} students)
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-mono-tech uppercase">Pending Check-in</span>
            <ClockIcon className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-space-grotesk text-amber-400">
            {pendingTeamsCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gold/30 bg-gold/10 backdrop-blur-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-gold mb-1">
            <span className="text-[11px] font-mono-tech uppercase">Check-in Rate</span>
            <ShieldCheckIcon className="w-4 h-4 text-gold" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold font-space-grotesk text-gold">{attendanceRate}%</p>
            <div className="flex-1 bg-background/50 h-2 rounded-full overflow-hidden self-center border border-gold/20">
              <div
                className="bg-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & ACTION CONTROLS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by student name, USN, email, phone, branch, team name, or team code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-brand/30 bg-background/80 pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-brand-accent transition-colors font-space-grotesk"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* On-Spot Registration Button */}
          <button
            onClick={() => {
              resetOnSpotForm();
              setIsOnSpotModalOpen(true);
            }}
            className="rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-4 py-2.5 text-xs font-bold font-space-grotesk uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <ZapIcon className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            <span>⚡ On-Spot Registration</span>
          </button>

          {/* Export Buttons */}
          <div className="flex items-center gap-1 border border-brand/20 rounded-xl bg-background/60 p-1">
            <button
              onClick={() => handleExportRoster("CSV")}
              disabled={exporting}
              className="rounded-lg px-2.5 py-1.5 text-xs font-mono-tech text-muted-foreground hover:text-foreground hover:bg-brand/10 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Download CSV"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExportRoster("EXCEL")}
              disabled={exporting}
              className="rounded-lg px-2.5 py-1.5 text-xs font-mono-tech text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Download Excel"
            >
              <span>XLSX</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. SEGMENTED ATTENDANCE FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-tech transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === "ALL"
              ? "bg-brand/25 text-brand-accent border border-brand/40 font-bold shadow-sm"
              : "bg-card/40 text-muted-foreground border border-brand/10 hover:text-foreground"
          }`}
        >
          <span>ALL PARTICIPANTS</span>
          <span className="bg-background/80 px-1.5 py-0.2 rounded text-[10px]">
            {currentTeams.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter("PRESENT")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-tech transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === "PRESENT"
              ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 font-bold shadow-sm"
              : "bg-card/40 text-muted-foreground border border-brand/10 hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-400" />
            PRESENT / VERIFIED
          </span>
          <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded text-[10px]">
            {verifiedTeamsCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter("ABSENT")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-tech transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === "ABSENT"
              ? "bg-amber-500/25 text-amber-400 border border-amber-500/40 font-bold shadow-sm"
              : "bg-card/40 text-muted-foreground border border-brand/10 hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
            PENDING CHECK-IN
          </span>
          <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded text-[10px]">
            {pendingTeamsCount}
          </span>
        </button>
      </div>

      {/* 4. ROSTER LIST / REGISTRATIONS CARDS */}
      <div className="space-y-4">
        {filteredTeams.length === 0 ? (
          <div className="rounded-2xl border border-brand/20 bg-card/40 backdrop-blur-sm p-12 text-center space-y-3">
            <UsersIcon className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <h3 className="text-base font-bold font-space-grotesk text-foreground">
              No matching registrations found
            </h3>
            <p className="text-xs text-muted-foreground font-mono-tech max-w-md mx-auto">
              {searchTerm
                ? `No participants matched "${searchTerm}". Try searching by USN, email, or team name.`
                : "No registrations match the selected attendance filter."}
            </p>
          </div>
        ) : (
          filteredTeams.map((team) => {
            const members = team.registrations || [];
            const isAttended = !!team.attended;
            const isVerifying = verifyingTeamId === team.id;

            return (
              <div
                key={team.id}
                className={`rounded-2xl border transition-all p-4 md:p-5 relative overflow-hidden backdrop-blur-sm ${
                  isAttended
                    ? "border-emerald-500/40 bg-emerald-500/5 shadow-sm shadow-emerald-500/5"
                    : "border-brand/20 bg-card/50 hover:border-brand/40"
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand/10 mb-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-tech uppercase font-bold tracking-wider ${
                        isAttended
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {isAttended ? (
                        <>
                          <CheckCircle2Icon className="w-3.5 h-3.5" />
                          <span>VERIFIED PRESENT</span>
                        </>
                      ) : (
                        <>
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>PENDING CHECK-IN</span>
                        </>
                      )}
                    </span>

                    {/* Team Name */}
                    {team.name && (
                      <h3 className="font-bold font-space-grotesk text-base text-foreground">
                        {team.name}
                      </h3>
                    )}

                    {/* Team Code */}
                    {team.teamCode && (
                      <div className="flex items-center gap-1 bg-background/80 border border-brand/20 px-2 py-0.5 rounded-lg text-xs font-mono-tech">
                        <span className="text-muted-foreground text-[10px]">CODE:</span>
                        <span className="font-bold text-foreground">{team.teamCode}</span>
                        <button
                          onClick={() => handleCopyCode(team.teamCode)}
                          className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
                          title="Copy Code"
                        >
                          {copiedCode === team.teamCode ? (
                            <CheckIcon className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <CopyIcon className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}

                    <span className="text-xs text-muted-foreground font-mono-tech">
                      ({members.length} {members.length === 1 ? "participant" : "members"})
                    </span>
                  </div>

                  {/* Top-Right Quick Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Mark Present / Absent Button */}
                    {isAttended ? (
                      <button
                        onClick={() => handleToggleAttendance(team.id, false)}
                        disabled={isVerifying}
                        className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold font-space-grotesk text-emerald-300 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Click to unmark attendance"
                      >
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>✓ Mark Absent</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleAttendance(team.id, true)}
                        disabled={isVerifying}
                        className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 text-xs font-bold font-space-grotesk uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                        <span>Verify / Mark Present</span>
                      </button>
                    )}

                    {/* Delete Team Button */}
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                      title="Delete Registration"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Team Members Roster Grid */}
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {members.map((reg: any) => {
                    const isLeader = team.leaderId === reg.userId;
                    const u = reg.user || {};
                    const isMemberVerified = isAttended || reg.customFieldResponses?.verified === true;

                    return (
                      <div
                        key={reg.id}
                        className={`p-3 rounded-xl border transition-colors space-y-2 ${
                          isMemberVerified
                            ? "border-emerald-500/25 bg-background/70"
                            : "border-brand/15 bg-background/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-sm font-space-grotesk text-foreground truncate">
                                {u.displayName || u.name || "Student"}
                              </p>
                              {isLeader && (
                                <span className="bg-brand/20 text-brand-accent border border-brand/30 text-[9px] font-mono-tech uppercase font-bold px-1.5 py-0.2 rounded shrink-0">
                                  LEADER
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-mono-tech text-muted-foreground truncate">{u.email}</p>

                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] font-mono-tech">
                              {u.usn && (
                                <span className="bg-muted/80 text-foreground px-1.5 py-0.2 rounded font-bold">
                                  {u.usn}
                                </span>
                              )}
                              {(u.branch || u.year) && (
                                <span className="text-muted-foreground">
                                  {u.branch || ""}{u.year ? ` • Yr ${u.year}` : ""}
                                </span>
                              )}
                              {u.phone && (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <PhoneIcon className="w-2.5 h-2.5" />
                                  {u.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {/* Member Verification Indicator / Toggle (for team events) */}
                            {event.type === "TEAM" && (
                              <button
                                onClick={() => handleToggleAttendance(team.id, !isMemberVerified, reg.userId)}
                                className={`text-[10px] font-mono-tech px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                                  isMemberVerified
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                                }`}
                                title="Toggle individual student attendance"
                              >
                                {isMemberVerified ? "✓ PRESENT" : "MARK PRESENT"}
                              </button>
                            )}

                            <button
                              onClick={() => handleRemoveMember(reg.userId, team.id)}
                              className="rounded-md p-1 text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                              title="Remove member"
                            >
                              <UserMinusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Member's Custom Responses Display */}
                        {event.customFields && event.customFields.length > 0 && reg.customFieldResponses && (
                          <div className="pt-2 border-t border-brand/10 space-y-1 text-[11px] font-mono-tech">
                            {event.customFields
                              .filter((cf: any) => cf.fieldType !== "DISPLAY_IMAGE" && (cf.targetRole !== "LEADER_ONLY" || isLeader))
                              .map((cf: any) => {
                                const val = reg.customFieldResponses?.[cf.id];
                                if (val === undefined || val === null || val === "") return null;
                                return (
                                  <div key={cf.id} className="flex items-baseline justify-between gap-1 text-muted-foreground">
                                    <span className="truncate">{cf.label}:</span>
                                    <span className="text-foreground font-semibold shrink-0">
                                      {Array.isArray(val) ? val.join(", ") : String(val)}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. ON-SPOT REGISTRATION MODAL */}
      {/* ========================================================================= */}
      {isOnSpotModalOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsOnSpotModalOpen(false)} />
            <div className="relative w-full max-w-2xl rounded-2xl border border-brand/30 bg-card p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-blueprint-grid my-auto">
              <CircuitTrace corners={true} />

              <div className="relative z-10 space-y-6">
                {/* Modal Header */}
                <div className="border-b border-brand/20 pb-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ZapIcon className="w-5 h-5 text-amber-400" />
                      <h2 className="text-xl font-bold font-space-grotesk text-foreground">
                        On-Spot Registration Desk
                      </h2>
                    </div>
                    <p className="text-xs text-muted-foreground font-space-grotesk mt-0.5">
                      Register walk-in students or teams directly at the event check-in desk.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOnSpotModalOpen(false)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleOnSpotSubmit} className="space-y-5">
                  {/* Format Selector (Solo / Team) */}
                  <div className="flex items-center justify-between rounded-xl border border-brand/20 bg-background/60 p-3">
                    <div>
                      <span className="text-xs font-mono-tech uppercase font-bold text-foreground">
                        Registration Format
                      </span>
                      <p className="text-[11px] text-muted-foreground font-mono-tech">
                        Event configuration: {event.type}
                        {event.type === "TEAM" && ` (${event.minTeamSize || 2} - ${event.maxTeamSize || 4} members)`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 border border-brand/20 rounded-lg p-1 bg-background/80">
                      <button
                        type="button"
                        onClick={() => setOnSpotFormat("SOLO")}
                        disabled={event.type === "TEAM"}
                        className={`px-3 py-1 text-xs font-mono-tech rounded font-bold transition-all cursor-pointer ${
                          onSpotFormat === "SOLO"
                            ? "bg-brand/30 text-brand-accent shadow-sm"
                            : "text-muted-foreground hover:text-foreground disabled:opacity-40"
                        }`}
                      >
                        SOLO
                      </button>
                      <button
                        type="button"
                        onClick={() => setOnSpotFormat("TEAM")}
                        disabled={event.type === "SOLO"}
                        className={`px-3 py-1 text-xs font-mono-tech rounded font-bold transition-all cursor-pointer ${
                          onSpotFormat === "TEAM"
                            ? "bg-brand/30 text-brand-accent shadow-sm"
                            : "text-muted-foreground hover:text-foreground disabled:opacity-40"
                        }`}
                      >
                        TEAM
                      </button>
                    </div>
                  </div>

                  {/* Section A: Team Leader / Participant 1 */}
                  <div className="rounded-xl border border-brand/20 bg-background/50 p-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-accent" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-foreground font-mono-tech">
                          {onSpotFormat === "TEAM" || event.type === "TEAM" ? "Team Leader (Primary)" : "Student Details"}
                        </h4>
                      </div>
                      {onSpotLeaderUser && (
                        <button
                          type="button"
                          onClick={() => {
                            setOnSpotLeaderUser(null);
                            setOnSpotLeaderName("");
                            setOnSpotLeaderEmail("");
                            setOnSpotLeaderUsn("");
                            setOnSpotLeaderPhone("");
                          }}
                          className="text-[11px] text-red-400 hover:text-red-300 font-mono-tech cursor-pointer"
                        >
                          Clear autofill
                        </button>
                      )}
                    </div>

                    {/* Quick Search from Existing Users */}
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        placeholder="Search existing student to autofill (or type manual details below)..."
                        value={onSpotLeaderSearch}
                        onChange={(e) => setOnSpotLeaderSearch(e.target.value)}
                        className="w-full rounded-lg border border-brand/25 bg-background/90 pl-9 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-brand-accent font-space-grotesk"
                      />
                      {availableUsersForLeader.length > 0 && (
                        <div className="absolute top-full mt-1 inset-x-0 z-30 rounded-lg border border-brand/30 bg-card p-1 shadow-xl max-h-48 overflow-y-auto space-y-1">
                          {availableUsersForLeader.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleSelectLeaderUser(u)}
                              className="w-full text-left p-2 rounded-md hover:bg-brand/15 flex items-center justify-between text-xs transition-colors cursor-pointer"
                            >
                              <div>
                                <span className="font-bold text-foreground">
                                  {u.displayName || u.name}
                                </span>
                                <span className="text-[11px] font-mono-tech text-muted-foreground ml-2">
                                  {u.email} {u.usn ? `• ${u.usn}` : ""}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono-tech text-brand-accent uppercase font-bold">
                                Select ↵
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Leader Details Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-mono-tech uppercase text-muted-foreground mb-1">
                          Student Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={onSpotLeaderName}
                          onChange={(e) => setOnSpotLeaderName(e.target.value)}
                          className="w-full rounded-lg border border-brand/30 bg-background/80 px-3 py-2 text-xs text-foreground outline-none focus:border-brand-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech uppercase text-muted-foreground mb-1">
                          Student Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. rahul@nmamit.in"
                          value={onSpotLeaderEmail}
                          onChange={(e) => setOnSpotLeaderEmail(e.target.value)}
                          className="w-full rounded-lg border border-brand/30 bg-background/80 px-3 py-2 text-xs text-foreground outline-none focus:border-brand-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech uppercase text-muted-foreground mb-1">
                          USN (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 4NM22AI001"
                          value={onSpotLeaderUsn}
                          onChange={(e) => setOnSpotLeaderUsn(e.target.value.toUpperCase())}
                          className="w-full rounded-lg border border-brand/30 bg-background/80 px-3 py-2 text-xs text-foreground outline-none focus:border-brand-accent uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech uppercase text-muted-foreground mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={onSpotLeaderPhone}
                          onChange={(e) => setOnSpotLeaderPhone(e.target.value)}
                          className="w-full rounded-lg border border-brand/30 bg-background/80 px-3 py-2 text-xs text-foreground outline-none focus:border-brand-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech uppercase text-muted-foreground mb-1">
                          Branch
                        </label>
                        <select
                          value={onSpotLeaderBranch}
                          onChange={(e) => setOnSpotLeaderBranch(e.target.value)}
                          className="w-full rounded-lg border border-brand/30 bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-brand-accent"
                        >
                          <option value="AIML">AIML</option>
                          <option value="CSE">CSE</option>
                          <option value="ISE">ISE</option>
                          <option value="CCE">CCE</option>
                          <option value="ECE">ECE</option>
                          <option value="EEE">EEE</option>
                          <option value="MECH">MECH</option>
                          <option value="CIVIL">CIVIL</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech uppercase text-muted-foreground mb-1">
                          Academic Year
                        </label>
                        <select
                          value={onSpotLeaderYear}
                          onChange={(e) => setOnSpotLeaderYear(e.target.value)}
                          className="w-full rounded-lg border border-brand/30 bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-brand-accent"
                        >
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Team Roster & Teammates (if TEAM format) */}
                  {(onSpotFormat === "TEAM" || event.type === "TEAM") && (
                    <div className="rounded-xl border border-brand/20 bg-background/50 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gold" />
                          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground font-mono-tech">
                            Team Roster ({1 + onSpotMembers.length} / {event.maxTeamSize || 4} Members)
                          </h4>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech uppercase text-muted-foreground mb-1">
                          Team Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Binary Beasts"
                          value={onSpotTeamName}
                          onChange={(e) => setOnSpotTeamName(e.target.value)}
                          className="w-full rounded-lg border border-brand/30 bg-background/80 px-3 py-2 text-xs text-foreground outline-none focus:border-brand-accent"
                        />
                      </div>

                      {/* Members Added List */}
                      {onSpotMembers.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-mono-tech uppercase font-bold text-muted-foreground">
                              Added Teammates ({onSpotMembers.length}):
                            </label>
                            <span className="text-[10px] text-muted-foreground font-mono-tech">
                              {teammateCustomFields.length > 0
                                ? `${teammateCustomFields.length} question(s) per member`
                                : "No custom questions for teammates"}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {onSpotMembers.map((m, mIdx) => {
                              const missingRequiredCount = teammateCustomFields.filter(
                                (cf: any) =>
                                  cf.isRequired &&
                                  (m.responses?.[cf.id] === undefined ||
                                    m.responses?.[cf.id] === null ||
                                    m.responses?.[cf.id] === "" ||
                                    (Array.isArray(m.responses?.[cf.id]) && m.responses?.[cf.id].length === 0))
                              ).length;

                              return (
                                <div
                                  key={m.id}
                                  className={`p-3 rounded-xl border transition-colors space-y-2.5 ${
                                    missingRequiredCount > 0
                                      ? "border-amber-500/40 bg-amber-500/5"
                                      : "border-brand/20 bg-background/70"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-foreground">
                                          #{mIdx + 2} {m.name}
                                        </span>
                                        {m.usn && (
                                          <span className="bg-muted px-1.5 py-0.2 rounded text-[10px] font-mono-tech font-bold text-foreground">
                                            {m.usn}
                                          </span>
                                        )}
                                        {missingRequiredCount > 0 && (
                                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono-tech uppercase font-bold px-1.5 py-0.2 rounded">
                                            {missingRequiredCount} Required Question(s) Pending
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] font-mono-tech text-muted-foreground">
                                        {m.email} {m.branch ? `• ${m.branch}` : ""}{m.year ? ` • Yr ${m.year}` : ""}
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setOnSpotMembers((prev) => prev.filter((item) => item.id !== m.id))}
                                      className="text-red-400 hover:text-red-300 p-1 text-xs cursor-pointer rounded hover:bg-red-500/10 transition-colors"
                                      title="Remove teammate"
                                    >
                                      <Trash2Icon className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Teammate Questionnaire Inputs */}
                                  {teammateCustomFields.length > 0 && (
                                    <div className="pt-2 border-t border-brand/15 space-y-2 bg-background/50 p-2.5 rounded-lg">
                                      <p className="text-[10px] font-mono-tech uppercase font-bold text-brand-accent flex items-center gap-1">
                                        <span>Questions for {m.name || "Teammate"}:</span>
                                      </p>
                                      <div className="space-y-2">
                                        {teammateCustomFields.map((field: any) =>
                                          renderCustomField(
                                            field,
                                            m.responses?.[field.id],
                                            (val) => handleUpdateTeammateResponse(m.id, field.id, val)
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Add Teammate Box */}
                      {1 + onSpotMembers.length < (event.maxTeamSize || 4) && (
                        <div className="border-t border-brand/15 pt-3 space-y-2">
                          {!isAddingTeammateOpen ? (
                            <button
                              type="button"
                              onClick={() => setIsAddingTeammateOpen(true)}
                              className="w-full rounded-lg border border-dashed border-brand/30 py-2 text-xs font-mono-tech text-brand-accent hover:bg-brand/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                              <span>Add Teammate to Roster</span>
                            </button>
                          ) : (
                            <div className="p-3 rounded-lg border border-brand/20 bg-background/70 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-mono-tech uppercase font-bold text-brand-accent">
                                  Add Teammate
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsAddingTeammateOpen(false)}
                                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>

                              {/* Search Existing Teammate */}
                              <div className="space-y-1">
                                <input
                                  placeholder="Autofill from registered students..."
                                  value={newMemberSearch}
                                  onChange={(e) => setNewMemberSearch(e.target.value)}
                                  className="w-full rounded-lg border border-brand/20 bg-background/80 px-2.5 py-1 text-xs text-foreground outline-none focus:border-brand-accent"
                                />
                                {availableUsersForTeammate.length > 0 && (
                                  <div className="max-h-28 overflow-y-auto space-y-1 border border-brand/20 rounded p-1 bg-background">
                                    {availableUsersForTeammate.map((u) => (
                                      <button
                                        key={u.id}
                                        type="button"
                                        onClick={() => handleAddTeammateToList(u)}
                                        className="w-full text-left p-1.5 hover:bg-brand/15 rounded flex justify-between text-xs cursor-pointer"
                                      >
                                        <span>{u.displayName || u.name} ({u.usn || u.email})</span>
                                        <span className="text-brand-accent font-bold">Add ↵</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Manual Entry */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  placeholder="Name *"
                                  value={newMemberName}
                                  onChange={(e) => setNewMemberName(e.target.value)}
                                  className="rounded-lg border border-brand/20 bg-background/80 px-2.5 py-1 text-xs text-foreground outline-none"
                                />
                                <input
                                  type="email"
                                  placeholder="Email *"
                                  value={newMemberEmail}
                                  onChange={(e) => setNewMemberEmail(e.target.value)}
                                  className="rounded-lg border border-brand/20 bg-background/80 px-2.5 py-1 text-xs text-foreground outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="USN (optional)"
                                  value={newMemberUsn}
                                  onChange={(e) => setNewMemberUsn(e.target.value.toUpperCase())}
                                  className="rounded-lg border border-brand/20 bg-background/80 px-2.5 py-1 text-xs text-foreground outline-none uppercase"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="tel"
                                  placeholder="Phone (optional)"
                                  value={newMemberPhone}
                                  onChange={(e) => setNewMemberPhone(e.target.value)}
                                  className="rounded-lg border border-brand/20 bg-background/80 px-2.5 py-1 text-xs text-foreground outline-none"
                                />
                                <select
                                  value={newMemberBranch}
                                  onChange={(e) => setNewMemberBranch(e.target.value)}
                                  className="rounded-lg border border-brand/20 bg-card px-2.5 py-1 text-xs text-foreground outline-none"
                                >
                                  <option value="AIML">AIML</option>
                                  <option value="CSE">CSE</option>
                                  <option value="ISE">ISE</option>
                                  <option value="CCE">CCE</option>
                                  <option value="ECE">ECE</option>
                                  <option value="EEE">EEE</option>
                                  <option value="MECH">MECH</option>
                                  <option value="CIVIL">CIVIL</option>
                                </select>
                                <select
                                  value={newMemberYear}
                                  onChange={(e) => setNewMemberYear(e.target.value)}
                                  className="rounded-lg border border-brand/20 bg-card px-2.5 py-1 text-xs text-foreground outline-none"
                                >
                                  <option value="1">1st Year</option>
                                  <option value="2">2nd Year</option>
                                  <option value="3">3rd Year</option>
                                  <option value="4">4th Year</option>
                                </select>
                              </div>

                              {/* Questions for new teammate inside the box (if any) */}
                              {teammateCustomFields.length > 0 && (
                                <div className="p-2.5 rounded-lg border border-brand/20 bg-background/80 space-y-2">
                                  <p className="text-[10px] font-mono-tech uppercase font-bold text-brand-accent">
                                    Teammate Questionnaire:
                                  </p>
                                  <div className="space-y-2">
                                    {teammateCustomFields.map((field: any) =>
                                      renderCustomField(
                                        field,
                                        newMemberResponses[field.id],
                                        (val) => setNewMemberResponses((prev) => ({ ...prev, [field.id]: val }))
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleAddTeammateToList()}
                                className="rounded-lg bg-brand/20 border border-brand/30 px-3 py-1.5 text-xs font-bold text-brand-accent hover:bg-brand/30 transition-colors cursor-pointer"
                              >
                                Add to Team List
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section C: Leader / Team Questionnaire (if any) */}
                  {leaderAndTeamCustomFields.length > 0 && (
                    <div className="rounded-xl border border-brand/20 bg-background/50 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gold" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-foreground font-mono-tech">
                          {onSpotFormat === "TEAM" || event.type === "TEAM"
                            ? "Team & Leader Questionnaire"
                            : "Participant Questionnaire"}
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {leaderAndTeamCustomFields.map((field: any) =>
                          renderCustomField(
                            field,
                            leaderResponses[field.id],
                            (val) => setLeaderResponses((prev) => ({ ...prev, [field.id]: val }))
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Immediate Verification Toggle */}
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2Icon className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-foreground">Mark as Present & Verified Immediately</p>
                        <p className="text-[11px] text-muted-foreground font-mono-tech">
                          Student is physically present at the check-in desk
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={onSpotMarkPresent}
                      onChange={(e) => setOnSpotMarkPresent(e.target.checked)}
                      className="w-5 h-5 rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center gap-3 pt-3 border-t border-brand/20">
                    <button
                      type="button"
                      onClick={() => setIsOnSpotModalOpen(false)}
                      className="flex-1 rounded-xl border border-brand/30 bg-background/60 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !onSpotLeaderName || !onSpotLeaderEmail}
                      className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ZapIcon className="w-4 h-4 text-amber-300" />
                      <span>{loading ? "Registering..." : "Complete On-Spot Registration"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
