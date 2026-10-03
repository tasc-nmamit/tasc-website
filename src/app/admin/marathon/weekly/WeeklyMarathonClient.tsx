"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function WeeklyMarathonClient({ initialContests, aimlUsers }: { initialContests: any[], aimlUsers: any[] }) {
  const [activeTab, setActiveTab] = useState<"CONTESTS" | "SCORES">("CONTESTS");
  
  // Contests State
  const [contests] = useState(initialContests);
  const [weekNumber, setWeekNumber] = useState(1);
  const [targetYear, setTargetYear] = useState(2);
  const [date, setDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [slug, setSlug] = useState("");
  const [quizLink, setQuizLink] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit/Delete Contest State
  const [editingContestId, setEditingContestId] = useState("");
  const [editContestDate, setEditContestDate] = useState("");
  const [editContestDeadline, setEditContestDeadline] = useState("");

  // Scores State
  const [selectedContest, setSelectedContest] = useState("");
  const [scoreLoading, setScoreLoading] = useState(false);
  const [fetchedLeaderboard, setFetchedLeaderboard] = useState<any[] | null>(null);
  const [unmatchedUsernames, setUnmatchedUsernames] = useState<string[]>([]);
  const [editingSlug, setEditingSlug] = useState(false);
  const [editSlugValue, setEditSlugValue] = useState("");
  
  const [contestScores, setContestScores] = useState<any[]>([]);
  const [editingScoreId, setEditingScoreId] = useState("");
  const [editQuizScore, setEditQuizScore] = useState(0);
  const [editContestScore, setEditContestScore] = useState(0);

  useEffect(() => {
    if (selectedContest && activeTab === "SCORES") {
      fetch(`/api/admin/marathon/weekly/${selectedContest}/scores`)
        .then(res => res.json())
        .then(data => {
          if (data.scores) setContestScores(data.scores);
        });
    }
  }, [selectedContest, activeTab]);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedContest) return;
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const scores: any[] = [];
        results.data.forEach((row: any) => {
          const keys = Object.keys(row);
          // Look for 'mail' or 'email' or fallback to the first key
          const emailKey = keys.find(k => k.toLowerCase().includes("mail") || k.toLowerCase().includes("email")) || keys[0];
          const scoreKey = keys.find(k => k.toLowerCase().includes("score")) || keys[1] || "";
          
          if (row[emailKey] && row[scoreKey] !== undefined) {
            let rawScore = row[scoreKey].toString();
            if (rawScore.includes('/')) {
              rawScore = rawScore.split('/')[0].trim();
            }
            const score = parseFloat(rawScore);
            if (!isNaN(score)) {
              scores.push({ email: row[emailKey], score });
            }
          }
        });

        if (scores.length === 0) {
          alert("Could not parse any scores from the CSV. Ensure there is an email and score column.");
          return;
        }

        if (!confirm(`Found ${scores.length} scores. Upload to backend?`)) return;
        
        setScoreLoading(true);
        try {
          const res = await fetch(`/api/admin/marathon/weekly/upload-quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contestId: selectedContest, scores }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          alert(`Successfully updated ${data.matchedCount} quiz scores! ${data.unmatchedEmails?.length > 0 ? 'Some emails were not matched.' : ''}`);
          // Refresh scores
          const scoresRes = await fetch(`/api/admin/marathon/weekly/${selectedContest}/scores`);
          const scoresData = await scoresRes.json();
          if (scoresData.scores) setContestScores(scoresData.scores);
        } catch (err: any) {
          alert("Upload Error: " + err.message);
        } finally {
          setScoreLoading(false);
          e.target.value = ''; // reset file input
        }
      }
    });
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/marathon/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekNumber, targetYear, date, deadline, title, description, link, slug, quizLink }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      alert("Weekly Contest added successfully");
      window.location.reload();
    } catch (err: any) {
      alert("Error adding contest: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContestTimings = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/marathon/weekly/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: editContestDate, deadline: editContestDeadline }),
      });
      if (!res.ok) throw new Error("Failed to update");
      alert("Timings updated successfully");
      window.location.reload();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleDeleteContest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contest? If it's published, points will be deducted from students!")) return;
    try {
      const res = await fetch(`/api/admin/marathon/weekly/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      alert("Contest deleted");
      window.location.reload();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div>

      {activeTab === "CONTESTS" && (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Upcoming Sprints Timetable</h3>
            </div>
            {contests.length === 0 ? (
              <p className="text-muted-foreground">No sprints scheduled yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border/50 bg-background/80 shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Start & End Date</th>
                      <th className="px-4 py-3 font-semibold">Week / Year</th>
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {contests.map((contest) => {
                      const startDate = new Date(contest.date);
                      const endDate = new Date(contest.deadline);
                      const isPast = endDate < new Date();
                      
                      return (
                        <tr 
                          key={contest.id} 
                          onClick={() => { if (editingContestId !== contest.id) { setActiveTab("SCORES"); setSelectedContest(contest.id); } }}
                          className={`cursor-pointer transition-colors hover:bg-muted/40 ${isPast ? "opacity-75" : ""}`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            {editingContestId === contest.id ? (
                              <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                                <input type="datetime-local" value={editContestDate} onChange={e => setEditContestDate(e.target.value)} className="text-xs p-1 border rounded text-foreground bg-background" />
                                <input type="datetime-local" value={editContestDeadline} onChange={e => setEditContestDeadline(e.target.value)} className="text-xs p-1 border rounded text-red-500 bg-background" />
                                <div className="flex gap-2 mt-1">
                                  <button onClick={() => handleSaveContestTimings(contest.id)} className="text-green-500 text-xs font-bold hover:underline">Save</button>
                                  <button onClick={() => setEditingContestId("")} className="text-muted-foreground text-xs font-bold hover:underline">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="font-medium text-foreground">{startDate.toLocaleDateString()}</span>
                                <span className="block text-xs text-red-400 mt-1 bg-red-400/10 px-1 py-0.5 rounded w-fit">Ends {endDate.toLocaleDateString()}</span>
                              </>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-block px-2 py-1 bg-purple-500/10 text-purple-500 font-bold text-xs rounded">Week {contest.weekNumber}</span>
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
                          <td className="px-4 py-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                            <a href={contest.link} target="_blank" rel="noreferrer" className="text-brand hover:underline font-medium text-xs">Link ↗</a>
                            <button onClick={() => { setEditingContestId(contest.id); setEditContestDate(new Date(new Date(contest.date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16)); setEditContestDeadline(new Date(new Date(contest.deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16)); }} className="ml-3 text-blue-500 hover:underline text-xs">Edit</button>
                            <button onClick={() => handleDeleteContest(contest.id)} className="ml-3 text-red-500 hover:underline text-xs">Delete</button>
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
                  <label className="mb-1.5 block text-sm font-medium">Week Number *</label>
                  <input required type="number" min={1} value={weekNumber} onChange={e => setWeekNumber(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-4 py-2" />
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
                <label className="mb-1.5 block text-sm font-medium">Start Date & Time *</label>
                <input required type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Deadline *</label>
                <input required type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2" />
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
                <label className="mb-1.5 block text-sm font-medium">Aptitude Quiz Link (Google Form)</label>
                <input type="url" value={quizLink} onChange={e => setQuizLink(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2" placeholder="https://forms.gle/..." />
              </div>
              
              <div>
                <label className="mb-1.5 block text-sm font-medium">HackerRank Slug (Auto-extracted or Manual)</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2" placeholder="dsa-sprint-week-1" />
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand px-6 py-3 text-center font-semibold text-white hover:bg-brand/90 disabled:opacity-50">
                {loading ? "Adding..." : "Add Weekly Contest"}
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
                                const res = await fetch(`/api/admin/marathon/weekly/${selectedContest}`, {
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
                
                <div className="border border-border/50 rounded-xl p-4 bg-muted/20">
                  <h4 className="font-bold text-sm mb-2">1. Upload Aptitude Quiz CSV</h4>
                  <p className="text-xs text-muted-foreground mb-4">Upload the Google Form CSV. It will automatically parse the scores.</p>
                  <input type="file" accept=".csv" onChange={handleCsvUpload} disabled={scoreLoading} className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20" />
                </div>
                
                <div className="border border-border/50 rounded-xl p-4 bg-muted/20 space-y-4">
                  <h4 className="font-bold text-sm">2. Fetch HackerRank Scores</h4>
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
                        const res = await fetch("/api/admin/marathon/weekly/sync", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ contestId: selectedContest, contestSlug, cookieString }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error);
                        
                        setFetchedLeaderboard(data.leaderboard);
                        setUnmatchedUsernames(data.unmatchedUsernames);
                        alert(`Fetched ${data.fetchedCount} users!`);
                        const scoresRes = await fetch(`/api/admin/marathon/weekly/${selectedContest}/scores`);
                        const scoresData = await scoresRes.json();
                        if (scoresData.scores) setContestScores(scoresData.scores);
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
                        const res = await fetch("/api/admin/marathon/weekly/confirm", {
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
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/80 p-6">
            <div className="flex justify-between items-center border-b border-border/50 pb-2 mb-4">
              <h3 className="text-xl font-bold">Contest Specific Scores</h3>
              <button 
                onClick={() => {
                  const csv = ["Rank,Name,USN,Email,Year,Quiz Score,Contest Score,Total Score"];
                  contestScores.forEach((s, i) => {
                    csv.push(`${i+1},"${s.user?.name || ''}","${s.user?.usn || ''}","${s.user?.email || ''}","${s.user?.year || ''}","${s.quizScore}","${s.contestScore}","${s.score}"`);
                  });
                  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `contest-scores-${selectedContest}.csv`;
                  a.click();
                }}
                className="text-xs font-semibold bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg border border-border/50"
              >
                Export CSV
              </button>
            </div>
            {contestScores.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scores recorded for this contest yet. Upload CSV or fetch from HackerRank.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {contestScores.map((s, i) => (
                  <div key={s.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-muted-foreground w-4">{i + 1}</span>
                        <div>
                          <p className="font-semibold text-sm">{s.user?.name} (Yr {s.user?.year})</p>
                          <p className="text-xs text-muted-foreground">{s.user?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand">{s.score} pts</p>
                      </div>
                    </div>
                    {editingScoreId === s.id ? (
                      <div className="flex items-center gap-2 mt-2 bg-background p-2 rounded-lg border border-border">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground block mb-1">Quiz Score</label>
                          <input type="number" value={editQuizScore} onChange={e => setEditQuizScore(Number(e.target.value))} className="w-full text-xs px-2 py-1 rounded border border-border bg-muted/50" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground block mb-1">Contest Score</label>
                          <input type="number" value={editContestScore} onChange={e => setEditContestScore(Number(e.target.value))} className="w-full text-xs px-2 py-1 rounded border border-border bg-muted/50" />
                        </div>
                        <div className="flex flex-col gap-1 mt-4">
                          <button 
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/admin/marathon/weekly/${selectedContest}/scores`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ scoreId: s.id, quizScore: editQuizScore, contestScore: editContestScore })
                                });
                                if (!res.ok) throw new Error("Failed to update");
                                const data = await res.json();
                                setContestScores(prev => prev.map(item => item.id === s.id ? { ...item, ...data.score } : item));
                                setEditingScoreId("");
                              } catch (e: any) {
                                alert("Failed to update score");
                              }
                            }}
                            className="bg-brand text-white px-2 py-1 text-xs rounded font-medium"
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingScoreId("")} className="text-muted-foreground text-xs px-2 py-1 bg-muted rounded">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-xs mt-2 bg-background/50 rounded p-1.5 px-3">
                        <div className="flex gap-4">
                          <span className="text-muted-foreground">Quiz: <span className="font-semibold text-foreground">{s.quizScore}</span></span>
                          <span className="text-muted-foreground">HR: <span className="font-semibold text-foreground">{s.contestScore}</span></span>
                        </div>
                        <button 
                          onClick={() => { setEditingScoreId(s.id); setEditQuizScore(s.quizScore); setEditContestScore(s.contestScore); }}
                          className="text-brand hover:underline font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
