"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2Icon, UserPlusIcon, SearchIcon, PlusIcon, UsersIcon, ShieldCheckIcon, UserMinusIcon } from "lucide-react";

interface RegistrationsClientProps {
  event: any;
  teams: any[];
  allUsers: any[];
}

export default function RegistrationsClient({ event, teams, allUsers }: RegistrationsClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Create Team Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [leaderSearchTerm, setLeaderSearchTerm] = useState("");
  const [selectedLeaderId, setSelectedLeaderId] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [customResponses, setCustomResponses] = useState<Record<string, any>>({});

  // Add Member to Team Modal State
  const [targetTeamId, setTargetTeamId] = useState<string | null>(null);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");

  // Set of all registered user IDs across all teams
  const registeredUserIds = new Set(
    teams.flatMap((t) => (t.registrations || []).map((r: any) => r.userId))
  );

  const availableUsersForLeader = allUsers.filter(
    (u) =>
      !registeredUserIds.has(u.id) &&
      ((u.name || "").toLowerCase().includes(leaderSearchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(leaderSearchTerm.toLowerCase()) ||
        (u.displayName || "").toLowerCase().includes(leaderSearchTerm.toLowerCase()))
  ).slice(0, 10);

  const availableUsersForMember = allUsers.filter(
    (u) =>
      !registeredUserIds.has(u.id) &&
      ((u.name || "").toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        (u.displayName || "").toLowerCase().includes(memberSearchTerm.toLowerCase()))
  ).slice(0, 10);

  // Filter teams by search term (searches team name, team code, and member names/emails)
  const filteredTeams = teams.filter((team) => {
    const term = searchTerm.toLowerCase();
    const matchesTeamName = (team.name || "").toLowerCase().includes(term);
    const matchesTeamCode = (team.teamCode || "").toLowerCase().includes(term);
    const matchesMember = (team.registrations || []).some(
      (r: any) =>
        (r.user?.name || "").toLowerCase().includes(term) ||
        (r.user?.email || "").toLowerCase().includes(term) ||
        (r.user?.displayName || "").toLowerCase().includes(term)
    );
    return matchesTeamName || matchesTeamCode || matchesMember;
  });

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaderId) {
      alert("Please select a student as the leader/participant.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_TEAM",
          leaderId: selectedLeaderId,
          teamName: newTeamName,
          responses: customResponses,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Team registered successfully!");
      setIsCreateModalOpen(false);
      setSelectedLeaderId("");
      setNewTeamName("");
      setCustomResponses({});
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemberToTeam = async (userId: string) => {
    if (!targetTeamId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_MEMBER",
          teamId: targetTeamId,
          userId,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Member added to team!");
      setTargetTeamId(null);
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this ENTIRE team and all its registrations?")) return;

    try {
      const res = await fetch(`/api/admin/events/${event.id}/registrations?teamId=${teamId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Team deleted.");
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const totalParticipants = teams.reduce((acc, t) => acc + (t.registrations?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-mono-tech text-xs text-muted-foreground uppercase">
            TEAMS: <span className="text-gold font-bold">{teams.length}</span>
          </span>
          <span className="font-mono-tech text-xs text-muted-foreground uppercase">
            TOTAL PARTICIPANTS: <span className="text-gold font-bold">{totalParticipants}</span>
          </span>
          <span className="font-mono-tech text-xs text-muted-foreground uppercase">
            FORMAT: <span className="text-brand-accent font-bold">{event.type}</span>
          </span>
        </div>

        <button
          onClick={() => {
            setIsCreateModalOpen(true);
            setSelectedLeaderId("");
            setCustomResponses({});
          }}
          className="rounded-xl bg-brand/20 border border-brand/40 px-4 py-2.5 text-xs font-bold font-mono-tech uppercase tracking-wider text-brand-accent hover:bg-brand/30 transition-all flex items-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <UserPlusIcon className="w-4 h-4" />
          {event.type === "TEAM" ? "CREATE_NEW_TEAM" : "ADD_PARTICIPANT"}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search by student name, team name, email, or team code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-brand/30 bg-card/60 pl-10 pr-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent font-space-grotesk"
        />
      </div>

      {/* Teams Grid / List */}
      <div className="space-y-4">
        {filteredTeams.length === 0 ? (
          <div className="rounded-2xl border border-brand/20 bg-card/60 backdrop-blur-xl p-12 text-center text-sm text-muted-foreground font-space-grotesk">
            No registrations found. Click the button above to manually create a team or add participants.
          </div>
        ) : (
          filteredTeams.map((team) => {
            const members = team.registrations || [];
            const canAddMore = event.type === "TEAM" && members.length < (event.maxTeamSize || 4);

            return (
              <div
                key={team.id}
                className="rounded-2xl border border-brand/20 bg-card/70 backdrop-blur-xl p-5 shadow-lg space-y-4 transition-all hover:border-brand-accent/40"
              >
                {/* Team Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand/15 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center text-brand-accent">
                      <UsersIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold font-space-grotesk text-base text-foreground flex items-center gap-2">
                        {team.name || "Solo Registration"}
                        {team.teamCode && (
                          <span className="font-mono-tech text-xs bg-brand/20 text-brand-accent px-2 py-0.5 rounded border border-brand/30">
                            CODE: {team.teamCode}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono-tech">
                        MEMBERS: {members.length} / {event.type === "TEAM" ? event.maxTeamSize : 1}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {canAddMore && (
                      <button
                        onClick={() => {
                          setTargetTeamId(team.id);
                          setMemberSearchTerm("");
                        }}
                        className="rounded-lg border border-brand/30 bg-background/60 px-3 py-1.5 text-xs font-bold font-space-grotesk text-brand-accent hover:bg-brand/15 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        Add Member
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                      title="Delete Team"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {members.map((reg: any) => {
                    const isLeader = team.leaderId === reg.userId;

                    return (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-brand/15 bg-background/50 backdrop-blur-sm"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-sm font-space-grotesk text-foreground truncate">
                              {reg.user?.displayName || reg.user?.name || "Student"}
                            </p>
                            {isLeader && (
                              <span className="bg-brand/20 text-brand-accent border border-brand/30 text-[9px] font-mono-tech uppercase font-bold px-1.5 py-0.2 rounded">
                                LEADER
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono-tech text-muted-foreground truncate">{reg.user?.email}</p>
                        </div>

                        <button
                          onClick={() => handleRemoveMember(reg.userId, team.id)}
                          className="rounded-md p-1 text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer shrink-0"
                          title="Remove member"
                        >
                          <UserMinusIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Team & Fill Dynamic Custom Form */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative w-full max-w-xl rounded-3xl border border-brand/30 bg-card/95 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl">
            <h2 className="text-2xl font-bold font-space-grotesk mb-2 text-foreground">
              {event.type === "TEAM" ? "Create Team & Fill Details" : "Register Participant"}
            </h2>
            <p className="text-xs text-muted-foreground font-space-grotesk mb-6">
              Select the student leader and fill in any event registration questionnaire on their behalf.
            </p>

            <form onSubmit={handleCreateTeam} className="space-y-6">
              {/* Select Leader */}
              <div className="space-y-2">
                <label className="block text-xs font-mono-tech uppercase text-muted-foreground">
                  Select {event.type === "TEAM" ? "Team Leader" : "Student"} *
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Search unregistered students by name or email..."
                    value={leaderSearchTerm}
                    onChange={(e) => setLeaderSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-brand/30 bg-background/70 pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-brand/20 rounded-xl p-2 bg-background/40">
                  {availableUsersForLeader.length === 0 ? (
                    <p className="text-xs text-center text-muted-foreground py-4 font-space-grotesk">
                      No matching unregistered students found.
                    </p>
                  ) : (
                    availableUsersForLeader.map((u) => (
                      <label
                        key={u.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          selectedLeaderId === u.id
                            ? "border-brand-accent bg-brand/15 text-foreground"
                            : "border-brand/10 hover:bg-brand/5"
                        }`}
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-semibold text-xs font-space-grotesk text-foreground truncate">
                            {u.displayName || u.name || "Student"}
                          </p>
                          <p className="text-[11px] font-mono-tech text-muted-foreground truncate">{u.email}</p>
                        </div>
                        <input
                          type="radio"
                          name="leader"
                          value={u.id}
                          checked={selectedLeaderId === u.id}
                          onChange={() => setSelectedLeaderId(u.id)}
                          className="text-brand focus:ring-brand-accent"
                        />
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Team Name for TEAM events */}
              {event.type === "TEAM" && (
                <div>
                  <label className="mb-1 block text-xs font-mono-tech uppercase text-muted-foreground">
                    Team Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Neural Ninjas"
                    className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
              )}

              {/* Dynamic Custom Fields */}
              {event.customFields && event.customFields.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-brand/20">
                  <h3 className="font-bold font-space-grotesk text-sm text-foreground uppercase tracking-wider">
                    Event Questionnaire
                  </h3>

                  {event.customFields.map((field: any) => {
                    const opts = field.options || {};

                    return (
                      <div key={field.id} className="space-y-1.5">
                        <label className="block text-xs font-mono-tech text-muted-foreground uppercase">
                          {field.label} {field.isRequired && <span className="text-red-400">*</span>}
                        </label>

                        {field.fieldType === "TEXT" && (
                          <input
                            type="text"
                            required={field.isRequired}
                            value={customResponses[field.id] || ""}
                            className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                            onChange={(e) => setCustomResponses({ ...customResponses, [field.id]: e.target.value })}
                            placeholder="Enter response..."
                          />
                        )}

                        {field.fieldType === "TEXTAREA" && (
                          <textarea
                            required={field.isRequired}
                            rows={3}
                            value={customResponses[field.id] || ""}
                            className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                            onChange={(e) => setCustomResponses({ ...customResponses, [field.id]: e.target.value })}
                            placeholder="Enter detailed response..."
                          />
                        )}

                        {field.fieldType === "NUMBER" && (
                          <input
                            type="number"
                            required={field.isRequired}
                            min={opts.min !== null && opts.min !== undefined ? opts.min : undefined}
                            max={opts.max !== null && opts.max !== undefined ? opts.max : undefined}
                            value={customResponses[field.id] ?? ""}
                            className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                            onChange={(e) =>
                              setCustomResponses({
                                ...customResponses,
                                [field.id]: e.target.value !== "" ? Number(e.target.value) : "",
                              })
                            }
                            placeholder="Enter number..."
                          />
                        )}

                        {field.fieldType === "SELECT" && (
                          <select
                            required={field.isRequired}
                            value={customResponses[field.id] || ""}
                            className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                            onChange={(e) => setCustomResponses({ ...customResponses, [field.id]: e.target.value })}
                          >
                            <option value="">Select an option</option>
                            {(Array.isArray(field.options) ? field.options : []).map((opt: string) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-brand/20">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-xl border border-brand/30 bg-background/60 py-3 font-space-grotesk font-semibold text-foreground transition-colors hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedLeaderId}
                  className="flex-1 rounded-xl bg-brand py-3 font-space-grotesk font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand/90 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Creating..." : "Confirm Team Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Member to Existing Team */}
      {targetTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setTargetTeamId(null)} />
          <div className="relative w-full max-w-md rounded-3xl border border-brand/30 bg-card/95 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-bold font-space-grotesk mb-2 text-foreground">Add Teammate</h2>
            <p className="text-xs text-muted-foreground font-space-grotesk mb-4">
              Select an unregistered student to join this team.
            </p>

            <div className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search students..."
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-brand/30 bg-background/70 pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 border border-brand/20 rounded-xl p-2 bg-background/40">
                {availableUsersForMember.length === 0 ? (
                  <p className="text-xs text-center text-muted-foreground py-4 font-space-grotesk">
                    No unregistered students found.
                  </p>
                ) : (
                  availableUsersForMember.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 hover:bg-brand/10 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="font-semibold text-xs font-space-grotesk text-foreground truncate">
                          {u.displayName || u.name || "Student"}
                        </p>
                        <p className="text-[11px] font-mono-tech text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <button
                        onClick={() => handleAddMemberToTeam(u.id)}
                        disabled={loading}
                        className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold font-space-grotesk text-white hover:bg-brand/90 disabled:opacity-50 transition-all cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => setTargetTeamId(null)}
                className="w-full rounded-xl border border-brand/30 bg-background/60 py-2.5 font-space-grotesk font-semibold text-xs text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
