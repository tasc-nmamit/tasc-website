"use client";

import { useState } from "react";
import { downloadCSV, downloadExcel } from "@/lib/export";
import Link from "next/link";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import {
  PlusIcon,
  FileSpreadsheetIcon,
  UsersIcon,
  Edit3Icon,
  Trash2Icon,
  UploadCloudIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  CalendarIcon,
  ClockIcon,
  ImageIcon,
} from "lucide-react";

export default function AdminEventsClient({ initialEvents }: { initialEvents: any[] }) {
  const [activeTab, setActiveTab] = useState<"LIST" | "CREATE">("LIST");
  const [events, setEvents] = useState(initialEvents);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [venue, setVenue] = useState("");
  const [type, setType] = useState<"SOLO" | "TEAM">("SOLO");
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(1);
  const [maxTeams, setMaxTeams] = useState("");
  const [registrationsAvailable, setRegistrationsAvailable] = useState(true);

  // Publish / Visibility State
  const [publishMode, setPublishMode] = useState<"IMMEDIATE" | "DRAFT" | "SCHEDULED">("IMMEDIATE");
  const [registrationStartTime, setRegistrationStartTime] = useState("");

  // Edit Event Modal State
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editType, setEditType] = useState<"SOLO" | "TEAM">("SOLO");
  const [editMinTeamSize, setEditMinTeamSize] = useState(1);
  const [editMaxTeamSize, setEditMaxTeamSize] = useState(1);
  const [editMaxTeams, setEditMaxTeams] = useState("");
  const [editStatus, setEditStatus] = useState("UPCOMING");
  const [editRegistrationsAvailable, setEditRegistrationsAvailable] = useState(true);

  // Event Gallery Modal State
  const [galleryEvent, setGalleryEvent] = useState<any | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryPublished, setGalleryPublished] = useState(false);
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false);

  // Firebase Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFieldImage, setUploadingFieldImage] = useState<string | null>(null);

  // Custom Fields State
  const [customFields, setCustomFields] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { label: "", fieldType: "TEXT", isRequired: false, options: [], min: "", max: "" },
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

  // Text Option Helpers for SELECT / MULTI_SELECT
  const addTextOption = (fieldIndex: number) => {
    const updated = [...customFields];
    if (!Array.isArray(updated[fieldIndex].options)) {
      updated[fieldIndex].options = [];
    }
    updated[fieldIndex].options.push("");
    setCustomFields(updated);
  };

  const updateTextOption = (fieldIndex: number, optIndex: number, value: string) => {
    const updated = [...customFields];
    updated[fieldIndex].options[optIndex] = value;
    setCustomFields(updated);
  };

  const removeTextOption = (fieldIndex: number, optIndex: number) => {
    const updated = [...customFields];
    updated[fieldIndex].options.splice(optIndex, 1);
    setCustomFields(updated);
  };

  // Image Option Helpers for IMAGE_POLL
  const addImageOption = (fieldIndex: number) => {
    const updated = [...customFields];
    if (!Array.isArray(updated[fieldIndex].options)) {
      updated[fieldIndex].options = [];
    }
    updated[fieldIndex].options.push({ label: "", imageUrl: "" });
    setCustomFields(updated);
  };

  const updateImageOption = (fieldIndex: number, optIndex: number, key: string, value: string) => {
    const updated = [...customFields];
    updated[fieldIndex].options[optIndex][key] = value;
    setCustomFields(updated);
  };

  const removeImageOption = (fieldIndex: number, optIndex: number) => {
    const updated = [...customFields];
    updated[fieldIndex].options.splice(optIndex, 1);
    setCustomFields(updated);
  };

  const handleFieldImageUpload = async (fieldIndex: number, optIndex: number, file: File) => {
    if (!file) return;

    const uploadId = `${fieldIndex}-${optIndex}`;
    setUploadingFieldImage(uploadId);

    const fileExtension = file.name.split(".").pop();
    const fileName = `event-field-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (error) => {
        alert("Upload failed: " + error.message);
        setUploadingFieldImage(null);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        updateImageOption(fieldIndex, optIndex, "imageUrl", url);
        setUploadingFieldImage(null);
      }
    );
  };

  const handleDisplayImageUpload = async (fieldIndex: number, file: File) => {
    if (!file) return;

    const uploadId = `display-${fieldIndex}`;
    setUploadingFieldImage(uploadId);

    const fileExtension = file.name.split(".").pop();
    const fileName = `event-display-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (error) => {
        alert("Upload failed: " + error.message);
        setUploadingFieldImage(null);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        updateField(fieldIndex, "imageUrl", url);
        setUploadingFieldImage(null);
      }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "create" | "edit") => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

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
        if (target === "create") {
          setImage(downloadURL);
        } else {
          setEditImage(downloadURL);
        }
        setUploadingImage(false);
      }
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!image) {
        throw new Error("Please upload an image or provide a valid poster image URL.");
      }

      const eventDate = new Date(date);
      const isPast = eventDate < new Date();
      
      let status = "UPCOMING";
      let isPublished = true;

      if (publishMode === "DRAFT") {
        status = "DRAFT";
        isPublished = false;
      } else if (isPast) {
        status = "COMPLETED";
      }

      const payload = {
        title,
        description,
        image,
        date,
        time,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        venue,
        type,
        status,
        published: isPublished,
        minTeamSize: type === "SOLO" ? 1 : Number(minTeamSize),
        maxTeamSize: type === "SOLO" ? 1 : Number(maxTeamSize),
        maxTeams: maxTeams ? Number(maxTeams) : null,
        registrationsAvailable,
        registrationStartTime: publishMode === "SCHEDULED" && registrationStartTime ? new Date(registrationStartTime).toISOString() : null,
        customFields: customFields.map((cf) => {
          let fieldOptions: any = null;
          if (cf.fieldType === "SELECT" || cf.fieldType === "MULTI_SELECT" || cf.fieldType === "IMAGE_POLL") {
            fieldOptions = cf.options;
          } else if (cf.fieldType === "NUMBER") {
            fieldOptions = {
              min: cf.min !== "" && cf.min !== undefined && cf.min !== null ? Number(cf.min) : null,
              max: cf.max !== "" && cf.max !== undefined && cf.max !== null ? Number(cf.max) : null,
            };
          } else if (cf.fieldType === "DISPLAY_IMAGE") {
            fieldOptions = {
              imageUrl: cf.imageUrl || "",
              caption: cf.caption || "",
            };
          }
          return {
            label: cf.label,
            fieldType: cf.fieldType,
            isRequired: cf.fieldType === "DISPLAY_IMAGE" ? false : !!cf.isRequired,
            options: fieldOptions,
          };
        }),
      };

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Event created successfully");
      window.location.reload();
    } catch (err: any) {
      alert("Error creating event: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRegistration = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationsAvailable: !currentVal }),
      });
      if (!res.ok) throw new Error(await res.text());

      setEvents(events.map((e) => (e.id === id ? { ...e, registrationsAvailable: !currentVal } : e)));
    } catch (err: any) {
      alert("Failed to toggle registration: " + err.message);
    }
  };

  const handleOpenEdit = (ev: any) => {
    setEditingEvent(ev);
    setEditTitle(ev.title || "");
    setEditDescription(ev.description || "");
    setEditImage(ev.image || "");
    setEditDate(ev.date ? new Date(ev.date).toISOString().split("T")[0] : "");
    setEditTime(ev.time || "");
    setEditEndDate(ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : "");
    setEditVenue(ev.venue || "");
    setEditType(ev.type || "SOLO");
    setEditMinTeamSize(ev.minTeamSize || 1);
    setEditMaxTeamSize(ev.maxTeamSize || 1);
    setEditMaxTeams(ev.maxTeams ? String(ev.maxTeams) : "");
    setEditStatus(ev.status || "UPCOMING");
    setEditRegistrationsAvailable(ev.registrationsAvailable ?? true);
  };

  const handleSaveEventEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setLoading(true);
    try {
      const payload = {
        title: editTitle,
        description: editDescription,
        image: editImage,
        date: editDate,
        time: editTime,
        endDate: editEndDate ? new Date(editEndDate).toISOString() : null,
        venue: editVenue,
        type: editType,
        minTeamSize: editType === "SOLO" ? 1 : Number(editMinTeamSize),
        maxTeamSize: editType === "SOLO" ? 1 : Number(editMaxTeamSize),
        maxTeams: editMaxTeams ? Number(editMaxTeams) : null,
        status: editStatus,
        registrationsAvailable: editRegistrationsAvailable,
      };

      const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      const updated = await res.json();
      setEvents(events.map((e) => (e.id === editingEvent.id ? { ...e, ...updated } : e)));
      alert("Event updated successfully!");
      setEditingEvent(null);
    } catch (err: any) {
      alert("Failed to update event: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGallery = (ev: any) => {
    setGalleryEvent(ev);
    setGalleryPhotos(Array.isArray(ev.guests) ? ev.guests : []);
    setGalleryPublished(ev.notification === "GALLERY_PUBLISHED");
  };

  const handleUploadGalleryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !galleryEvent) return;
    const file = e.target.files[0];

    setUploadingGalleryPhoto(true);
    const storageRef = ref(storage, `events/${galleryEvent.id}/gallery/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (error) => {
        alert("Upload failed: " + error.message);
        setUploadingGalleryPhoto(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setGalleryPhotos((prev) => [...prev, url]);
        setUploadingGalleryPhoto(false);
      }
    );
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setGalleryPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveGallery = async () => {
    if (!galleryEvent) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${galleryEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gallery: galleryPhotos,
          galleryPublished,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setEvents(
        events.map((e) =>
          e.id === galleryEvent.id
            ? {
                ...e,
                guests: galleryPhotos,
                notification: galleryPublished ? "GALLERY_PUBLISHED" : "GALLERY_DRAFT",
              }
            : e
        )
      );

      alert(galleryPublished ? "Gallery saved & published to Announcement Notice Board!" : "Gallery saved as draft.");
      setGalleryEvent(null);
    } catch (err: any) {
      alert("Failed to save gallery: " + err.message);
    } finally {
      setLoading(false);
    }
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

      const filename = `${eventTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_registrations`;

      if (format === "csv") downloadCSV(data, filename);
      else downloadExcel(data, filename);
    } catch (err: any) {
      alert("Failed to export: " + err.message);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-3 border-b border-brand/20 pb-4">
        <button
          onClick={() => setActiveTab("LIST")}
          className={`px-5 py-2.5 rounded-xl font-space-grotesk font-semibold text-sm transition-all ${
            activeTab === "LIST"
              ? "bg-brand/20 text-brand-accent border border-brand/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          All Events ({events.length})
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
          Create New Event
        </button>
      </div>

      {/* Event List */}
      {activeTab === "LIST" && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="rounded-2xl border border-brand/20 bg-card/60 backdrop-blur-xl p-12 text-center text-muted-foreground font-space-grotesk">
              No events found. Click "Create New Event" above to publish a competition or workshop.
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="group relative flex flex-col justify-between gap-4 rounded-2xl border border-brand/20 bg-card/70 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:border-brand-accent/50 sm:flex-row sm:items-center"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-lg px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider border ${
                        event.status === "COMPLETED"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                          : event.status === "DRAFT"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                          : "bg-brand/15 text-brand-accent border-brand/40"
                      }`}
                    >
                      {event.status}
                    </span>
                    <span className="rounded-lg bg-gold/15 text-gold border border-gold/40 px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider">
                      {event.type}
                    </span>

                    {/* Registration Status Badge */}
                    <span
                      className={`rounded-lg px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider border ${
                        event.registrationsAvailable
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/40"
                      }`}
                    >
                      {event.registrationsAvailable ? "REGISTRATIONS OPEN" : "REGISTRATIONS PAUSED"}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-space-grotesk text-foreground">
                    <Link href={`/events/${event.id}`} className="hover:underline hover:text-brand-accent">
                      {event.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap gap-4 text-xs font-mono-tech text-muted-foreground">
                    <span>
                      START: <span className="text-foreground">{new Date(event.date).toLocaleDateString()} {event.time || ""}</span>
                    </span>
                    {event.endDate && (
                      <span>
                        END: <span className="text-foreground">{new Date(event.endDate).toLocaleDateString()} {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    )}
                    <span>
                      PARTICIPANTS: <span className="text-gold font-bold">{event._count?.participants || 0}</span>
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl font-space-grotesk">
                    {event.description ? event.description.replace(/<[^>]*>?/gm, "").trim() : ""}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 shrink-0">
                  {/* Quick Toggle Registration */}
                  <button
                    onClick={() => handleToggleRegistration(event.id, event.registrationsAvailable)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-semibold font-space-grotesk transition-all flex items-center gap-1.5 cursor-pointer ${
                      event.registrationsAvailable
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {event.registrationsAvailable ? <ToggleRightIcon className="w-4 h-4" /> : <ToggleLeftIcon className="w-4 h-4" />}
                    {event.registrationsAvailable ? "Pause Reg" : "Open Reg"}
                  </button>

                  {/* Edit Full Event Details */}
                  <button
                    onClick={() => handleOpenEdit(event)}
                    className="rounded-xl border border-brand/30 bg-background/60 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-brand/10 hover:border-brand-accent/50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3Icon className="w-3.5 h-3.5 text-brand-accent" />
                    Edit Details
                  </button>

                  {/* Event Photo Gallery & Showcase */}
                  <button
                    onClick={() => handleOpenGallery(event)}
                    className="rounded-xl border border-brand/30 bg-background/60 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-brand/10 hover:border-brand-accent/50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-gold" />
                    Photos ({event.guests?.length || 0})
                  </button>

                  <Link
                    href={`/admin/events/${event.id}/registrations`}
                    className="rounded-xl border border-brand/40 bg-brand/15 text-brand-accent px-4 py-2 text-xs font-bold font-space-grotesk transition-all hover:bg-brand/25 flex items-center gap-1.5 shadow-sm"
                  >
                    <UsersIcon className="w-3.5 h-3.5" />
                    Manage Teams
                  </Link>

                  <button
                    onClick={() => handleExport(event.id, "csv")}
                    disabled={exporting === event.id}
                    className="rounded-xl border border-brand/30 bg-background/60 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-brand/10 hover:border-brand-accent/50 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <FileSpreadsheetIcon className="w-3.5 h-3.5 text-brand-accent" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport(event.id, "excel")}
                    disabled={exporting === event.id}
                    className="rounded-xl border border-brand/30 bg-background/60 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-brand/10 hover:border-brand-accent/50 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <FileSpreadsheetIcon className="w-3.5 h-3.5 text-emerald-400" />
                    Excel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Event Form */}
      {activeTab === "CREATE" && (
        <form
          onSubmit={handleCreate}
          className="space-y-8 rounded-3xl border border-brand/20 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Event Title *
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                placeholder="e.g. AI Hackathon 2026"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Event Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                placeholder="Provide event details, timeline, requirements, and rules..."
              />
            </div>

            {/* Poster Upload */}
            <div className="sm:col-span-2 space-y-3">
              <label className="block text-sm font-semibold font-space-grotesk text-foreground">
                Poster / Banner Image *
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-1 w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
                  placeholder="Paste image URL or upload directly"
                  required
                />
                <div className="text-xs font-mono-tech text-muted-foreground uppercase">OR</div>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "create")}
                    disabled={uploadingImage}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    className="rounded-xl border border-brand/40 bg-brand/20 px-4 py-2.5 text-xs font-bold font-mono-tech uppercase tracking-wider text-brand-accent hover:bg-brand/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <UploadCloudIcon className="w-4 h-4" />
                    {uploadingImage ? `UPLOADING (${uploadProgress}%)` : "UPLOAD_POSTER"}
                  </button>
                </div>
              </div>
              {image && (
                <div className="mt-4 max-w-sm rounded-2xl overflow-hidden border border-brand/30 shadow-lg">
                  <img src={image} alt="Preview" className="w-full h-auto object-cover" />
                </div>
              )}
            </div>

            {/* Start Date & Time */}
            <div>
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Start Date *
              </label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
              />
            </div>

            {/* End Date & Time */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Event End Date & Time (Marks event as completed once passed)
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Venue / Location
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Sambhram Auditorium / Online"
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Participation Format
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "SOLO" | "TEAM")}
                className="w-full rounded-xl border border-brand/30 bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
              >
                <option value="SOLO">Solo (Individual)</option>
                <option value="TEAM">Team Based</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Max Total Capacity (Total Teams/Participants) *
              </label>
              <input
                required
                type="number"
                value={maxTeams}
                onChange={(e) => setMaxTeams(e.target.value)}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
                placeholder="e.g. 50"
              />
            </div>

            {type === "TEAM" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minTeamSize}
                    onChange={(e) => setMinTeamSize(Number(e.target.value))}
                    className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                    className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
              </>
            )}

            {/* Visibility & Publishing Options */}
            <div className="sm:col-span-2 space-y-4 border border-brand/20 p-5 rounded-2xl bg-background/40">
              <label className="block text-sm font-bold font-space-grotesk text-foreground">
                Publication & Registration Availability
              </label>

              <div className="grid sm:grid-cols-3 gap-3">
                <label
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    publishMode === "IMMEDIATE"
                      ? "border-brand bg-brand/15 text-foreground shadow-sm"
                      : "border-brand/20 bg-background/50 text-muted-foreground hover:border-brand/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="publishMode"
                    value="IMMEDIATE"
                    checked={publishMode === "IMMEDIATE"}
                    onChange={() => setPublishMode("IMMEDIATE")}
                    className="text-brand focus:ring-brand-accent"
                  />
                  <div className="text-xs font-semibold font-space-grotesk">
                    Publish Immediately
                    <p className="text-[10px] text-muted-foreground font-normal">Visible and open right away</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    publishMode === "SCHEDULED"
                      ? "border-brand bg-brand/15 text-foreground shadow-sm"
                      : "border-brand/20 bg-background/50 text-muted-foreground hover:border-brand/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="publishMode"
                    value="SCHEDULED"
                    checked={publishMode === "SCHEDULED"}
                    onChange={() => setPublishMode("SCHEDULED")}
                    className="text-brand focus:ring-brand-accent"
                  />
                  <div className="text-xs font-semibold font-space-grotesk">
                    Schedule Visibility
                    <p className="text-[10px] text-muted-foreground font-normal">Opens at a specific time</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    publishMode === "DRAFT"
                      ? "border-brand bg-brand/15 text-foreground shadow-sm"
                      : "border-brand/20 bg-background/50 text-muted-foreground hover:border-brand/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="publishMode"
                    value="DRAFT"
                    checked={publishMode === "DRAFT"}
                    onChange={() => setPublishMode("DRAFT")}
                    className="text-brand focus:ring-brand-accent"
                  />
                  <div className="text-xs font-semibold font-space-grotesk">
                    Save as Draft
                    <p className="text-[10px] text-muted-foreground font-normal">Hidden from students</p>
                  </div>
                </label>
              </div>

              {publishMode === "SCHEDULED" && (
                <div className="pt-2">
                  <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase block">
                    Registration Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={registrationStartTime}
                    onChange={(e) => setRegistrationStartTime(e.target.value)}
                    className="w-full rounded-xl border border-brand/30 bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
              )}

              <label className="flex items-center gap-3 text-sm font-semibold font-space-grotesk text-foreground cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={registrationsAvailable}
                  onChange={(e) => setRegistrationsAvailable(e.target.checked)}
                  className="h-5 w-5 rounded border-brand/30 text-brand focus:ring-brand-accent"
                />
                Accept Registrations (Can be toggled off anytime)
              </label>
            </div>
          </div>

          {/* Synchronized Dynamic Custom Fields */}
          <div className="border-t border-brand/20 pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-space-grotesk text-foreground">Dynamic Registration Fields</h3>
                <p className="text-xs text-muted-foreground font-space-grotesk mt-0.5">
                  Collect custom information from participants (T-Shirt Size, GitHub link, dietary preference, image choices, numbers).
                </p>
              </div>
              <button
                type="button"
                onClick={addCustomField}
                className="rounded-xl bg-brand/20 border border-brand/40 px-4 py-2 text-xs font-bold font-mono-tech uppercase tracking-wider text-brand-accent transition-all hover:bg-brand/30 flex items-center gap-1.5 shadow-sm"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                ADD_CUSTOM_FIELD
              </button>
            </div>

            <div className="space-y-4">
              {customFields.map((cf, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-4 rounded-2xl border border-brand/20 bg-background/60 backdrop-blur-md p-5 sm:flex-row sm:items-start relative group"
                >
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase">
                          Label / Question
                        </label>
                        <input
                          type="text"
                          required
                          value={cf.label}
                          onChange={(e) => updateField(index, "label", e.target.value)}
                          className="w-full rounded-xl border border-brand/30 bg-card px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                          placeholder="e.g. GitHub Repository Link"
                        />
                      </div>
                      <div>
                        <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase">
                          Field Type
                        </label>
                        <select
                          value={cf.fieldType}
                          onChange={(e) => updateField(index, "fieldType", e.target.value)}
                          className="w-full rounded-xl border border-brand/30 bg-card px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                        >
                          <option value="TEXT">Short Text</option>
                          <option value="TEXTAREA">Long Text</option>
                          <option value="NUMBER">Number (With Min/Max)</option>
                          <option value="SELECT">Dropdown (Single Select)</option>
                          <option value="MULTI_SELECT">Checkboxes (Multi Select)</option>
                          <option value="IMAGE_POLL">Image Poll (Visual Choices)</option>
                          <option value="DISPLAY_IMAGE">Display Image / QR Code (Info Only)</option>
                          <option value="FILE_UPLOAD">File Upload (Screenshot / Document)</option>
                        </select>
                      </div>
                    </div>

                    {/* Numeric Min/Max Threshold Controls */}
                    {cf.fieldType === "NUMBER" && (
                      <div className="grid grid-cols-2 gap-4 rounded-xl border border-brand/20 bg-card/40 p-4">
                        <div>
                          <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase">
                            Minimum Value (Threshold)
                          </label>
                          <input
                            type="number"
                            value={cf.min ?? ""}
                            onChange={(e) => updateField(index, "min", e.target.value)}
                            placeholder="e.g. 1"
                            className="w-full rounded-lg border border-brand/30 bg-background/70 px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand-accent"
                          />
                        </div>
                        <div>
                          <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase">
                            Maximum Value (Threshold)
                          </label>
                          <input
                            type="number"
                            value={cf.max ?? ""}
                            onChange={(e) => updateField(index, "max", e.target.value)}
                            placeholder="e.g. 100"
                            className="w-full rounded-lg border border-brand/30 bg-background/70 px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand-accent"
                          />
                        </div>
                      </div>
                    )}

                    {/* Options for Select and Multi Select */}
                    {(cf.fieldType === "SELECT" || cf.fieldType === "MULTI_SELECT") && (
                      <div className="space-y-3 rounded-xl border border-brand/20 bg-card/40 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono-tech uppercase font-bold text-brand-accent">
                            {cf.fieldType === "SELECT" ? "Dropdown Choices" : "Checkbox Choices"}
                          </h4>
                          <button
                            type="button"
                            onClick={() => addTextOption(index)}
                            className="text-xs font-mono-tech text-gold hover:underline"
                          >
                            + ADD_OPTION
                          </button>
                        </div>
                        {(Array.isArray(cf.options) ? cf.options : []).map((opt: string, optIndex: number) => (
                          <div key={optIndex} className="flex gap-2">
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => updateTextOption(index, optIndex, e.target.value)}
                              placeholder={`Option ${optIndex + 1}`}
                              className="flex-1 rounded-lg border border-brand/30 bg-background/70 px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand-accent"
                            />
                            <button
                              type="button"
                              onClick={() => removeTextOption(index, optIndex)}
                              className="rounded-lg text-red-400 hover:bg-red-500/10 px-2.5 transition-colors"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Options for Image Poll */}
                    {cf.fieldType === "IMAGE_POLL" && (
                      <div className="space-y-3 rounded-xl border border-brand/20 bg-card/40 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono-tech uppercase font-bold text-brand-accent">
                            Visual Poll Candidates / Images
                          </h4>
                          <button
                            type="button"
                            onClick={() => addImageOption(index)}
                            className="text-xs font-mono-tech text-gold hover:underline"
                          >
                            + ADD_IMAGE_OPTION
                          </button>
                        </div>
                        {(Array.isArray(cf.options) ? cf.options : []).map((opt: any, optIndex: number) => (
                          <div key={optIndex} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                            <input
                              type="text"
                              required
                              value={opt.label || ""}
                              onChange={(e) => updateImageOption(index, optIndex, "label", e.target.value)}
                              placeholder="Title / Name (e.g. Logo 1)"
                              className="w-full sm:w-1/3 rounded-lg border border-brand/30 bg-background/70 px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand-accent"
                            />

                            {opt.imageUrl ? (
                              <div className="flex-1 flex items-center gap-2 overflow-hidden bg-background/50 border border-brand/20 rounded-lg p-1.5">
                                <img
                                  src={opt.imageUrl}
                                  alt="preview"
                                  className="h-8 w-8 object-cover rounded border border-brand/30"
                                />
                                <span className="text-xs text-muted-foreground truncate flex-1 font-mono-tech">
                                  {opt.imageUrl}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateImageOption(index, optIndex, "imageUrl", "")}
                                  className="text-xs text-red-400 hover:underline px-1"
                                >
                                  Replace
                                </button>
                              </div>
                            ) : (
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="file"
                                  required
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFieldImageUpload(index, optIndex, e.target.files[0]);
                                    }
                                  }}
                                  className="flex-1 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand/20 file:text-brand-accent hover:file:bg-brand/30 cursor-pointer"
                                />
                                {uploadingFieldImage === `${index}-${optIndex}` && (
                                  <span className="text-xs text-gold font-mono-tech animate-pulse">
                                    UPLOADING...
                                  </span>
                                )}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => removeImageOption(index, optIndex)}
                              className="rounded-lg text-red-400 hover:bg-red-500/10 p-1.5 transition-colors"
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Options for Display Image / QR Code */}
                    {cf.fieldType === "DISPLAY_IMAGE" && (
                      <div className="space-y-3 rounded-xl border border-brand/20 bg-card/40 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono-tech uppercase font-bold text-brand-accent">
                            Display Image (QR Code / Poster / Info Image)
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {cf.imageUrl ? (
                            <div className="flex items-center gap-3 bg-background/50 border border-brand/20 rounded-lg p-3">
                              <img
                                src={cf.imageUrl}
                                alt="preview"
                                className="h-20 w-20 object-contain rounded border border-brand/30 bg-white p-1"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-muted-foreground truncate block font-mono-tech">
                                  {cf.imageUrl}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateField(index, "imageUrl", "")}
                                  className="text-xs text-red-400 hover:underline mt-1"
                                >
                                  Replace Image
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleDisplayImageUpload(index, e.target.files[0]);
                                  }
                                }}
                                className="flex-1 text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand/20 file:text-brand-accent hover:file:bg-brand/30 cursor-pointer"
                              />
                              {uploadingFieldImage === `display-${index}` && (
                                <span className="text-xs text-gold font-mono-tech animate-pulse">
                                  UPLOADING...
                                </span>
                              )}
                            </div>
                          )}
                          <div>
                            <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase block">
                              Optional Caption / Payment Instructions
                            </label>
                            <input
                              type="text"
                              value={cf.caption || ""}
                              onChange={(e) => updateField(index, "caption", e.target.value)}
                              placeholder="e.g. Scan QR via UPI and upload transaction screenshot below"
                              className="w-full rounded-lg border border-brand/30 bg-background/70 px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand-accent"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* File Upload Info Box */}
                    {cf.fieldType === "FILE_UPLOAD" && (
                      <div className="rounded-xl border border-brand/20 bg-card/40 p-3.5">
                        <p className="text-xs font-mono-tech text-muted-foreground">
                          [FILE_UPLOAD] Participants will see a file upload field to attach their document or screenshot (e.g. payment receipt).
                        </p>
                      </div>
                    )}

                    {cf.fieldType !== "DISPLAY_IMAGE" && (
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer font-space-grotesk font-medium">
                        <input
                          type="checkbox"
                          checked={cf.isRequired}
                          onChange={(e) => updateField(index, "isRequired", e.target.checked)}
                          className="rounded border-brand/30 text-brand focus:ring-brand-accent"
                        />
                        Required Field
                      </label>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-all shrink-0"
                    title="Remove Question"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {customFields.length === 0 && (
                <div className="rounded-2xl border border-dashed border-brand/30 p-8 text-center text-sm text-muted-foreground font-space-grotesk">
                  No custom questions added. Default participant details (Name, USN, Email) will be gathered automatically.
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand py-4 text-center font-space-grotesk font-bold text-white shadow-xl shadow-brand/20 transition-all hover:bg-brand/90 hover:scale-[1.005] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Publishing Event..." : "Create & Launch Event"}
          </button>
        </form>
      )}

      {/* Edit Full Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setEditingEvent(null)} />
          <div className="relative w-full max-w-2xl rounded-3xl border border-brand/30 bg-card/95 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl">
            <h2 className="text-2xl font-bold font-space-grotesk mb-2 text-foreground">Edit Event Details</h2>
            <p className="text-xs text-muted-foreground font-space-grotesk mb-6">
              Update timings, dates, poster, location, format, or registration toggles.
            </p>

            <form onSubmit={handleSaveEventEdit} className="space-y-6">
              <div>
                <label className="mb-1 text-xs font-mono-tech uppercase text-muted-foreground">Title *</label>
                <input
                  required
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="mb-1 text-xs font-mono-tech uppercase text-muted-foreground">Description</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                />
              </div>

              {/* Poster Edit */}
              <div className="space-y-2">
                <label className="block text-xs font-mono-tech uppercase text-muted-foreground">Poster Image URL *</label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="url"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    className="flex-1 w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                    required
                  />
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "edit")}
                      disabled={uploadingImage}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      className="rounded-xl border border-brand/40 bg-brand/20 px-3.5 py-2 text-xs font-bold font-mono-tech uppercase text-brand-accent hover:bg-brand/30"
                    >
                      {uploadingImage ? `UPLOADING (${uploadProgress}%)` : "REPLACE"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 text-xs font-mono-tech uppercase text-muted-foreground">Start Date *</label>
                  <input
                    required
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 text-xs font-mono-tech uppercase text-muted-foreground">Start Time</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div>
                <label className="mb-1 text-xs font-mono-tech uppercase text-muted-foreground">
                  End Date & Time (Marks event as completed)
                </label>
                <input
                  type="datetime-local"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 text-xs font-mono-tech uppercase text-muted-foreground">Venue</label>
                  <input
                    type="text"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 text-xs font-mono-tech uppercase text-muted-foreground">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-brand/30 bg-card px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ONGOING">Ongoing (Live)</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 text-xs font-mono-tech uppercase text-muted-foreground">Participation Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as "SOLO" | "TEAM")}
                    className="w-full rounded-xl border border-brand/30 bg-card px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  >
                    <option value="SOLO">Solo (Individual)</option>
                    <option value="TEAM">Team Based</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 text-xs font-mono-tech uppercase text-muted-foreground">Max Teams / Capacity</label>
                  <input
                    type="number"
                    value={editMaxTeams}
                    onChange={(e) => setEditMaxTeams(e.target.value)}
                    className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {editType === "TEAM" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 text-xs font-mono-tech uppercase text-muted-foreground">Min Team Size</label>
                    <input
                      type="number"
                      min={1}
                      value={editMinTeamSize}
                      onChange={(e) => setEditMinTeamSize(Number(e.target.value))}
                      className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-xs font-mono-tech uppercase text-muted-foreground">Max Team Size</label>
                    <input
                      type="number"
                      min={1}
                      value={editMaxTeamSize}
                      onChange={(e) => setEditMaxTeamSize(Number(e.target.value))}
                      className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 text-sm font-semibold font-space-grotesk text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={editRegistrationsAvailable}
                  onChange={(e) => setEditRegistrationsAvailable(e.target.checked)}
                  className="h-5 w-5 rounded border-brand/30 text-brand focus:ring-brand-accent"
                />
                Accept Registrations (Checked = Open, Unchecked = Paused)
              </label>

              <div className="flex gap-3 pt-4 border-t border-brand/20">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="flex-1 rounded-xl border border-brand/30 bg-background/60 py-3 font-space-grotesk font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-brand py-3 font-space-grotesk font-bold text-white shadow-lg shadow-brand/25 hover:bg-brand/90 disabled:opacity-50"
                >
                  {loading ? "Saving Changes..." : "Save Event Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Photo Gallery & Showcase Modal */}
      {galleryEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setGalleryEvent(null)} />
          <div className="relative w-full max-w-2xl rounded-3xl border border-brand/30 bg-card/95 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl space-y-6">
            <div className="border-b border-brand/20 pb-3">
              <span className="text-[10px] font-mono-tech text-gold uppercase tracking-widest block">
                EVENT RECAP & PHOTO ARCHIVE
              </span>
              <h2 className="text-2xl font-bold font-space-grotesk text-foreground">{galleryEvent.title} Gallery</h2>
              <p className="text-xs text-muted-foreground font-space-grotesk mt-1">
                Upload highlight photos from the event and showcase them on the department Notice Board / Announcements page.
              </p>
            </div>

            {/* Upload Area */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-dashed border-brand/30 bg-background/50">
              <div>
                <p className="text-sm font-semibold font-space-grotesk text-foreground">Add Event Photos</p>
                <p className="text-xs text-muted-foreground">Upload photos (.jpg, .png, .webp) from camera or drive.</p>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadGalleryFile}
                  disabled={uploadingGalleryPhoto}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={uploadingGalleryPhoto}
                  className="rounded-xl border border-brand/40 bg-brand/20 px-4 py-2.5 text-xs font-bold font-mono-tech uppercase tracking-wider text-brand-accent hover:bg-brand/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <UploadCloudIcon className="w-4 h-4" />
                  {uploadingGalleryPhoto ? "UPLOADING..." : "UPLOAD_PHOTO"}
                </button>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-tech text-muted-foreground uppercase">
                <span>Uploaded Photos</span>
                <span>{galleryPhotos.length} Total</span>
              </div>

              {galleryPhotos.length === 0 ? (
                <div className="rounded-xl border border-brand/20 p-8 text-center text-xs text-muted-foreground font-space-grotesk">
                  No photos uploaded for this event yet. Use the upload button above.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                  {galleryPhotos.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-brand/25 aspect-video bg-black/40">
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryPhoto(idx)}
                        className="absolute top-1.5 right-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2Icon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Separate Publish Toggle */}
            <div className="p-4 rounded-2xl border border-brand/20 bg-background/60 space-y-2">
              <label className="flex items-center gap-3 text-sm font-semibold font-space-grotesk text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={galleryPublished}
                  onChange={(e) => setGalleryPublished(e.target.checked)}
                  className="h-5 w-5 rounded border-brand/30 text-brand focus:ring-brand-accent"
                />
                Showcase in Notice Board (Announcements)
              </label>
              <p className="text-xs text-muted-foreground font-space-grotesk pl-8">
                When enabled, a featured photo gallery card will appear on the student Notice Board for this event.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-brand/20">
              <button
                type="button"
                onClick={() => setGalleryEvent(null)}
                className="flex-1 rounded-xl border border-brand/30 bg-background/60 py-3 font-space-grotesk font-semibold text-xs text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGallery}
                disabled={loading}
                className="flex-1 rounded-xl bg-brand py-3 font-space-grotesk font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-brand/25 hover:bg-brand/90 disabled:opacity-50"
              >
                {loading ? "SAVING..." : "SAVE & APPLY"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
