"use client";

import { useState } from "react";
import { downloadCSV, downloadExcel } from "@/lib/export";
import Link from "next/link";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function AdminEventsClient({ initialEvents }: { initialEvents: any[] }) {
  const [activeTab, setActiveTab] = useState<"LIST" | "CREATE">("LIST");
  const [events, setEvents] = useState(initialEvents);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // Edit State
  const [editingDescId, setEditingDescId] = useState<string | null>(null);
  const [editDescText, setEditDescText] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [type, setType] = useState("SOLO");
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(1);
  const [maxTeams, setMaxTeams] = useState("");
  const [registrationsAvailable, setRegistrationsAvailable] = useState(true);

  // Firebase Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Custom Fields State
  const [customFields, setCustomFields] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { label: "", fieldType: "TEXT", isRequired: false, options: [] },
    ]);
  };

  const updateField = (index: number, key: string, value: any) => {
    const updated = [...customFields];
    updated[index][key] = value;
    setCustomFields(updated);
  };

  const removeField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!image) {
        throw new Error("Please upload an image or provide a valid image URL.");
      }

      const eventDate = new Date(date);
      const isPast = eventDate < new Date();
      const status = isPast ? "COMPLETED" : "UPCOMING";

      const payload = {
        title, description, image, date, time, venue, type, status,
        minTeamSize: Number(minTeamSize),
        maxTeamSize: Number(maxTeamSize),
        maxTeams: maxTeams, // maxTeams is now required string/number, we'll send it as is. Wait, API expects string or number? I'll send it as is for now.
        registrationsAvailable,
        customFields: customFields.map(cf => ({
          ...cf,
          options: cf.fieldType === "SELECT" ? cf.options : null
        }))
      };

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Event created successfully");
      window.location.reload();
    } catch (err) {
      alert("Error creating event: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Check if firebase is configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      alert("Firebase is not configured in .env yet!");
      return;
    }

    const storageRef = ref(storage, `events/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploadingImage(true);
    setUploadProgress(0);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        alert("Image upload failed: " + error.message);
        setUploadingImage(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setImage(downloadURL);
        setUploadingImage(false);
      }
    );
  };

  const handleExport = async (eventId: string, format: "csv" | "excel") => {
    setExporting(eventId);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/export`);
      const { data, eventTitle, error } = await res.json();
      
      if (error) throw new Error(error);
      
      if (data.length === 0) {
        alert("No registrations found for this event.");
        return;
      }

      const filename = `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_registrations`;

      if (format === "csv") downloadCSV(data, filename);
      else downloadExcel(data, filename);
      
    } catch (err: any) {
      alert("Failed to export: " + err.message);
    } finally {
      setExporting(null);
    }
  };

  const handleEditDescription = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editDescText }),
      });
      if (!res.ok) throw new Error("Failed to update description");
      
      setEvents(events.map(e => e.id === id ? { ...e, description: editDescText } : e));
      setEditingDescId(null);
    } catch (err) {
      alert("Error updating description.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex gap-4 border-b border-border/50 pb-4">
        <button
          onClick={() => setActiveTab("LIST")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "LIST" ? "text-brand border-b-2 border-brand" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Manage Events
        </button>
        <button
          onClick={() => setActiveTab("CREATE")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "CREATE" ? "text-brand border-b-2 border-brand" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Create Event
        </button>
      </div>

      {activeTab === "LIST" && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No events found.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex flex-col justify-between gap-4 rounded-xl border border-border/50 bg-background/80 p-6 sm:flex-row sm:items-center">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">{event.status}</span>
                    <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-500">{event.type}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    <Link href={`/events/${event.id}`} className="hover:underline hover:text-brand">{event.title}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()} | {event._count.participants} teams/solo participants
                  </p>
                  
                  {editingDescId === event.id ? (
                    <div className="mt-4">
                      <textarea
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        rows={3}
                        value={editDescText}
                        onChange={(e) => setEditDescText(e.target.value)}
                        placeholder="Update event description..."
                      />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 shrink-0">
                
                  <div className="flex gap-2">
                    {editingDescId === event.id ? (
                      <>
                        <button
                          onClick={() => handleEditDescription(event.id)}
                          className="rounded-lg border border-border bg-brand/10 text-brand px-4 py-2 text-sm font-medium transition-colors hover:bg-brand/20"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingDescId(null)}
                          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingDescId(event.id);
                          setEditDescText(event.description || "");
                        }}
                        className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        Edit Desc
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/events/${event.id}/registrations`}
                      className="rounded-lg border border-brand bg-brand/10 text-brand px-4 py-2 text-sm font-medium transition-colors hover:bg-brand/20 flex items-center justify-center"
                    >
                      Manage Registrations
                    </Link>
                    <button
                      onClick={() => handleExport(event.id, "csv")}
                      disabled={exporting === event.id}
                      className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => handleExport(event.id, "excel")}
                      disabled={exporting === event.id}
                      className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      Export Excel
                    </button>
                  </div>
              </div>
            </div>
            ))
          )}
        </div>
      )}

      {activeTab === "CREATE" && (
        <form onSubmit={handleCreate} className="space-y-8 rounded-2xl border border-border/50 bg-background/80 p-6 shadow-xl sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Title *</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5" />
            </div>
            
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Poster Image *</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input 
                  type="url" 
                  value={image} 
                  onChange={e => setImage(e.target.value)} 
                  className="flex-1 w-full rounded-lg border border-border bg-background px-4 py-2.5" 
                  placeholder="Paste URL or upload file"
                  required
                />
                <div className="text-sm font-bold text-muted-foreground">OR</div>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button type="button" disabled={uploadingImage} className="rounded-lg bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/20 disabled:opacity-50">
                    {uploadingImage ? `Uploading (${uploadProgress}%)` : "Upload File"}
                  </button>
                </div>
              </div>
              {image && (
                <div className="mt-4 max-w-xs rounded-xl overflow-hidden border border-border">
                   <img src={image} alt="Preview" className="w-full h-auto object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Date *</label>
              <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Venue</label>
              <input type="text" value={venue} onChange={e => setVenue(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Event Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5">
                <option value="SOLO">Solo</option>
                <option value="TEAM">Team</option>
              </select>
            </div>

            {type === "TEAM" && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Min Team Size</label>
                  <input type="number" min={1} value={minTeamSize} onChange={e => setMinTeamSize(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-4 py-2.5" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Max Team Size</label>
                  <input type="number" min={1} value={maxTeamSize} onChange={e => setMaxTeamSize(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-4 py-2.5" />
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium">Registration Open?</label>
              <input type="checkbox" checked={registrationsAvailable} onChange={e => setRegistrationsAvailable(e.target.checked)} className="h-5 w-5 rounded border-border text-brand focus:ring-brand" />
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium">Max Total Teams *</label>
              <input required type="number" value={maxTeams} onChange={e => setMaxTeams(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5" placeholder="e.g. 50" />
            </div>
          </div>

          <div className="border-t border-border/50 pt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Dynamic Registration Fields</h3>
              <button type="button" onClick={addCustomField} className="rounded-lg bg-brand/10 px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/20">
                + Add Field
              </button>
            </div>

            <div className="space-y-4">
              {customFields.map((cf, index) => (
                <div key={index} className="flex flex-col gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-start">
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="mb-1 text-xs text-muted-foreground">Label / Question</label>
                        <input type="text" required value={cf.label} onChange={e => updateField(index, "label", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="e.g. T-Shirt Size" />
                      </div>
                      <div>
                        <label className="mb-1 text-xs text-muted-foreground">Type</label>
                        <select value={cf.fieldType} onChange={e => updateField(index, "fieldType", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                          <option value="TEXT">Short Text</option>
                          <option value="TEXTAREA">Long Text</option>
                          <option value="NUMBER">Number</option>
                          <option value="SELECT">Dropdown</option>
                        </select>
                      </div>
                    </div>

                    {cf.fieldType === "SELECT" && (
                      <div>
                        <label className="mb-1 text-xs text-muted-foreground">Options (Comma separated)</label>
                        <input type="text" required value={cf.options?.join(", ") || ""} onChange={e => updateField(index, "options", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="S, M, L, XL" />
                      </div>
                    )}
                    
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" checked={cf.isRequired} onChange={e => updateField(index, "isRequired", e.target.checked)} className="rounded border-border text-brand" />
                      Required Field
                    </label>
                  </div>
                  
                  <button type="button" onClick={() => removeField(index)} className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              
              {customFields.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No custom fields added. Default fields (Name, Email, etc.) are always collected automatically.</p>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand px-6 py-3.5 text-center font-semibold text-white transition-all hover:bg-brand/90 disabled:opacity-50">
            {loading ? "Creating Event..." : "Create Event"}
          </button>
        </form>
      )}
    </div>
  );
}
