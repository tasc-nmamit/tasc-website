"use client";

import { useState } from "react";

export default function AdminAnnouncementsClient({ initialAnnouncements }: { initialAnnouncements: any[] }) {
  const [activeTab, setActiveTab] = useState<"LIST" | "CREATE">("LIST");
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? `/api/admin/announcements/${editingId}` : "/api/admin/announcements";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, published }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert(`Announcement ${editingId ? "updated" : "created"} successfully`);
      window.location.reload();
    } catch (err) {
      alert(`Error ${editingId ? "updating" : "creating"} announcement: ` + err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setAnnouncements(announcements.filter(a => a.id !== id));
      alert("Announcement deleted.");
    } catch (err) {
      alert("Error deleting announcement.");
    }
  };

  const handleEdit = (announcement: any) => {
    setTitle(announcement.title);
    setContent(announcement.content);
    setPublished(announcement.published);
    setEditingId(announcement.id);
    setActiveTab("CREATE");
  };

  return (
    <div>
      <div className="mb-6 flex gap-4 border-b border-border/50 pb-4">
        <button
          onClick={() => { setActiveTab("LIST"); setEditingId(null); setTitle(""); setContent(""); setPublished(true); }}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "LIST" ? "text-brand border-b-2 border-brand" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Manage Announcements
        </button>
        <button
          onClick={() => setActiveTab("CREATE")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "CREATE" ? "text-brand border-b-2 border-brand" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {editingId ? "Edit Announcement" : "Post New"}
        </button>
      </div>

      {activeTab === "LIST" && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No announcements found.</p>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-xl border border-border/50 bg-background/80 p-6 shadow-sm relative group">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => handleEdit(announcement)} className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-500 hover:bg-blue-500/20">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(announcement.id)} className="rounded-md bg-red-500/10 px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-500/20">
                    Delete
                  </button>
                </div>
                <div className="flex items-start justify-between mb-2 pr-20">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      By {announcement.author?.name || announcement.author?.email} on {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${announcement.published ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {announcement.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="prose prose-sm dark:prose-invert mt-4 max-w-none text-muted-foreground whitespace-pre-wrap line-clamp-3">
                  {announcement.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "CREATE" && (
        <form onSubmit={handleCreate} className="space-y-6 rounded-2xl border border-border/50 bg-background/80 p-6 shadow-xl sm:p-8 max-w-3xl">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title *</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-brand" placeholder="Important Update" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Content * (Supports basic formatting)</label>
            <textarea required rows={10} value={content} onChange={e => setContent(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-brand" placeholder="Type your announcement here..." />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="h-5 w-5 rounded border-border text-brand focus:ring-brand" />
            Publish Immediately
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand px-6 py-3.5 text-center font-semibold text-white transition-all hover:bg-brand/90 disabled:opacity-50">
            {loading ? "Saving..." : (editingId ? "Update Announcement" : "Post Announcement")}
          </button>
        </form>
      )}
    </div>
  );
}
