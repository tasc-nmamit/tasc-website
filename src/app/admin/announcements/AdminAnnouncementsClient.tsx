"use client";

import { useState } from "react";
import {
  PlusIcon,
  Edit3Icon,
  Trash2Icon,
  MegaphoneIcon,
  ImageIcon,
  UploadCloudIcon,
  Loader2Icon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { ensureFirebaseAuth } from "@/lib/firebase-client-auth";

export default function AdminAnnouncementsClient({ initialAnnouncements }: { initialAnnouncements: any[] }) {
  const [activeTab, setActiveTab] = useState<"LIST" | "CREATE">("LIST");
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCount, setUploadCount] = useState({ current: 0, total: 0 });

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`"${file.name}" is not a valid image file. Skipped.`);
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        alert(`"${file.name}" is larger than 15MB. Skipped.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    try {
      await ensureFirebaseAuth();
    } catch (err: any) {
      alert("Upload failed: " + err.message);
      return;
    }

    setUploadingImages(true);
    setUploadProgress(0);
    setUploadCount({ current: 0, total: validFiles.length });

    const newUrls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storageRef = ref(storage, `announcements/${Date.now()}_${i}_${safeName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            const totalProgress = Math.round(((i + fileProgress / 100) / validFiles.length) * 100);
            setUploadProgress(totalProgress);
          },
          (error) => {
            alert(`Failed to upload "${file.name}": ` + error.message);
            resolve();
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              newUrls.push(downloadURL);
            } catch (err) {
              console.error(err);
            }
            setUploadCount({ current: i + 1, total: validFiles.length });
            resolve();
          }
        );
      });
    }

    if (newUrls.length > 0) {
      setImageUrls((prev) => [...prev, ...newUrls]);
    }
    setUploadingImages(false);
    setUploadProgress(0);
    e.target.value = "";
  };

  const handleAddManualUrl = () => {
    const trimmed = manualImageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      alert("Please enter a valid image URL starting with http:// or https://");
      return;
    }
    setImageUrls((prev) => [...prev, trimmed]);
    setManualImageUrl("");
  };

  const handleRemovePhoto = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePhoto = (from: number, to: number) => {
    if (to < 0 || to >= imageUrls.length) return;
    setImageUrls((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingImages) {
      alert("Please wait for photos to finish uploading.");
      return;
    }

    setLoading(true);

    try {
      const url = editingId ? `/api/admin/announcements/${editingId}` : "/api/admin/announcements";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          published,
          imageUrl: imageUrls[0] || null,
          imageUrls,
        }),
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
    const existing: string[] = Array.isArray(announcement.imageUrls) && announcement.imageUrls.length > 0
      ? announcement.imageUrls
      : announcement.imageUrl
      ? [announcement.imageUrl]
      : [];
    setImageUrls(existing);
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
            setImageUrls([]);
            setManualImageUrl("");
            setUploadingImages(false);
            setUploadProgress(0);
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
          onClick={() => {
            if (!editingId) {
              setTitle("");
              setContent("");
              setImageUrls([]);
              setManualImageUrl("");
              setUploadingImages(false);
              setUploadProgress(0);
              setPublished(true);
            }
            setActiveTab("CREATE");
          }}
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
                      {(() => {
                        const cardImages: string[] = Array.isArray(announcement.imageUrls) && announcement.imageUrls.length > 0
                          ? announcement.imageUrls
                          : announcement.imageUrl
                          ? [announcement.imageUrl]
                          : [];
                        if (cardImages.length === 0) return null;
                        return (
                          <span className="rounded-lg px-2 py-0.5 text-[10px] font-mono-tech text-brand-accent bg-brand/15 border border-brand/30 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>{cardImages.length === 1 ? "HAS PHOTO" : `${cardImages.length} PHOTOS`}</span>
                          </span>
                        );
                      })()}
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

                {/* Announcement Image Preview in Card */}
                {(() => {
                  const cardImages: string[] = Array.isArray(announcement.imageUrls) && announcement.imageUrls.length > 0
                    ? announcement.imageUrls
                    : announcement.imageUrl
                    ? [announcement.imageUrl]
                    : [];
                  if (cardImages.length === 0) return null;

                  if (cardImages.length === 1) {
                    return (
                      <div className="mb-4 rounded-xl overflow-hidden border border-brand/20 max-h-72 bg-black/40 shadow-sm">
                        <img
                          src={cardImages[0]}
                          alt={announcement.title}
                          className="w-full h-full object-cover max-h-72 hover:scale-[1.01] transition-transform"
                        />
                      </div>
                    );
                  }

                  return (
                    <div className="mb-4 space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {cardImages.slice(0, 4).map((url, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-video rounded-lg overflow-hidden border border-brand/20 bg-black/40 shadow-sm"
                          >
                            <img
                              src={url}
                              alt={`${announcement.title} photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {idx === 3 && cardImages.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-mono-tech font-bold text-xs">
                                +{cardImages.length - 4} MORE
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

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

          {/* Photo / Poster Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold font-space-grotesk text-foreground">
                Announcement Photos ({imageUrls.length} Attached)
              </label>
              {imageUrls.length > 0 && (
                <button
                  type="button"
                  onClick={() => setImageUrls([])}
                  className="text-xs font-mono-tech text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Clear All Photos
                </button>
              )}
            </div>

            {/* Attached Photos Grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl border border-brand/25 bg-background/60 p-2.5 flex flex-col gap-2 group shadow-sm"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-brand/20 bg-black/40">
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-brand/80 text-white font-mono-tech text-[10px] font-bold">
                          COVER
                        </span>
                      )}
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono-tech text-[10px]">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-brand/15">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMovePhoto(idx, idx - 1)}
                          title="Move Left"
                          className="p-1 rounded bg-background border border-brand/20 hover:border-brand-accent disabled:opacity-30 disabled:pointer-events-none text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <ArrowLeftIcon className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === imageUrls.length - 1}
                          onClick={() => handleMovePhoto(idx, idx + 1)}
                          title="Move Right"
                          className="p-1 rounded bg-background border border-brand/20 hover:border-brand-accent disabled:opacity-30 disabled:pointer-events-none text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <ArrowRightIcon className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2Icon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Zone */}
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand/30 hover:border-brand-accent/60 bg-background/50 hover:bg-background/80 rounded-2xl p-6 transition-all cursor-pointer group">
                <div className="p-3 rounded-full bg-brand/10 group-hover:bg-brand/20 transition-colors mb-2">
                  <UploadCloudIcon className="w-6 h-6 text-brand-accent" />
                </div>
                <span className="text-sm font-space-grotesk font-semibold text-foreground group-hover:text-brand-accent transition-colors">
                  {imageUrls.length === 0
                    ? "Click to upload notice photo(s) or poster(s)"
                    : "Click to upload more photos"}
                </span>
                <span className="text-xs font-mono-tech text-muted-foreground mt-1">
                  Select one or multiple images (PNG, JPG, WEBP, GIF up to 15MB each)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleImageUpload}
                  disabled={uploadingImages}
                  className="hidden"
                />
              </label>

              {uploadingImages && (
                <div className="space-y-1.5 p-3 rounded-xl border border-brand/30 bg-background/60">
                  <div className="flex justify-between text-xs font-mono-tech text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-brand-accent">
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                      Uploading photo {uploadCount.current} of {uploadCount.total}...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-brand/20">
                    <div
                      className="h-full bg-gradient-to-r from-brand to-brand-accent transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Direct image URL input option */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="url"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddManualUrl();
                    }
                  }}
                  placeholder="Or paste image URL (e.g. https://...)"
                  className="flex-1 rounded-xl border border-brand/20 bg-background/50 px-3.5 py-2 text-xs text-foreground outline-none focus:border-brand-accent font-mono-tech"
                />
                <button
                  type="button"
                  onClick={handleAddManualUrl}
                  className="px-3.5 py-2 rounded-xl border border-brand/30 bg-brand/10 hover:bg-brand/20 text-xs font-mono-tech text-brand-accent transition-all shrink-0 cursor-pointer"
                >
                  + Add URL
                </button>
              </div>
            </div>
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
            disabled={loading || uploadingImages}
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
