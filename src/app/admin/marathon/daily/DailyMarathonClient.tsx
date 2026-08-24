"use client";

import { useState } from "react";

export default function DailyMarathonClient({ initialContests, aimlUsers }: { initialContests: any[], aimlUsers: any[] }) {
  const [activeTab, setActiveTab] = useState<"CONTESTS" | "SCORES">("CONTESTS");
  
  // Contests State
  const [contests] = useState(initialContests);
  const [dayNumber, setDayNumber] = useState(1);
  const [targetYear, setTargetYear] = useState(2);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  // Scores State
  const [selectedContest, setSelectedContest] = useState("");
  const [scoreLoading, setScoreLoading] = useState(false);
  const [fetchedLeaderboard, setFetchedLeaderboard] = useState<any[] | null>(null);
  const [unmatchedUsernames, setUnmatchedUsernames] = useState<string[]>([]);
  const [editingSlug, setEditingSlug] = useState(false);
  const [editSlugValue, setEditSlugValue] = useState("");

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/marathon/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayNumber, targetYear, date, title, description, link, slug }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      alert("Daily Contest added successfully");
      window.location.reload();
    } catch (err: any) {
      alert("Error adding contest: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      {activeTab === "CONTESTS" && (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Upcoming Contests Timetable</h3>
            </div>
            {contests.length === 0 ? (
              <p className="text-muted-foreground">No contests scheduled yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border/50 bg-background/80 shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date & Time</th>
                      <th className="px-4 py-3 font-semibold">Day / Year</th>
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {contests.map((contest) => {
                      const dateObj = new Date(contest.date);
                      const isPast = dateObj < new Date();
                      
                      return (
                        <tr 
                          key={contest.id} 
                          onClick={() => { setActiveTab("SCORES"); setSelectedContest(contest.id); }}
                          className={`cursor-pointer transition-colors hover:bg-muted/40 ${isPast ? "opacity-75" : ""}`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-foreground">{dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span className="block text-xs text-muted-foreground">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-block px-2 py-1 bg-brand/10 text-brand font-bold text-xs rounded">Day {contest.dayNumber} ({dateObj.toLocaleDateString(undefined, { weekday: 'long' })})</span>
                            <span className="ml-2 text-xs font-semibold text-muted-foreground">Year {contest.targetYear}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate" title={contest.title}>
                            {contest.title}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {contest.isConfirmed ? (
                              <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold border border-green-500/20">PUBLISHED</span>
                            ) : isPast ? (
                              <span className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded text-xs font-bold border border-amber-500/20">PENDING SYNC</span>
                            ) : (
                              <span className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">SCHEDULED</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <a href={contest.link} target="_blank" rel="noreferrer" className="text-brand hover:underline font-medium text-xs">Link ↗</a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <form onSubmit={handleCreateContest} className="sticky top-24 space-y-6 rounded-2xl border border-border/50 bg-background/80 p-6 shadow-xl">
              <h3 className="text-xl font-bold border-b border-border/50 pb-2">Add New Contest</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Day Number *</label>
                  <input required type="number" min={1} value={dayNumber} onChange={e => setDayNumber(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-4 py-2" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Target Year *</label>
                  <select required value={targetYear} onChange={e => setTargetYear(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-4 py-2">
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Release Date * (5:30 AM IST)</label>
                <input required type="date" value={date.split("T")[0] || ""} onChange={e => setDate(e.target.value + "T00:00:00.000Z")} className="w-full rounded-lg border border-border bg-background px-4 py-2" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Title *</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Contest Link (HackerRank URL) *</label>
                <input required type="url" value={link} onChange={e => {
                  setLink(e.target.value);
                  if (!slug) {
                    const extracted = e.target.value.split("/contests/")[1]?.split("/")[0] || e.target.value.split("/").pop();
                    if (extracted) setSlug(extracted);
                  }
                }} className="w-full rounded-lg border border-border bg-background px-4 py-2" />
              </div>
              
              <div>
                <label className="mb-1.5 block text-sm font-medium">HackerRank Slug (Auto-extracted or Manual)</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2" placeholder="dsa-sprint-day-1" />
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand px-6 py-3 text-center font-semibold text-white hover:bg-brand/90 disabled:opacity-50">
                {loading ? "Adding..." : "Add Daily Contest"}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "SCORES" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-background/80 p-6 shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => { setActiveTab("CONTESTS"); setSelectedContest(""); }} className="text-sm font-medium text-muted-foreground hover:text-foreground">&larr; Back to Contests</button>
                <h3 className="text-xl font-bold border-b border-border/50 pb-2 flex-1">HackerRank Sync</h3>
              </div>
              
              <div className="space-y-4">
                {selectedContest && (() => {
                  const contest = contests.find(c => c.id === selectedContest);
                  const displaySlug = contest?.slug || contest?.link?.split("/contests/")[1]?.split("/")[0] || contest?.link?.split("/").pop() || "Unknown";
                  return (
                    <div className="rounded-lg bg-brand/10 p-4 border border-brand/20">
                      <p className="font-bold text-brand">Syncing Contest:</p>
                      <p className="text-sm text-foreground">{contest?.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground font-mono">
                          Slug: {displaySlug}
                        </p>
                        <button 
                          onClick={() => { setEditingSlug(true); setEditSlugValue(contest?.slug || ""); }}
                          className="text-xs bg-brand/20 text-brand px-2 py-0.5 rounded hover:bg-brand/30"
                        >
                          Edit
                        </button>
                      </div>
                      
                      {editingSlug && (
                        <div className="mt-2 flex gap-2">
                          <input 
                            type="text" 
                            value={editSlugValue} 
                            onChange={(e) => setEditSlugValue(e.target.value)} 
                            className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs" 
                            placeholder="Enter new slug"
                          />
                          <button 
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/admin/marathon/daily/${selectedContest}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ slug: editSlugValue }),
                                });
                                if (!res.ok) throw new Error("Failed to update");
                                alert("Slug updated!");
                                window.location.reload();
                              } catch (e: any) {
                                alert(e.message);
                              }
                            }}
                            className="bg-brand text-white text-xs px-2 py-1 rounded"
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingSlug(false)} className="text-muted-foreground text-xs px-2 py-1">Cancel</button>
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                <div>
                  <label className="mb-1.5 block text-sm font-medium">HackerRank Cookie String *</label>
                  <input type="text" id="hrCookie" placeholder="hr_submissions_kind=all; hackerrank_mixpanel..." className="w-full rounded-lg border border-border bg-background px-4 py-2" />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      if (!selectedContest) return alert("Select a contest first");
                      const contest = contests.find(c => c.id === selectedContest);
                      const contestSlug = contest?.slug || contest?.link?.split("/contests/")[1]?.split("/")[0] || contest?.link?.split("/").pop();
                      const cookieString = (document.getElementById("hrCookie") as HTMLInputElement).value;
                      if (!contestSlug || !cookieString) return alert("Missing slug or cookie. Ensure link is valid.");
                      
                      setScoreLoading(true);
                      setFetchedLeaderboard(null);
                      setUnmatchedUsernames([]);
                      try {
                        const res = await fetch("/api/admin/marathon/daily/sync", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ contestId: selectedContest, contestSlug, cookieString }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error);
                        
                        setFetchedLeaderboard(data.leaderboard);
                        setUnmatchedUsernames(data.unmatchedUsernames);
                        alert(`Fetched ${data.fetchedCount} users! Check the preview before publishing.`);
                      } catch (err: any) {
                        alert("Sync Error: " + err.message);
                      } finally {
                        setScoreLoading(false);
                      }
                    }}
                    disabled={scoreLoading || !selectedContest} 
                    className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Fetch Leaderboard
                  </button>
                  <button 
                    onClick={async () => {
                      if (!selectedContest) return alert("Select a contest first");
                      if (!confirm("Are you sure? This will add these scores to the students' global total.")) return;
                      
                      setScoreLoading(true);
                      try {
                        const res = await fetch("/api/admin/marathon/daily/confirm", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ contestId: selectedContest }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error);
                        alert(`Successfully confirmed and published ${data.updatedCount} scores!`);
                        window.location.reload();
                      } catch (err: any) {
                        alert("Confirm Error: " + err.message);
                      } finally {
                        setScoreLoading(false);
                      }
                    }}
                    disabled={scoreLoading || !selectedContest || !fetchedLeaderboard || contests.find(c => c.id === selectedContest)?.isConfirmed} 
                    className="flex-1 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Confirm & Publish
                  </button>
                </div>
                
                {unmatchedUsernames.length > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="font-bold text-amber-500 text-sm mb-2">Unmatched HackerRank Usernames ({unmatchedUsernames.length}):</p>
                    <p className="text-xs text-muted-foreground">These usernames participated but are not linked to any 2nd/3rd year AIML student on TASC.</p>
                    <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                      {unmatchedUsernames.map(u => (
                        <span key={u} className="bg-background px-2 py-1 rounded text-xs border border-border/50">{u}</span>
                      ))}
                    </div>
                  </div>
                )}

                {fetchedLeaderboard && (
                  <div className="rounded-xl border border-border/50 bg-background/50 overflow-hidden mt-4">
                    <div className="bg-muted p-3 border-b border-border/50 flex justify-between items-center">
                      <h4 className="font-bold text-sm">Leaderboard Preview</h4>
                      <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded-full font-bold">{fetchedLeaderboard.filter(x => x.matched).length} matched</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/30 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 font-semibold text-xs">Rank</th>
                            <th className="px-3 py-2 font-semibold text-xs">Username</th>
                            <th className="px-3 py-2 font-semibold text-xs">Score</th>
                            <th className="px-3 py-2 font-semibold text-xs">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {fetchedLeaderboard.map((hr, idx) => (
                            <tr key={hr.hacker} className={hr.matched ? "bg-green-500/5" : "bg-red-500/5 opacity-70"}>
                              <td className="px-3 py-2">{idx + 1}</td>
                              <td className="px-3 py-2 font-mono text-xs">{hr.hacker}</td>
                              <td className="px-3 py-2 font-bold">{hr.score}</td>
                              <td className="px-3 py-2 text-xs font-semibold">
                                {hr.matched ? <span className="text-green-500">Matched</span> : <span className="text-red-500">Unlinked</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/80 p-6">
            <div className="flex justify-between items-center border-b border-border/50 pb-2 mb-4">
              <h3 className="text-xl font-bold">Current Global Leaderboard</h3>
              <button 
                onClick={() => {
                  const csv = ["Rank,Name,USN,Email,Year,Total Score,Streak"];
                  aimlUsers.forEach((u, i) => {
                    csv.push(`${i+1},"${u.name || ''}","${u.usn || ''}","${u.email}","${u.year || ''}","${u.marathonTotalScore}","${u.marathonStreak}"`);
                  });
                  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `daily-leaderboard-${new Date().toISOString().split("T")[0]}.csv`;
                  a.click();
                }}
                className="text-xs font-semibold bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg border border-border/50"
              >
                Export CSV
              </button>
            </div>
            <div className="space-y-3">
              {aimlUsers.slice(0, 15).map((u, i) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div>
                      <p className="font-semibold text-sm">{u.name} (Yr {u.year})</p>
                      <p className="text-xs text-muted-foreground">{u.usn} | HR: {u.hackerrankUsername || 'none'}</p>
                    </div>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="font-bold text-brand">{u.marathonTotalScore} pts</p>
                    <p className="text-xs font-medium text-amber-500">🔥 {u.marathonStreak}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
