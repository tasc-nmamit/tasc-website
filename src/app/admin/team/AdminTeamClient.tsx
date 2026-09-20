"use client";

import { useState, useCallback } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import Image from "next/image";

const SECTIONS = [
  { value: "ADMIN", label: "Executive Board" },
  { value: "TECHNICAL", label: "Technical Team" },
  { value: "SPORTS", label: "Sports Team" },
  { value: "CULTURAL", label: "Cultural Team" },
  { value: "GRAPHICS", label: "Graphics Team" },
  { value: "MEDIA", label: "Media & Outreach Team" },
  { value: "EVENT", label: "Event Team" },
  { value: "REPRESENTATIVE", label: "Class Representatives" },
];

interface TeamMember {
  id: string;
  year: string;
  userId: string;
  image: string;
  order: number;
  post: string;
  quote: string | null;
  section: string;
  User: {
    id: string;
    name: string | null;
    displayName: string | null;
    email: string;
    image: string | null;
    links: {
      instagram: string | null;
      linkedin: string | null;
      github: string | null;
    } | null;
  };
}

interface SearchUser {
  id: string;
  name: string | null;
  displayName: string | null;
  email: string;
  image: string | null;
}

export default function AdminTeamClient({
  initialMembers,
  teamYears: initialYears,
}: {
  initialMembers: TeamMember[];
  teamYears: string[];
}) {
  const [activeTab, setActiveTab] = useState<"LIST" | "ADD">("LIST");
  const [members, setMembers] = useState(initialMembers);
  const [teamYears, setTeamYears] = useState(initialYears);

  // Determine default year: latest existing year or "2026"
  const defaultYear =
    initialYears.length > 0 ? initialYears[0] : "2026";
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  // Add form state
  const [newYear, setNewYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [image, setImage] = useState("");
  const [post, setPost] = useState("");
  const [order, setOrder] = useState(1);
  const [section, setSection] = useState("ADMIN");
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editImage, setEditImage] = useState("");
  const [editPost, setEditPost] = useState("");
  const [editOrder, setEditOrder] = useState(1);
  const [editSection, setEditSection] = useState("ADMIN");
  const [editQuote, setEditQuote] = useState("");

  // Firebase Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTarget, setUploadTarget] = useState<"add" | "edit">("add");

  // Filter members by selected year
  const filteredMembers = members.filter((m) => m.year === selectedYear);

  // Search users
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/admin/team/search-users?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Image upload handler
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "add" | "edit"
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      alert("Firebase is not configured in .env yet!");
      return;
    }

    const storageRef = ref(storage, `team/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploadingImage(true);
    setUploadProgress(0);
    setUploadTarget(target);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        alert("Image upload failed: " + error.message);
        setUploadingImage(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        if (target === "add") {
          setImage(downloadURL);
        } else {
          setEditImage(downloadURL);
        }
        setUploadingImage(false);
      }
    );
  };

  // Create member
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      alert("Please select a user first.");
      return;
    }
    if (!image) {
      alert("Please provide an image URL or upload an image.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          year: newYear,
          image,
          post,
          order: Number(order),
          section,
          quote: quote || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create");
      }

      const newMember = await res.json();
      setMembers((prev) => [...prev, newMember]);

      // Add year to list if new
      if (!teamYears.includes(newYear)) {
        setTeamYears((prev) =>
          [...prev, newYear].sort((a, b) => b.localeCompare(a))
        );
      }

      // Reset form
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
      setImage("");
      setPost("");
      setOrder(1);
      setSection("ADMIN");
      setQuote("");

      alert("Team member added successfully!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update member
  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: editImage,
          post: editPost,
          order: Number(editOrder),
          section: editSection,
          quote: editQuote || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const updated = await res.json();
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
      setEditingId(null);
    } catch (err: any) {
      alert("Error updating member: " + err.message);
    }
  };

  // Delete member
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert("Error deleting member: " + err.message);
    }
  };

  // Start editing
  const startEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setEditImage(member.image);
    setEditPost(member.post);
    setEditOrder(member.order);
    setEditSection(member.section);
    setEditQuote(member.quote || "");
  };

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-border/50 pb-4">
        <button
          onClick={() => setActiveTab("LIST")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "LIST"
              ? "text-brand border-b-2 border-brand"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Manage Members
        </button>
        <button
          onClick={() => setActiveTab("ADD")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "ADD"
              ? "text-brand border-b-2 border-brand"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Add Member
        </button>
      </div>

      {/* LIST TAB */}
      {activeTab === "LIST" && (
        <div>
          {/* Year Selector */}
          <div className="mb-6 flex flex-wrap gap-2">
            {teamYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedYear === year
                    ? "bg-brand text-white"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {year}-{parseInt(year.slice(2)) + 1}
              </button>
            ))}
          </div>

          {/* Members Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredMembers.length} member
            {filteredMembers.length !== 1 ? "s" : ""} for{" "}
            {selectedYear}-{parseInt(selectedYear.slice(2)) + 1}
          </div>

          {/* Members List */}
          <div className="space-y-3">
            {filteredMembers.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                No team members for this year.{" "}
                <button
                  onClick={() => setActiveTab("ADD")}
                  className="text-brand hover:underline"
                >
                  Add one →
                </button>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 rounded-xl border border-border/50 bg-background/80 p-4 sm:flex-row sm:items-center"
                >
                  {/* Member Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border border-border shrink-0">
                      <Image
                        src={member.image || "/fallback_profile.png"}
                        alt={member.User.displayName || member.User.name || "Member"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground truncate">
                        {member.User.displayName || member.User.name || "Unknown"}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.User.email}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                          {member.post}
                        </span>
                        <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-500">
                          {member.section}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground">
                          Order: {member.order}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Form (inline) */}
                  {editingId === member.id ? (
                    <div className="w-full border-t border-border/50 pt-4 mt-2 sm:border-t-0 sm:pt-0 sm:mt-0 sm:w-auto">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className="text-[10px] uppercase text-muted-foreground font-bold">
                            Post/Role
                          </label>
                          <input
                            type="text"
                            value={editPost}
                            onChange={(e) => setEditPost(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-muted-foreground font-bold">
                            Section
                          </label>
                          <select
                            value={editSection}
                            onChange={(e) => setEditSection(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                          >
                            {SECTIONS.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-muted-foreground font-bold">
                            Order
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={editOrder}
                            onChange={(e) =>
                              setEditOrder(Number(e.target.value))
                            }
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="text-[10px] uppercase text-muted-foreground font-bold">
                            Image URL
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={editImage}
                              onChange={(e) => setEditImage(e.target.value)}
                              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                              placeholder="Image URL"
                            />
                            <div className="relative shrink-0">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, "edit")}
                                disabled={uploadingImage}
                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed w-full"
                              />
                              <button
                                type="button"
                                disabled={uploadingImage}
                                className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/20 disabled:opacity-50"
                              >
                                {uploadingImage && uploadTarget === "edit"
                                  ? `${uploadProgress}%`
                                  : "Upload"}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="text-[10px] uppercase text-muted-foreground font-bold">
                            Quote
                          </label>
                          <input
                            type="text"
                            value={editQuote}
                            onChange={(e) => setEditQuote(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                            placeholder="Optional quote"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleUpdate(member.id)}
                          className="rounded-lg bg-brand/10 text-brand px-4 py-1.5 text-sm font-medium hover:bg-brand/20"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-border bg-background px-4 py-1.5 text-sm font-medium hover:bg-accent"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(member)}
                        className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADD TAB */}
      {activeTab === "ADD" && (
        <form
          onSubmit={handleCreate}
          className="space-y-8 rounded-2xl border border-border/50 bg-background/80 p-6 shadow-xl sm:p-8"
        >
          {/* Year */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Academic Year *
            </label>
            <input
              type="text"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-border bg-background px-4 py-2.5"
              placeholder='e.g. "2026" for 2026-27'
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Enter the starting year (e.g. &quot;2026&quot; for academic year
              2026-27)
            </p>
          </div>

          {/* User Search */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Search User *
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
              placeholder="Search by name or email..."
            />

            {/* Search Results */}
            {searchResults.length > 0 && !selectedUser && (
              <div className="mt-2 rounded-lg border border-border bg-background max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchQuery(
                        user.displayName || user.name || user.email
                      );
                      setSearchResults([]);
                      // Pre-fill image from user profile if available
                      if (user.image && !image) {
                        setImage(user.image);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent transition-colors border-b border-border/50 last:border-b-0"
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
                      {user.image && (
                        <Image
                          src={user.image}
                          alt={user.name || ""}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.displayName || user.name || "No name"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searching && (
              <p className="mt-2 text-xs text-muted-foreground">Searching...</p>
            )}

            {/* Selected User Badge */}
            {selectedUser && (
              <div className="mt-2 flex items-center gap-3 p-3 rounded-lg border border-brand/30 bg-brand/5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                  {selectedUser.image && (
                    <Image
                      src={selectedUser.image}
                      alt={selectedUser.name || ""}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">
                    {selectedUser.displayName ||
                      selectedUser.name ||
                      "No name"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setSearchQuery("");
                  }}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Post/Role */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Post / Role *
              </label>
              <input
                required
                type="text"
                value={post}
                onChange={(e) => setPost(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
                placeholder="e.g. President, Secretary, Technical Lead"
              />
            </div>

            {/* Section */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Section *
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
              >
                {SECTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Display Order *
              </label>
              <input
                required
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>

            {/* Quote */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Quote</label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
                placeholder="Optional quote or tagline"
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Profile Image *
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 w-full rounded-lg border border-border bg-background px-4 py-2.5"
                placeholder="Paste URL or upload file"
                required
              />
              <div className="text-sm font-bold text-muted-foreground">OR</div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "add")}
                  disabled={uploadingImage}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  className="rounded-lg bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/20 disabled:opacity-50"
                >
                  {uploadingImage && uploadTarget === "add"
                    ? `Uploading (${uploadProgress}%)`
                    : "Upload File"}
                </button>
              </div>
            </div>
            {image && (
              <div className="mt-4 w-24 h-24 rounded-full overflow-hidden border border-border relative">
                <Image
                  src={image}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand px-6 py-3.5 text-center font-semibold text-white transition-all hover:bg-brand/90 disabled:opacity-50"
          >
            {loading ? "Adding Member..." : "Add Team Member"}
          </button>
        </form>
      )}
    </div>
  );
}
