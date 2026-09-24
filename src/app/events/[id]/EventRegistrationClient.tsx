"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2Icon,
  CopyIcon,
  CheckIcon,
  UsersIcon,
  LockIcon,
  PlusIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "lucide-react";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface EventRegistrationClientProps {
  event: any;
  isRegistered: boolean;
  userTeam: any;
  isPast: boolean;
  isLive: boolean;
  session: any;
}

export default function EventRegistrationClient({
  event,
  isRegistered,
  userTeam,
  isPast,
  isLive,
  session,
}: EventRegistrationClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [teamAction, setTeamAction] = useState<"CREATE" | "JOIN">("CREATE");
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmingTeam, setConfirmingTeam] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Dynamic responses for custom fields
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  const handleFileUpload = async (fieldId: string, file: File) => {
    if (!file) return;
    setUploadingFiles((prev) => ({ ...prev, [fieldId]: true }));
    try {
      const ext = file.name.split(".").pop();
      const fileName = `registration-uploads/${event.id}/${session?.user?.id || "anon"}_${Date.now()}.${ext}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          () => {},
          (error) => {
            alert("File upload failed: " + error.message);
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setResponses((prev: any) => ({ ...prev, [fieldId]: downloadUrl }));
            resolve();
          }
        );
      });
    } catch (err: any) {
      console.error("Upload error:", err);
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const isSolo = event.type === "SOLO";

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        action: isSolo ? "CREATE" : teamAction,
      };

      if (!isSolo) {
        if (teamAction === "CREATE") {
          payload.teamName = teamName;
        } else {
          payload.teamCode = teamCode.trim().toUpperCase();
        }
      }

      // Check if any file is still uploading
      if (Object.values(uploadingFiles).some(Boolean)) {
        throw new Error("Please wait for your file upload to complete.");
      }

      // Solo participants and team leaders provide questionnaire responses
      if (isSolo || teamAction === "CREATE") {
        for (const field of event.customFields || []) {
          if (field.fieldType === "DISPLAY_IMAGE") continue;
          if (field.isRequired) {
            const val = responses[field.id];
            if (
              val === undefined ||
              val === null ||
              (typeof val === "string" && val.trim() === "") ||
              (Array.isArray(val) && val.length === 0)
            ) {
              throw new Error(`Please provide a response for "${field.label}"`);
            }
          }
        }
        payload.responses = responses;
      }

      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      alert("Registration Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTeam = async () => {
    if (!confirm("Are you sure you want to finalize and confirm this team roster?")) return;

    setConfirmingTeam(true);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONFIRM_TEAM" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm team");
      }

      alert("Team confirmed successfully!");
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setConfirmingTeam(false);
    }
  };

  // Render: Event Concluded
  if (isPast) {
    return (
      <div className="relative rounded-xl border border-border/50 bg-card/80 p-6 text-center shadow-lg backdrop-blur-md">
        <CircuitTrace corners={true} />
        <h3 className="font-bold font-space-grotesk text-base text-foreground mb-1">Event Concluded</h3>
        <p className="text-xs text-muted-foreground font-mono-tech uppercase tracking-wider">
          [ REGISTRATION_SESSION_EXPIRED ]
        </p>
      </div>
    );
  }

  // Render: Registrations Paused
  if (!event.registrationsAvailable && !isRegistered) {
    return (
      <div className="relative rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center shadow-lg backdrop-blur-md">
        <CircuitTrace corners={true} />
        <LockIcon className="w-6 h-6 mx-auto mb-2 text-amber-400" />
        <h3 className="font-bold font-space-grotesk text-base text-foreground mb-1">Registrations Paused</h3>
        <p className="text-xs text-muted-foreground font-space-grotesk">
          Registrations for this event are temporarily paused or will open when scheduled.
        </p>
      </div>
    );
  }

  // Render: Already Registered User
  if (isRegistered) {
    const members: any[] = userTeam?.registrations || [];
    const isLeader = session?.user?.id === userTeam?.leaderId;
    const isTeamConfirmed = userTeam?.status === "CONFIRMED";
    const minSize = event.minTeamSize || 1;
    const maxSize = event.maxTeamSize || 1;
    const hasMinMembers = members.length >= minSize;

    return (
      <div className="relative rounded-xl border border-brand/30 bg-card/85 p-6 shadow-xl backdrop-blur-md space-y-4">
        <CircuitTrace corners={true} />

        <div className="flex items-center gap-2.5 text-emerald-400 border-b border-brand/20 pb-3">
          <CheckCircle2Icon className="w-5 h-5 shrink-0" />
          <div>
            <h3 className="font-bold font-space-grotesk text-sm text-foreground uppercase tracking-wide">
              {isSolo ? "Solo Registration Confirmed" : "Registered for Event"}
            </h3>
            <p className="text-[10px] font-mono-tech text-emerald-400 uppercase">
              STATUS: {isSolo || isTeamConfirmed ? "CONFIRMED_ROSTER" : "PENDING_LEADER_CONFIRMATION"}
            </p>
          </div>
        </div>

        {!isSolo && userTeam && (
          <div className="space-y-4 pt-1">
            {/* Team Header Info */}
            <div className="bg-background/60 rounded-lg p-3.5 border border-brand/20 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold font-space-grotesk text-sm text-foreground">{userTeam.name || "Team"}</p>
                <span
                  className={`text-[10px] font-mono-tech uppercase font-bold px-2 py-0.5 rounded border ${
                    isTeamConfirmed
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  }`}
                >
                  {isTeamConfirmed ? "CONFIRMED" : "PENDING"}
                </span>
              </div>

              {userTeam.teamCode && (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-xs font-mono-tech text-muted-foreground">
                    TEAM_CODE:{" "}
                    <span className="font-bold text-brand-accent tracking-widest">{userTeam.teamCode}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(userTeam.teamCode)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono-tech text-gold hover:underline p-1 rounded hover:bg-gold/10 transition-colors"
                  >
                    {copiedCode ? <CheckIcon className="w-3 h-3 text-emerald-400" /> : <CopyIcon className="w-3 h-3" />}
                    {copiedCode ? "COPIED" : "COPY"}
                  </button>
                </div>
              )}
            </div>

            {/* Team Members Roster */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-tech uppercase text-muted-foreground">
                <span>Roster Units</span>
                <span>
                  {members.length} / {maxSize} Members
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {members.map((reg: any) => {
                  const isMemberLeader = userTeam.leaderId === reg.userId;
                  return (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-brand/15 bg-background/50 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-foreground truncate font-space-grotesk">
                          {reg.user?.displayName || reg.user?.name || "Student"}
                        </p>
                        <p className="text-[10px] font-mono-tech text-muted-foreground truncate">
                          {reg.user?.email}
                        </p>
                      </div>
                      {isMemberLeader && (
                        <span className="shrink-0 text-[9px] font-mono-tech uppercase font-bold bg-brand/20 text-brand-accent border border-brand/30 px-1.5 py-0.5 rounded">
                          LEADER
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Leader Confirmation Button */}
            {!isTeamConfirmed && (
              <div className="pt-2 border-t border-brand/20 space-y-2.5">
                {isLeader ? (
                  <>
                    <p className="text-xs font-space-grotesk text-muted-foreground leading-relaxed">
                      {hasMinMembers
                        ? `All team members joined! Click below to confirm and lock your team roster.`
                        : `Your team requires at least ${minSize} members to confirm. Share your team code above.`}
                    </p>

                    <button
                      onClick={handleConfirmTeam}
                      disabled={!hasMinMembers || confirmingTeam}
                      className={`w-full rounded-lg py-2.5 px-4 font-space-grotesk font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        hasMinMembers
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 cursor-pointer"
                          : "bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60"
                      }`}
                    >
                      <ShieldCheckIcon className="w-4 h-4" />
                      {confirmingTeam
                        ? "CONFIRMING_ROSTER..."
                        : hasMinMembers
                        ? "CONFIRM_TEAM_ROSTER"
                        : `NEED ${minSize - members.length} MORE MEMBER(S)`}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-space-grotesk text-muted-foreground bg-background/40 p-2.5 rounded-lg border border-brand/15">
                    <ClockIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Waiting for your team leader to review and finalize the team confirmation.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render: Not Signed In
  if (!session) {
    return (
      <div className="relative rounded-xl border border-brand/30 bg-card/85 p-6 text-center shadow-xl backdrop-blur-md space-y-4">
        <CircuitTrace corners={true} />
        <h3 className="font-bold font-space-grotesk text-base text-foreground">Want to participate?</h3>
        <p className="text-xs text-muted-foreground font-space-grotesk">
          Sign in with your college credentials to register for this event.
        </p>
        <Link
          href="/auth/signin"
          className="block w-full rounded-lg bg-brand py-2.5 text-center font-bold font-space-grotesk text-xs uppercase tracking-wider text-white shadow-md transition-all hover:bg-brand/90"
        >
          [ SIGN_IN_TO_REGISTER ]
        </Link>
      </div>
    );
  }

  const showCustomFields = (isSolo || teamAction === "CREATE") && event.customFields && event.customFields.length > 0;

  return (
    <>
      {/* Ready to Participate Technical Card */}
      <div className="relative rounded-xl border border-brand/30 bg-card/85 p-6 text-center shadow-xl backdrop-blur-md space-y-4">
        <CircuitTrace corners={true} />
        <h3 className="font-bold font-space-grotesk text-base text-foreground">Ready to participate?</h3>
        <p className="text-xs text-muted-foreground font-space-grotesk">
          {isSolo ? "Secure your individual registration spot now." : "Create your team or join with an invite code."}
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full rounded-lg bg-brand py-3 font-bold font-space-grotesk text-xs uppercase tracking-wider text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand/90 hover:scale-[1.01] cursor-pointer"
        >
          [ REGISTER_NOW ]
        </button>
      </div>

      {/* Registration Modal: Square Technical Blueprint Styling */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-xl border border-brand/30 bg-card p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-blueprint-grid">
            <CircuitTrace corners={true} />

            <div className="relative z-10 space-y-6">
              <div className="border-b border-brand/20 pb-3">
                <span className="text-[10px] font-mono-tech text-gold uppercase tracking-widest block">
                  REGISTRATION_PROTOCOL // {event.type}
                </span>
                <h2 className="text-xl font-bold font-space-grotesk text-foreground">{event.title}</h2>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                {!isSolo && (
                  <div className="space-y-4">
                    {/* Square Action Toggle */}
                    <div className="flex rounded-lg bg-background/60 p-1 border border-brand/20">
                      <button
                        type="button"
                        className={`flex-1 rounded-md py-2 text-xs font-bold font-space-grotesk uppercase tracking-wider transition-colors ${
                          teamAction === "CREATE"
                            ? "bg-brand/20 text-brand-accent border border-brand/30 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setTeamAction("CREATE")}
                      >
                        Create Team (Leader)
                      </button>
                      <button
                        type="button"
                        className={`flex-1 rounded-md py-2 text-xs font-bold font-space-grotesk uppercase tracking-wider transition-colors ${
                          teamAction === "JOIN"
                            ? "bg-brand/20 text-brand-accent border border-brand/30 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setTeamAction("JOIN")}
                      >
                        Join Team (Code)
                      </button>
                    </div>

                    {teamAction === "CREATE" ? (
                      <div>
                        <label className="block text-xs font-mono-tech text-muted-foreground uppercase mb-1">
                          Team Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. Neural Ninjas"
                          className="w-full rounded-lg border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent font-space-grotesk"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-mono-tech text-muted-foreground uppercase mb-1">
                          Team Code *
                        </label>
                        <input
                          required
                          type="text"
                          value={teamCode}
                          onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                          placeholder="Enter 6-digit team code"
                          className="w-full rounded-lg border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground font-mono-tech uppercase tracking-widest outline-none focus:border-brand-accent"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic Custom Fields */}
                {showCustomFields && (
                  <div className="space-y-4 pt-4 border-t border-brand/20">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-brand-accent rounded-xs" />
                      <h4 className="font-bold font-space-grotesk text-xs uppercase tracking-wider text-foreground">
                        Event Questionnaire
                      </h4>
                    </div>

                    {event.customFields.map((field: any) => {
                      const opts = field.options || {};

                      return (
                        <div key={field.id} className="space-y-1.5">
                          <label className="block text-xs font-mono-tech text-muted-foreground uppercase">
                            {field.label} {field.isRequired && field.fieldType !== "DISPLAY_IMAGE" && <span className="text-red-400">*</span>}
                            {field.fieldType === "NUMBER" && (opts.min !== null || opts.max !== null) && (
                              <span className="text-[10px] text-muted-foreground/80 normal-case ml-1">
                                ({opts.min !== null && `Min: ${opts.min}`}
                                {opts.min !== null && opts.max !== null && " - "}
                                {opts.max !== null && `Max: ${opts.max}`})
                              </span>
                            )}
                          </label>

                          {field.fieldType === "DISPLAY_IMAGE" && (
                            <div className="rounded-xl border border-brand/20 bg-background/50 p-4 space-y-2">
                              {opts.imageUrl ? (
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <div className="relative group max-w-xs overflow-hidden rounded-lg border border-brand/30 bg-white p-2 shadow-sm">
                                    <img
                                      src={opts.imageUrl}
                                      alt={field.label || "QR / Info Image"}
                                      className="max-h-56 max-w-full object-contain mx-auto"
                                    />
                                    <a
                                      href={opts.imageUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-mono-tech"
                                    >
                                      Open full size ↗
                                    </a>
                                  </div>
                                  {opts.caption && (
                                    <p className="text-xs font-mono-tech text-muted-foreground text-center max-w-sm mt-1">
                                      {opts.caption}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground font-mono-tech italic text-center">
                                  No image provided.
                                </p>
                              )}
                            </div>
                          )}

                          {field.fieldType === "FILE_UPLOAD" && (
                            <div className="space-y-2">
                              {responses[field.id] ? (
                                <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <CheckCircle2Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <a
                                      href={responses[field.id]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-mono-tech text-emerald-300 underline truncate"
                                    >
                                      File Uploaded (View ↗)
                                    </a>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setResponses({ ...responses, [field.id]: "" })}
                                    className="text-xs text-red-400 hover:underline shrink-0 ml-2 font-mono-tech cursor-pointer"
                                  >
                                    Replace
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="file"
                                    required={field.isRequired}
                                    accept="image/*,application/pdf"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleFileUpload(field.id, e.target.files[0]);
                                      }
                                    }}
                                    className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand/20 file:text-brand-accent hover:file:bg-brand/30 cursor-pointer border border-brand/30 rounded-lg p-1.5 bg-background/70 font-space-grotesk text-foreground"
                                  />
                                  {uploadingFiles[field.id] && (
                                    <span className="text-xs text-gold font-mono-tech animate-pulse shrink-0">
                                      UPLOADING...
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {field.fieldType === "TEXT" && (
                            <input
                              type="text"
                              required={field.isRequired}
                              className="w-full rounded-lg border border-brand/30 bg-background/70 px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent font-space-grotesk"
                              value={responses[field.id] || ""}
                              onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                              placeholder="Enter your response"
                            />
                          )}

                          {field.fieldType === "TEXTAREA" && (
                            <textarea
                              required={field.isRequired}
                              rows={3}
                              className="w-full rounded-lg border border-brand/30 bg-background/70 px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent font-space-grotesk"
                              value={responses[field.id] || ""}
                              onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                              placeholder="Provide details..."
                            />
                          )}

                          {field.fieldType === "NUMBER" && (
                            <input
                              type="number"
                              required={field.isRequired}
                              min={opts.min !== null && opts.min !== undefined ? opts.min : undefined}
                              max={opts.max !== null && opts.max !== undefined ? opts.max : undefined}
                              className="w-full rounded-lg border border-brand/30 bg-background/70 px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent font-space-grotesk"
                              value={responses[field.id] ?? ""}
                              onChange={(e) =>
                                setResponses({
                                  ...responses,
                                  [field.id]: e.target.value !== "" ? Number(e.target.value) : "",
                                })
                              }
                              placeholder="Enter number..."
                            />
                          )}

                          {field.fieldType === "SELECT" && (
                            <select
                              required={field.isRequired}
                              className="w-full rounded-lg border border-brand/30 bg-card px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent font-space-grotesk"
                              value={responses[field.id] || ""}
                              onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                            >
                              <option value="">Select an option</option>
                              {(Array.isArray(field.options) ? field.options : []).map((opt: string) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}

                          {field.fieldType === "MULTI_SELECT" && (
                            <div className="space-y-1.5 rounded-lg border border-brand/20 bg-background/50 p-3">
                              {(Array.isArray(field.options) ? field.options : []).map((opt: string) => {
                                const selected: string[] = Array.isArray(responses[field.id]) ? responses[field.id] : [];
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
                                        setResponses({ ...responses, [field.id]: next });
                                      }}
                                      className="rounded border-brand/30 text-brand focus:ring-brand-accent"
                                    />
                                    {opt}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-brand/20">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded-lg border border-brand/30 bg-background/60 py-2.5 font-space-grotesk font-semibold text-xs text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-brand py-2.5 font-space-grotesk font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-brand/20 hover:bg-brand/90 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loading ? "Processing..." : "Complete Registration"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
