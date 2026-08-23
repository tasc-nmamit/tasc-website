"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockIcon, CheckCircle2Icon, UsersIcon } from "lucide-react";

export default function EventRegistrationClient({
  event,
  session,
  isRegistered,
  userTeam,
  isPast,
}: {
  event: any;
  session: any;
  isRegistered: boolean;
  userTeam: any;
  isPast: boolean;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Team Registration States
  const [teamAction, setTeamAction] = useState<"CREATE" | "JOIN">("CREATE");
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");

  // Custom Fields Responses
  const [responses, setResponses] = useState<Record<string, any>>({});

  const isSolo = event.type === "SOLO";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        action: isSolo ? undefined : teamAction,
        teamName: isSolo ? undefined : teamAction === "CREATE" ? teamName : undefined,
        teamCode: isSolo ? undefined : teamAction === "JOIN" ? teamCode : undefined,
        responses,
      };

      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register");

      alert(data.teamCode ? `Registered! Your Team Code is: ${data.teamCode}. Share this with teammates.` : "Successfully registered!");
      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render Logic
  if (isPast) {
    return (
      <div className="rounded-2xl border border-border/50 bg-background/80 p-6 text-center shadow-lg">
        <h3 className="font-bold text-lg mb-2">Event Concluded</h3>
        <p className="text-sm text-muted-foreground">This event has already taken place.</p>
      </div>
    );
  }

  if (!event.registrationsAvailable && !isRegistered) {
    return (
      <div className="rounded-2xl border border-border/50 bg-background/80 p-6 text-center shadow-lg">
        <LockIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-bold text-lg mb-1">Registrations Closed</h3>
        <p className="text-sm text-muted-foreground">We are no longer accepting registrations for this event.</p>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 shadow-lg">
        <div className="flex items-center justify-center gap-2 text-green-500 mb-4">
          <CheckCircle2Icon className="w-6 h-6" />
          <h3 className="font-bold text-lg">You're Registered!</h3>
        </div>
        {!isSolo && userTeam && (
          <div className="bg-background rounded-xl p-4 border border-border/50 mt-4 text-center space-y-2">
            <UsersIcon className="w-5 h-5 mx-auto text-brand" />
            <p className="font-semibold">{userTeam.name}</p>
            {userTeam.teamCode && (
              <div className="text-sm">
                <span className="text-muted-foreground">Team Code: </span>
                <code className="bg-muted px-2 py-1 rounded font-bold text-brand">{userTeam.teamCode}</code>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Status: <span className="font-bold">{userTeam.status}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-2xl border border-border/50 bg-background/80 p-6 text-center shadow-lg">
        <h3 className="font-bold text-lg mb-3">Want to participate?</h3>
        <Link href="/auth/signin" className="block w-full rounded-xl bg-brand py-3 text-center font-bold text-white shadow-md transition-all hover:bg-brand/90 hover:scale-[1.02]">
          Sign In to Register
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-border/50 bg-background/80 p-6 text-center shadow-lg">
        <h3 className="font-bold text-lg mb-4">Ready to participate?</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full rounded-xl bg-brand py-3 font-bold text-white shadow-md transition-all hover:bg-brand/90 hover:scale-[1.02]"
        >
          Register Now
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Event Registration</h2>

            <form onSubmit={handleRegister} className="space-y-6">
              {!isSolo && (
                <div className="space-y-4">
                  <div className="flex rounded-lg bg-muted p-1">
                    <button
                      type="button"
                      className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${teamAction === "CREATE" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => setTeamAction("CREATE")}
                    >
                      Create Team
                    </button>
                    <button
                      type="button"
                      className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${teamAction === "JOIN" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => setTeamAction("JOIN")}
                    >
                      Join Team
                    </button>
                  </div>

                  {teamAction === "CREATE" ? (
                    <div>
                      <label className="mb-1 block text-sm font-medium">Team Name *</label>
                      <input
                        required
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
                        placeholder="Choose a cool name"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1 block text-sm font-medium">Team Code *</label>
                      <input
                        required
                        type="text"
                        value={teamCode}
                        onChange={(e) => setTeamCode(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
                        placeholder="Enter code from team leader"
                      />
                    </div>
                  )}
                </div>
              )}

              {event.customFields && event.customFields.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="font-semibold">Additional Details</h3>
                  {event.customFields.map((field: any) => (
                    <div key={field.id}>
                      <label className="mb-1 block text-sm font-medium">
                        {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                      </label>
                      {field.fieldType === "TEXT" && (
                        <input
                          type="text"
                          required={field.isRequired}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
                          onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                        />
                      )}
                      {field.fieldType === "TEXTAREA" && (
                        <textarea
                          required={field.isRequired}
                          rows={3}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
                          onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                        />
                      )}
                      {field.fieldType === "NUMBER" && (
                        <input
                          type="number"
                          required={field.isRequired}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
                          onChange={(e) => setResponses({ ...responses, [field.id]: Number(e.target.value) })}
                        />
                      )}
                      {field.fieldType === "SELECT" && (
                        <select
                          required={field.isRequired}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
                          onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                        >
                          <option value="">Select an option</option>
                          {field.options?.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {error && <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

              <div className="flex gap-3 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-border bg-background py-3 font-semibold transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white shadow-md transition-all hover:bg-brand/90 disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
