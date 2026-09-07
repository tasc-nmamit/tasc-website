"use client";

import { useState } from "react";
import { PlusIcon, Edit3Icon, Trash2Icon, MegaphoneIcon } from "lucide-react";

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
    } catch (err: any) {
      alert(`Error ${editingId ? "updating" : "creating"} announcement: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setAnnouncements(announcements.filter((a) => a.id !== id));
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
    <div className="space-y-6">
      {/* Tab Controls */}
      <div className="flex gap-3 border-b border-brand/20 pb-4">
        <button
          onClick={() => {
            setActiveTab("LIST");
            setEditingId(null);
            setTitle("");
            setContent("");
            setPublished(true);
          }}
          className={`px-5 py-2.5 rounded-xl font-space-grotesk font-semibold text-sm transition-all ${
            activeTab === "LIST"
              ? "bg-brand/20 text-brand-accent border border-brand/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          All Announcements ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab("CREATE")}
          className={`px-5 py-2.5 rounded-xl font-space-grotesk font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === "CREATE"
              ? "bg-brand/20 text-brand-accent border border-brand/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          <PlusIcon className="w-4 h-4" />
          {editingId ? "Edit Announcement" : "Broadcast New"}
        </button>
      </div>

      {activeTab === "LIST" && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="rounded-2xl border border-brand/20 bg-card/60 backdrop-blur-xl p-12 text-center text-muted-foreground font-space-grotesk">
              No announcements published yet. Click "Broadcast New" to post updates.
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="group relative rounded-2xl border border-brand/20 bg-card/70 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:border-brand-accent/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`rounded-lg px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider border ${
                          announcement.published
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/40"
                        }`}
                      >
                        {announcement.published ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-space-grotesk text-foreground">
                      {announcement.title}
                    </h3>

                    <p className="font-mono-tech text-xs text-muted-foreground">
                      BY:{" "}
                      <span className="text-foreground">
                        {announcement.author?.name || announcement.author?.email}
                      </span>{" "}
                      | DATE: {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="rounded-xl border border-brand/30 bg-background/60 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-brand/10 hover:border-brand-accent/50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3Icon className="w-3.5 h-3.5 text-brand-accent" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                      title="Delete Announcement"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-brand/10 bg-background/40 p-4 text-sm text-muted-foreground font-space-grotesk whitespace-pre-wrap leading-relaxed">
                  {announcement.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "CREATE" && (
        <form
          onSubmit={handleCreate}
          className="space-y-6 rounded-3xl border border-brand/20 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl max-w-3xl"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
              Announcement Title *
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent font-space-grotesk"
              placeholder="e.g. Workshop Registration Open: Neural Networks 101"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
              Content / Notice Details *
            </label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent font-space-grotesk"
              placeholder="Type announcement content here..."
            />
          </div>

          <label className="flex items-center gap-3 text-sm font-semibold font-space-grotesk text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-5 w-5 rounded border-brand/30 text-brand focus:ring-brand-accent"
            />
            Broadcast Immediately (Visible to all students)
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand py-4 text-center font-space-grotesk font-bold text-white shadow-xl shadow-brand/20 transition-all hover:bg-brand/90 hover:scale-[1.005] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <MegaphoneIcon className="w-5 h-5" />
            {loading ? "Publishing..." : editingId ? "Update Announcement" : "Post Announcement"}
          </button>
        </form>
      )}
    </div>
  );
}
