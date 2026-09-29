"use client";

import { useState, useEffect } from "react";
import { downloadCSV, downloadExcel } from "@/lib/export";
import Link from "next/link";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { slugify } from "@/lib/slug";
import CustomFieldsEditor from "./CustomFieldsEditor";
import ClientPortal from "@/components/ui/ClientPortal";
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
  SendIcon,
  EyeOffIcon,
} from "lucide-react";

export default function AdminEventsClient({ initialEvents }: { initialEvents: any[] }) {
  const [activeTab, setActiveTab] = useState<"LIST" | "CREATE">("LIST");
  const [events, setEvents] = useState(initialEvents);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [venue, setVenue] = useState("");
  const [type, setType] = useState<"SOLO" | "TEAM" | "SOLO_OR_TEAM">("SOLO");
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
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editType, setEditType] = useState<"SOLO" | "TEAM" | "SOLO_OR_TEAM">("SOLO");
  const [editMinTeamSize, setEditMinTeamSize] = useState(1);
  const [editMaxTeamSize, setEditMaxTeamSize] = useState(1);
  const [editMaxTeams, setEditMaxTeams] = useState("");
  const [editStatus, setEditStatus] = useState("UPCOMING");
  const [editPublishMode, setEditPublishMode] = useState<"IMMEDIATE" | "DRAFT" | "SCHEDULED">("IMMEDIATE");
  const [editRegistrationStartTime, setEditRegistrationStartTime] = useState("");
  const [editRegistrationsAvailable, setEditRegistrationsAvailable] = useState(true);

  // Event Gallery Modal State
  const [galleryEvent, setGalleryEvent] = useState<any | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryPublished, setGalleryPublished] = useState(false);
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false);

  useEffect(() => {
    if (editingEvent || galleryEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [editingEvent, galleryEvent]);

  // Firebase Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFieldImage, setUploadingFieldImage] = useState<string | null>(null);

  // Custom Fields State
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [editCustomFields, setEditCustomFields] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const formatCustomFieldsPayload = (fieldsList: any[]) => {
    return fieldsList.map((cf) => {
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
        id: cf.id,
        label: cf.label,
        fieldType: cf.fieldType,
        isRequired: cf.fieldType === "DISPLAY_IMAGE" ? false : !!cf.isRequired,
        options: fieldOptions,
        registrationMode: cf.registrationMode || "ALL",
        targetRole: cf.targetRole || "ALL_MEMBERS",
      };
    });
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
        slug: slug.trim() ? slugify(slug) : slugify(title),
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
        customFields: formatCustomFieldsPayload(customFields),
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

  const handleTogglePublish = async (id: string, currentlyPublished: boolean) => {
    try {
      const newPublished = !currentlyPublished;
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          published: newPublished,
          status: newPublished ? "UPCOMING" : "DRAFT",
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      const updated = await res.json();
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                ...updated,
                published: newPublished,
                status: newPublished ? (e.status === "DRAFT" ? "UPCOMING" : e.status) : "DRAFT",
              }
            : e
        )
      );
      alert(
        newPublished
          ? "Event published successfully! It is now visible on the website."
          : "Event moved to draft. It is now hidden from the public website."
      );
    } catch (err: any) {
      alert("Failed to toggle publication status: " + err.message);
    }
  };

  const handleDeleteEvent = async (id: string, eventTitle?: string) => {
    const displayName = eventTitle ? `"${eventTitle}"` : "this event";
    if (
      !confirm(
        `Are you sure you want to permanently delete ${displayName}?\n\nThis will remove the event along with all participant registrations, teams, winners, and configured custom fields. This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingEventId(id);
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete event");
      }

      setEvents((prev) => prev.filter((e) => e.id !== id));
      if (editingEvent?.id === id) {
        setEditingEvent(null);
      }
      alert("Event permanently deleted.");
    } catch (err: any) {
      alert("Failed to delete event: " + err.message);
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleOpenEdit = (ev: any) => {
    setEditingEvent(ev);
    setEditTitle(ev.title || "");
    setEditSlug(ev.slug || slugify(ev.title || ""));
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

    let initialMode: "IMMEDIATE" | "SCHEDULED" | "DRAFT" = "IMMEDIATE";
    if (!ev.published || ev.status === "DRAFT") {
      initialMode = "DRAFT";
    } else if (ev.registrationStartTime && new Date(ev.registrationStartTime) > new Date()) {
      initialMode = "SCHEDULED";
    }
    setEditPublishMode(initialMode);
    setEditRegistrationStartTime(
      ev.registrationStartTime
        ? new Date(ev.registrationStartTime).toISOString().slice(0, 16)
        : ""
    );

    const mappedFields = (ev.customFields || []).map((cf: any) => {
      const opts = cf.options;
      return {
        id: cf.id,
        label: cf.label || "",
        fieldType: cf.fieldType || "TEXT",
        isRequired: !!cf.isRequired,
        options: Array.isArray(opts) ? opts : [],
        min: opts?.min !== undefined && opts?.min !== null ? opts.min : "",
        max: opts?.max !== undefined && opts?.max !== null ? opts.max : "",
        imageUrl: opts?.imageUrl || "",
        caption: opts?.caption || "",
        registrationMode: cf.registrationMode || "ALL",
        targetRole: cf.targetRole || "ALL_MEMBERS",
      };
    });
    setEditCustomFields(mappedFields);
  };

  const handleSaveEventEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setLoading(true);
    try {
      const isPublished = editPublishMode !== "DRAFT";
      let statusToSave = editStatus;
      if (editPublishMode === "DRAFT") {
        statusToSave = "DRAFT";
      } else if (statusToSave === "DRAFT") {
        statusToSave = "UPCOMING";
      }

      const payload = {
        title: editTitle,
        slug: editSlug.trim() ? slugify(editSlug) : slugify(editTitle),
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
        status: statusToSave,
        published: isPublished,
        registrationStartTime:
          editPublishMode === "SCHEDULED" && editRegistrationStartTime
            ? new Date(editRegistrationStartTime).toISOString()
            : null,
        registrationsAvailable: editRegistrationsAvailable,
        customFields: formatCustomFieldsPayload(editCustomFields),
      };

      const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      const updated = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? { ...e, ...updated } : e)));
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
              No events found. Click &ldquo;Create New Event&rdquo; above to publish a competition or workshop.
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="group relative flex flex-col justify-between gap-4 rounded-2xl border border-brand/20 bg-card/70 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:border-brand-accent/50 sm:flex-row sm:items-center"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {(!event.published || event.status === "DRAFT") ? (
                      <span className="rounded-lg px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider border bg-amber-500/15 text-amber-400 border-amber-500/40 flex items-center gap-1.5">
                        <EyeOffIcon className="w-3 h-3" />
                        DRAFT (HIDDEN)
                      </span>
                    ) : (event.registrationStartTime && new Date(event.registrationStartTime) > new Date()) ? (
                      <span className="rounded-lg px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider border bg-sky-500/15 text-sky-400 border-sky-500/40 flex items-center gap-1.5">
                        <ClockIcon className="w-3 h-3" />
                        SCHEDULED
                      </span>
                    ) : (
                      <span
                        className={`rounded-lg px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider border ${
                          event.status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                            : "bg-brand/15 text-brand-accent border-brand/40"
                        }`}
                      >
                        {event.status}
                      </span>
                    )}
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

                  <h3 className="text-xl font-bold font-space-grotesk text-foreground flex flex-wrap items-center gap-2">
                    <Link href={`/events/${event.slug || event.id}`} className="hover:underline hover:text-brand-accent">
                      {event.title}
                    </Link>
                    {event.slug && (
                      <span className="font-mono-tech text-[11px] font-normal text-brand-accent/90 bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
                        /{event.slug}
                      </span>
                    )}
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
                  {/* Quick Publish / Move to Draft Toggle */}
                  <button
                    onClick={() => handleTogglePublish(event.id, !!event.published && event.status !== "DRAFT")}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-semibold font-space-grotesk transition-all flex items-center gap-1.5 cursor-pointer ${
                      (!event.published || event.status === "DRAFT")
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 shadow-sm"
                        : "border-brand/30 bg-background/60 text-muted-foreground hover:text-amber-400 hover:border-amber-500/40"
                    }`}
                    title={(!event.published || event.status === "DRAFT") ? "Publish this event to students" : "Move event to draft and hide from students"}
                  >
                    {(!event.published || event.status === "DRAFT") ? (
                      <>
                        <SendIcon className="w-3.5 h-3.5" />
                        <span>Publish Now</span>
                      </>
                    ) : (
                      <>
                        <EyeOffIcon className="w-3.5 h-3.5" />
                        <span>Move to Draft</span>
                      </>
                    )}
                  </button>

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

                  <button
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    disabled={deletingEventId === event.id}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0"
                    title="Delete Event"
                  >
                    <Trash2Icon className="w-4 h-4" />
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
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  if (!isSlugManual) {
                    setSlug(slugify(val));
                  }
                }}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                placeholder="e.g. AI Hackathon 2026"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold font-space-grotesk text-foreground">
                  Custom Event Slug / Slang
                </label>
                <span className="text-xs font-mono-tech text-brand-accent">
                  URL: /events/{slug || slugify(title) || "custom-slug"}
                </span>
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setIsSlugManual(true);
                  setSlug(slugify(e.target.value));
                }}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent font-mono-tech"
                placeholder="e.g. ai-hackathon-2026"
              />
              <p className="mt-1 text-xs text-muted-foreground font-space-grotesk">
                Unique URL slug for this event. Auto-generated from title, or enter your own custom slug.
              </p>
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
                onChange={(e) => setType(e.target.value as "SOLO" | "TEAM" | "SOLO_OR_TEAM")}
                className="w-full rounded-xl border border-brand/30 bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent"
              >
                <option value="SOLO">Solo (Individual)</option>
                <option value="TEAM">Team Based</option>
                <option value="SOLO_OR_TEAM">Solo or Team (Participant Chooses)</option>
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

            {(type === "TEAM" || type === "SOLO_OR_TEAM") && (
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

          {/* Dynamic Registration Fields */}
          <CustomFieldsEditor
            fields={customFields}
            setFields={setCustomFields}
            eventType={type}
          />

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
        <ClientPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-md" onClick={() => setEditingEvent(null)} />
            <div className="relative w-full max-w-2xl rounded-3xl border border-brand/30 bg-card/95 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl my-auto">
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono-tech uppercase text-muted-foreground">URL Slug / Slang</label>
                  <span className="text-[11px] font-mono-tech text-brand-accent">
                    /events/{editSlug || slugify(editTitle)}
                  </span>
                </div>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(slugify(e.target.value))}
                  className="w-full rounded-xl border border-brand/30 bg-background/70 px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent font-mono-tech"
                  placeholder="e.g. custom-event-slug"
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
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setEditStatus(newStatus);
                      if (newStatus === "DRAFT") {
                        setEditPublishMode("DRAFT");
                      } else if (editPublishMode === "DRAFT") {
                        setEditPublishMode("IMMEDIATE");
                      }
                    }}
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
                    onChange={(e) => setEditType(e.target.value as "SOLO" | "TEAM" | "SOLO_OR_TEAM")}
                    className="w-full rounded-xl border border-brand/30 bg-card px-4 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                  >
                    <option value="SOLO">Solo (Individual)</option>
                    <option value="TEAM">Team Based</option>
                    <option value="SOLO_OR_TEAM">Solo or Team (Participant Chooses)</option>
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

              {(editType === "TEAM" || editType === "SOLO_OR_TEAM") && (
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

              {/* Publication Status & Visibility */}
              <div className="space-y-4 border border-brand/20 p-5 rounded-2xl bg-background/40">
                <label className="block text-sm font-bold font-space-grotesk text-foreground">
                  Publication Status & Visibility
                </label>

                <div className="grid sm:grid-cols-3 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      editPublishMode === "IMMEDIATE"
                        ? "border-brand bg-brand/15 text-foreground shadow-sm"
                        : "border-brand/20 bg-background/50 text-muted-foreground hover:border-brand/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="editPublishMode"
                      value="IMMEDIATE"
                      checked={editPublishMode === "IMMEDIATE"}
                      onChange={() => {
                        setEditPublishMode("IMMEDIATE");
                        if (editStatus === "DRAFT") setEditStatus("UPCOMING");
                      }}
                      className="text-brand focus:ring-brand-accent"
                    />
                    <div className="text-xs font-semibold font-space-grotesk">
                      Published
                      <p className="text-[10px] text-muted-foreground font-normal">Visible to students</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      editPublishMode === "SCHEDULED"
                        ? "border-brand bg-brand/15 text-foreground shadow-sm"
                        : "border-brand/20 bg-background/50 text-muted-foreground hover:border-brand/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="editPublishMode"
                      value="SCHEDULED"
                      checked={editPublishMode === "SCHEDULED"}
                      onChange={() => {
                        setEditPublishMode("SCHEDULED");
                        if (editStatus === "DRAFT") setEditStatus("UPCOMING");
                      }}
                      className="text-brand focus:ring-brand-accent"
                    />
                    <div className="text-xs font-semibold font-space-grotesk">
                      Scheduled
                      <p className="text-[10px] text-muted-foreground font-normal">Opens at set time</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      editPublishMode === "DRAFT"
                        ? "border-brand bg-brand/15 text-foreground shadow-sm"
                        : "border-brand/20 bg-background/50 text-muted-foreground hover:border-brand/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="editPublishMode"
                      value="DRAFT"
                      checked={editPublishMode === "DRAFT"}
                      onChange={() => {
                        setEditPublishMode("DRAFT");
                        setEditStatus("DRAFT");
                      }}
                      className="text-brand focus:ring-brand-accent"
                    />
                    <div className="text-xs font-semibold font-space-grotesk">
                      Draft (Hidden)
                      <p className="text-[10px] text-muted-foreground font-normal">Hidden from students</p>
                    </div>
                  </label>
                </div>

                {editPublishMode === "SCHEDULED" && (
                  <div className="pt-2">
                    <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase block">
                      Scheduled Registration / Visibility Time
                    </label>
                    <input
                      type="datetime-local"
                      value={editRegistrationStartTime}
                      onChange={(e) => setEditRegistrationStartTime(e.target.value)}
                      className="w-full rounded-xl border border-brand/30 bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-accent font-mono-tech"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold font-space-grotesk text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={editRegistrationsAvailable}
                  onChange={(e) => setEditRegistrationsAvailable(e.target.checked)}
                  className="h-5 w-5 rounded border-brand/30 text-brand focus:ring-brand-accent"
                />
                Accept Registrations (Checked = Open, Unchecked = Paused)
              </label>

              {/* Editable Dynamic Registration Fields in Edit Modal */}
              <CustomFieldsEditor
                fields={editCustomFields}
                setFields={setEditCustomFields}
                eventType={editType}
                title="Registration Questionnaire & Custom Fields"
                subtitle="Modify existing questions, add new ones, reorder, or delete obsolete fields."
              />

              <div className="flex flex-wrap sm:flex-nowrap gap-3 pt-4 border-t border-brand/20 items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(editingEvent.id, editingEvent.title)}
                  disabled={deletingEventId === editingEvent.id || loading}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 font-space-grotesk font-semibold text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Trash2Icon className="w-4 h-4" />
                  {deletingEventId === editingEvent.id ? "Deleting..." : "Delete Event"}
                </button>

                <div className="flex gap-3 flex-1 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="rounded-xl border border-brand/30 bg-background/60 px-5 py-2.5 font-space-grotesk font-semibold text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-brand px-6 py-2.5 font-space-grotesk font-bold text-white shadow-lg shadow-brand/25 hover:bg-brand/90 disabled:opacity-50"
                  >
                    {loading ? "Saving Changes..." : "Save Event Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* Event Photo Gallery & Showcase Modal */}
      {galleryEvent && (
        <ClientPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-md" onClick={() => setGalleryEvent(null)} />
            <div className="relative w-full max-w-2xl rounded-3xl border border-brand/30 bg-card/95 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl space-y-6 my-auto">
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
      </ClientPortal>
      )}
    </div>
  );
}
