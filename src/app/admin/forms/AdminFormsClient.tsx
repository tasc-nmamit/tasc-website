"use client";

import { useState } from "react";
import { downloadCSV, downloadExcel } from "@/lib/export";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { ensureFirebaseAuth } from "@/lib/firebase-client-auth";
import {
  Trash2Icon,
  PlusIcon,
  FileSpreadsheetIcon,
  Edit2Icon,
  UploadCloudIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { parseContestDate, formatDateForDateTimeLocal } from "@/lib/date-utils";
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function AdminFormsClient({ initialForms }: { initialForms: any[] }) {
  const [activeTab, setActiveTab] = useState<"LIST" | "CREATE">("LIST");
  const [forms, setForms] = useState(initialForms);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [requireAiml, setRequireAiml] = useState(false);
  const [allowEdit, setAllowEdit] = useState(false);
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [published, setPublished] = useState(true);

  // Custom Fields State
  const [fields, setFields] = useState<any[]>([]);

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const addField = () => {
    setFields([
      ...fields,
      { label: "", type: "TEXT", isRequired: false, options: [], min: "", max: "" },
    ]);
  };

  const updateField = (index: number, key: string, value: any) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // Handle TEXT Options for SELECT and MULTI_SELECT
  const addTextOption = (fieldIndex: number) => {
    const updated = [...fields];
    if (!Array.isArray(updated[fieldIndex].options)) {
      updated[fieldIndex].options = [];
    }
    updated[fieldIndex].options.push("");
    setFields(updated);
  };

  const updateTextOption = (fieldIndex: number, optIndex: number, value: string) => {
    const updated = [...fields];
    updated[fieldIndex].options[optIndex] = value;
    setFields(updated);
  };

  const removeTextOption = (fieldIndex: number, optIndex: number) => {
    const updated = [...fields];
    updated[fieldIndex].options.splice(optIndex, 1);
    setFields(updated);
  };

  // Handle IMAGE_POLL options
  const addImageOption = (fieldIndex: number) => {
    const updated = [...fields];
    if (!Array.isArray(updated[fieldIndex].options)) {
      updated[fieldIndex].options = [];
    }
    updated[fieldIndex].options.push({ label: "", imageUrl: "" });
    setFields(updated);
  };

  const updateImageOption = (fieldIndex: number, optIndex: number, key: string, value: string) => {
    const updated = [...fields];
    updated[fieldIndex].options[optIndex][key] = value;
    setFields(updated);
  };

  const removeImageOption = (fieldIndex: number, optIndex: number) => {
    const updated = [...fields];
    updated[fieldIndex].options.splice(optIndex, 1);
    setFields(updated);
  };

  const handleImageUpload = async (fieldIndex: number, optIndex: number, file: File) => {
    if (!file) return;

    const uploadId = `${fieldIndex}-${optIndex}`;
    setUploadingImage(uploadId);

    const fileExtension = file.name.split(".").pop();
    const fileName = `poll-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    try {
      await ensureFirebaseAuth();
    } catch (err: any) {
      alert("Upload failed: " + err.message);
      setUploadingImage(null);
      return;
    }
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (error) => {
        alert("Upload failed: " + error.message);
        setUploadingImage(null);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        updateImageOption(fieldIndex, optIndex, "imageUrl", url);
        setUploadingImage(null);
      }
    );
  };

  // Start Editing an Existing Form
  const handleStartEdit = (form: any) => {
    setEditingId(form.id);
    setTitle(form.title || "");
    setDescription(form.description || "");
    setStartTime(form.startTime ? formatDateForDateTimeLocal(form.startTime) : "");
    setEndTime(form.endTime ? formatDateForDateTimeLocal(form.endTime) : "");
    setRequireAiml(Boolean(form.requireAiml));
    setAllowEdit(Boolean(form.allowEdit));
    setAllowAnonymous(Boolean(form.allowAnonymous));
    setPublished(form.published ?? true);

    if (form.fields && Array.isArray(form.fields)) {
      setFields(
        form.fields.map((f: any) => ({
          id: f.id,
          label: f.label || "",
          type: f.type || "TEXT",
          isRequired: Boolean(f.isRequired),
          options: f.options || [],
          min:
            f.options && typeof f.options === "object" && "min" in f.options && f.options.min !== null
              ? String(f.options.min)
              : "",
          max:
            f.options && typeof f.options === "object" && "max" in f.options && f.options.max !== null
              ? String(f.options.max)
              : "",
        }))
      );
    } else {
      setFields([]);
    }

    setActiveTab("CREATE");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel Edit Mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setRequireAiml(false);
    setAllowEdit(false);
    setAllowAnonymous(false);
    setPublished(true);
    setFields([]);
    setActiveTab("LIST");
  };

  // Create or Update Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title,
        description,
        published,
        startTime: startTime ? parseContestDate(startTime).toISOString() : null,
        endTime: endTime ? parseContestDate(endTime).toISOString() : null,
        requireAiml,
        allowEdit,
        allowAnonymous: requireAiml ? false : allowAnonymous,
        fields: fields.map((f) => {
          let fieldOptions: any = null;
          if (f.type === "SELECT" || f.type === "MULTI_SELECT" || f.type === "IMAGE_POLL") {
            fieldOptions = f.options;
          } else if (f.type === "NUMBER") {
            fieldOptions = {
              min: f.min !== "" && f.min !== undefined && f.min !== null ? Number(f.min) : null,
              max: f.max !== "" && f.max !== undefined && f.max !== null ? Number(f.max) : null,
            };
          }
          return {
            id: f.id,
            label: f.label,
            type: f.type,
            isRequired: f.isRequired,
            options: fieldOptions,
          };
        }),
      };

      const url = editingId ? `/api/admin/forms/${editingId}` : "/api/admin/forms";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();

      alert(editingId ? "Form details updated successfully!" : "Form created successfully!");

      if (editingId) {
        setForms((prev: any[]) => prev.map((f) => (f.id === editingId ? { ...f, ...saved } : f)));
        handleCancelEdit();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      alert(`Error ${editingId ? "updating" : "creating"} form: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form and ALL its responses?")) return;
    try {
      const res = await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setForms(forms.filter((f: any) => f.id !== id));
      alert("Form deleted.");
    } catch (err) {
      alert("Error deleting form.");
    }
  };

  // Quick Toggles
  const handleToggleAiml = async (id: string, currentVal: boolean) => {
    try {
      const nextVal = !currentVal;
      const res = await fetch(`/api/admin/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requireAiml: nextVal }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setForms(forms.map((f: any) => (f.id === id ? { ...f, ...updated } : f)));
    } catch (err: any) {
      alert("Error updating AIML restriction: " + err.message);
    }
  };

  const handleToggleAnonymous = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowAnonymous: !currentVal }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setForms(forms.map((f: any) => (f.id === id ? { ...f, ...updated } : f)));
    } catch (err: any) {
      alert("Error updating guest access: " + err.message);
    }
  };

  const handleToggleEdit = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowEdit: !currentVal }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setForms(forms.map((f: any) => (f.id === id ? { ...f, ...updated } : f)));
    } catch (err: any) {
      alert("Error updating edit permission: " + err.message);
    }
  };

  const handleTogglePublished = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentVal }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setForms(forms.map((f: any) => (f.id === id ? { ...f, ...updated } : f)));
    } catch (err: any) {
      alert("Error updating published status: " + err.message);
    }
  };

  const handleExport = async (formId: string, format: "csv" | "excel") => {
    setExporting(formId);
    try {
      const res = await fetch(`/api/admin/forms/${formId}/export`);
      const { data, formTitle, error } = await res.json();

      if (error) throw new Error(error);

      if (data.length === 0) {
        alert("No responses found for this form.");
        return;
      }

      const filename = `${formTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_responses`;

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
      {/* Tab Controls */}
      <div className="flex gap-3 border-b border-brand/20 pb-4">
        <button
          onClick={() => {
            if (editingId) handleCancelEdit();
            else setActiveTab("LIST");
          }}
          className={`px-5 py-2.5 rounded-xl font-space-grotesk font-semibold text-sm transition-all ${
            activeTab === "LIST"
              ? "bg-brand/20 text-brand-accent border border-brand/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          Manage Forms ({forms.length})
        </button>
        <button
          onClick={() => {
            if (!editingId) {
              setTitle("");
              setDescription("");
              setStartTime("");
              setEndTime("");
              setRequireAiml(false);
              setAllowEdit(false);
              setAllowAnonymous(false);
              setPublished(true);
              setFields([]);
            }
            setActiveTab("CREATE");
          }}
          className={`px-5 py-2.5 rounded-xl font-space-grotesk font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === "CREATE"
              ? "bg-brand/20 text-brand-accent border border-brand/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          {editingId ? (
            <>
              <Edit2Icon className="w-4 h-4" />
              Edit Form Details
            </>
          ) : (
            <>
              <PlusIcon className="w-4 h-4" />
              Create New Form
            </>
          )}
        </button>
      </div>

      {activeTab === "LIST" && (
        <div className="space-y-4">
          {forms.length === 0 ? (
            <div className="rounded-2xl border border-brand/20 bg-card/60 backdrop-blur-xl p-12 text-center text-muted-foreground font-space-grotesk">
              No forms created yet. Click "Create New Form" above to launch a new poll or questionnaire.
            </div>
          ) : (
            forms.map((form: any) => (
              <div
                key={form.id}
                className="group relative flex flex-col justify-between gap-6 rounded-2xl border border-brand/20 bg-card/70 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:border-brand-accent/50 lg:flex-row lg:items-center"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-lg px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider border ${
                        form.published
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/40"
                      }`}
                    >
                      {form.published ? "PUBLISHED" : "DRAFT"}
                    </span>
                    {form.requireAiml ? (
                      <span className="rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/40 px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider">
                        AIML ONLY
                      </span>
                    ) : (
                      <span className="rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider">
                        ALL BRANCHES
                      </span>
                    )}
                    {form.allowAnonymous && (
                      <span className="rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/40 px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider">
                        GUEST ALLOWED
                      </span>
                    )}
                    {form.allowEdit && (
                      <span className="rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/40 px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider">
                        EDITABLE BY USERS
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold font-space-grotesk text-foreground">{form.title}</h3>

                  {form.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl font-space-grotesk">
                      {form.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 font-mono-tech text-xs text-muted-foreground pt-1">
                    <span>
                      RESPONSES: <strong className="text-gold font-bold">{form._count?.responses ?? 0}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      QUESTIONS: <strong className="text-foreground">{form.fields?.length ?? 0}</strong>
                    </span>
                    <span>•</span>
                    <span>CREATED: {new Date(form.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-3 shrink-0">
                  {/* Quick Toggles Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-background/50 border border-brand/20 p-1.5 rounded-xl">
                    {/* AIML Only Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleAiml(form.id, form.requireAiml)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold font-mono-tech uppercase transition-all ${
                        form.requireAiml
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                      }`}
                      title={
                        form.requireAiml
                          ? "Restricted to AIML branch. Click to toggle to All Students."
                          : "Open to all branches. Click to restrict to AIML students only."
                      }
                    >
                      AIML: {form.requireAiml ? "ON" : "OFF"}
                    </button>

                    {/* Guest Access Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleAnonymous(form.id, form.allowAnonymous)}
                      disabled={form.requireAiml}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold font-mono-tech uppercase transition-all ${
                        form.allowAnonymous
                          ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                      title={
                        form.requireAiml
                          ? "AIML Only forms require authenticated students; guests cannot be enabled."
                          : form.allowAnonymous
                          ? "Guest submissions enabled. Click to require student sign-in."
                          : "Click to allow submissions without signing in."
                      }
                    >
                      Guests: {form.allowAnonymous ? "YES" : "NO"}
                    </button>

                    {/* Allow Edits Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleEdit(form.id, form.allowEdit)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold font-mono-tech uppercase transition-all ${
                        form.allowEdit
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                      }`}
                      title={
                        form.allowEdit
                          ? "Users can edit their answers. Click to lock submissions after submit."
                          : "Submissions locked. Click to allow users to edit their previous response."
                      }
                    >
                      Edits: {form.allowEdit ? "YES" : "NO"}
                    </button>

                    {/* Publish / Draft Toggle */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(form.id, form.published)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold font-mono-tech uppercase transition-all ${
                        form.published
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                      title={form.published ? "Live. Click to unpublish as draft." : "Draft. Click to publish live."}
                    >
                      {form.published ? "Published" : "Draft"}
                    </button>
                  </div>

                  {/* Actions: Edit Details, Export, Delete */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(form)}
                      className="rounded-xl border border-brand/40 bg-brand/15 px-3 py-1.5 text-xs font-bold text-brand-accent transition-all hover:bg-brand/25 flex items-center gap-1.5"
                      title="Edit full form details, schedule, and questions"
                    >
                      <Edit2Icon className="w-3.5 h-3.5" />
                      Edit Details
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExport(form.id, "csv")}
                      disabled={exporting === form.id}
                      className="rounded-xl border border-brand/30 bg-background/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-brand/10 hover:border-brand-accent/50 flex items-center gap-1.5 disabled:opacity-50"
                      title="Export Responses to CSV"
                    >
                      <FileSpreadsheetIcon className="w-3.5 h-3.5 text-brand-accent" />
                      CSV
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExport(form.id, "excel")}
                      disabled={exporting === form.id}
                      className="rounded-xl border border-brand/30 bg-background/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-brand/10 hover:border-brand-accent/50 flex items-center gap-1.5 disabled:opacity-50"
                      title="Export Responses to Excel"
                    >
                      <FileSpreadsheetIcon className="w-3.5 h-3.5 text-emerald-400" />
                      Excel
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(form.id)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500/20"
                      title="Delete Form and Responses"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "CREATE" && (
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl border border-brand/20 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
        >
          {/* Edit Mode Active Banner */}
          {editingId && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-brand/40 bg-brand/10 text-brand-accent">
              <div className="flex items-center gap-2">
                <Edit2Icon className="w-4 h-4 text-brand-accent" />
                <span className="font-space-grotesk font-semibold text-sm">
                  Editing Form: <strong className="text-foreground">{title || "Untitled Form"}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs font-mono-tech uppercase font-bold text-muted-foreground hover:text-foreground underline cursor-pointer flex items-center gap-1"
              >
                <XIcon className="w-3.5 h-3.5" />
                Cancel Edit
              </button>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Form Title *
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                placeholder="e.g., TASC Logo Selection 2026"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Description / Instructions
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                placeholder="Provide guidelines for respondents..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Scheduled Start Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold font-space-grotesk text-foreground">
                Scheduled End Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-brand/30 bg-background/60 px-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            {/* Form Behavior & Access Toggles */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-6 sm:col-span-2 border border-brand/20 p-5 rounded-2xl bg-background/40">
              {/* AIML Only Toggle */}
              <label className="flex items-start gap-3 text-sm font-semibold font-space-grotesk text-foreground cursor-pointer flex-1 min-w-[240px]">
                <input
                  type="checkbox"
                  checked={requireAiml}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRequireAiml(checked);
                    if (checked) setAllowAnonymous(false);
                  }}
                  className="mt-0.5 h-5 w-5 rounded border-brand/30 text-brand focus:ring-brand-accent"
                />
                <div>
                  <span>AIML Students Only</span>
                  <p className="text-xs text-muted-foreground font-normal">
                    Restricts form submissions to verified AIML department students.
                  </p>
                </div>
              </label>

              {/* Guest Submissions Toggle */}
              <label className="flex items-start gap-3 text-sm font-semibold font-space-grotesk text-foreground cursor-pointer flex-1 min-w-[240px]">
                <input
                  type="checkbox"
                  checked={allowAnonymous}
                  disabled={requireAiml}
                  onChange={(e) => setAllowAnonymous(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-brand/30 text-brand focus:ring-brand-accent disabled:opacity-40"
                />
                <div>
                  <span>Allow Guest Submissions</span>
                  <p className="text-xs text-muted-foreground font-normal">
                    Anyone with the link can fill and submit this form without signing in.
                  </p>
                </div>
              </label>

              {/* Allow Edits Toggle */}
              <label className="flex items-start gap-3 text-sm font-semibold font-space-grotesk text-foreground cursor-pointer flex-1 min-w-[240px]">
                <input
                  type="checkbox"
                  checked={allowEdit}
                  onChange={(e) => setAllowEdit(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-brand/30 text-brand focus:ring-brand-accent"
                />
                <div>
                  <span>Allow Users to Edit Responses</span>
                  <p className="text-xs text-muted-foreground font-normal">
                    Signed-in respondents can return and update their previous answers.
                  </p>
                </div>
              </label>

              {/* Published Toggle */}
              <label className="flex items-start gap-3 text-sm font-semibold font-space-grotesk text-foreground cursor-pointer flex-1 min-w-[240px]">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-brand/30 text-brand focus:ring-brand-accent"
                />
                <div>
                  <span>Published / Live</span>
                  <p className="text-xs text-muted-foreground font-normal">
                    When checked, the form is published and active for respondents.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Dynamic Fields Section */}
          <div className="border-t border-brand/20 pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-space-grotesk text-foreground">Form Questions & Fields</h3>
                <p className="text-xs text-muted-foreground font-space-grotesk mt-0.5">
                  Configure text inputs, numerical thresholds, multiple choice dropdowns, file uploads, or visual image polls.
                </p>
              </div>
              <button
                type="button"
                onClick={addField}
                className="rounded-xl bg-brand/20 border border-brand/40 px-4 py-2 text-xs font-bold font-mono-tech uppercase tracking-wider text-brand-accent transition-all hover:bg-brand/30 flex items-center gap-1.5 shadow-sm"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                ADD_FIELD
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((cf, index) => (
                <div
                  key={cf.id || index}
                  className="flex gap-4 items-start rounded-2xl border border-brand/20 bg-background/60 p-5 shadow-sm"
                >
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-mono-tech uppercase text-muted-foreground">
                          Question Label *
                        </label>
                        <input
                          type="text"
                          required
                          value={cf.label}
                          onChange={(e) => updateField(index, "label", e.target.value)}
                          placeholder="e.g. Which project did you like most?"
                          className="w-full rounded-lg border border-brand/30 bg-background/80 px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-mono-tech uppercase text-muted-foreground">
                          Response Type
                        </label>
                        <select
                          value={cf.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            updateField(index, "type", newType);
                            if (newType === "SELECT" || newType === "MULTI_SELECT") {
                              if (!Array.isArray(cf.options) || cf.options.length === 0) {
                                updateField(index, "options", ["Option 1", "Option 2"]);
                              }
                            } else if (newType === "IMAGE_POLL") {
                              if (!Array.isArray(cf.options) || cf.options.length === 0) {
                                updateField(index, "options", [{ label: "Candidate A", imageUrl: "" }]);
                              }
                            }
                          }}
                          className="w-full rounded-lg border border-brand/30 bg-background/80 px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent cursor-pointer"
                        >
                          <option value="TEXT">Short Text Answer</option>
                          <option value="NUMBER">Number (With min/max limits)</option>
                          <option value="SELECT">Single Choice Dropdown</option>
                          <option value="MULTI_SELECT">Multiple Choice Selection</option>
                          <option value="FILE_UPLOAD">File Upload (Images, PDFs, Docs)</option>
                          <option value="IMAGE_POLL">Visual Image Poll (Voting Cards)</option>
                        </select>
                      </div>
                    </div>

                    {/* Numeric Min / Max Limits */}
                    {cf.type === "NUMBER" && (
                      <div className="flex gap-4 p-4 rounded-xl border border-brand/20 bg-card/40">
                        <div className="flex-1">
                          <label className="mb-1 block text-xs font-mono-tech uppercase text-muted-foreground">
                            Minimum Value (Optional)
                          </label>
                          <input
                            type="number"
                            value={cf.min}
                            onChange={(e) => updateField(index, "min", e.target.value)}
                            placeholder="e.g. 1"
                            className="w-full rounded-lg border border-brand/30 bg-background/80 px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand-accent"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="mb-1 block text-xs font-mono-tech uppercase text-muted-foreground">
                            Maximum Value (Optional)
                          </label>
                          <input
                            type="number"
                            value={cf.max}
                            onChange={(e) => updateField(index, "max", e.target.value)}
                            placeholder="e.g. 100"
                            className="w-full rounded-lg border border-brand/30 bg-background/80 px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand-accent"
                          />
                        </div>
                      </div>
                    )}

                    {/* Options for SELECT and MULTI_SELECT */}
                    {(cf.type === "SELECT" || cf.type === "MULTI_SELECT") && (
                      <div className="space-y-3 rounded-xl border border-brand/20 bg-card/40 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono-tech uppercase font-bold text-brand-accent">
                            Dropdown Choices
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
                    {cf.type === "IMAGE_POLL" && (
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
                              placeholder="Title / Name (e.g. Option A)"
                              className="w-full sm:w-1/3 rounded-lg border border-brand/30 bg-background/70 px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand-accent"
                            />

                            {opt.imageUrl ? (
                              <div className="flex-1 flex items-center gap-2 overflow-hidden bg-background/50 border border-brand/20 rounded-lg p-1.5">
                                <OptimizedImage
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
                                      handleImageUpload(index, optIndex, e.target.files[0]);
                                    }
                                  }}
                                  className="flex-1 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand/20 file:text-brand-accent hover:file:bg-brand/30 cursor-pointer"
                                />
                                {uploadingImage === `${index}-${optIndex}` && (
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

                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer font-space-grotesk font-medium">
                      <input
                        type="checkbox"
                        checked={cf.isRequired}
                        onChange={(e) => updateField(index, "isRequired", e.target.checked)}
                        className="rounded border-brand/30 text-brand focus:ring-brand-accent"
                      />
                      Required Question
                    </label>
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

              {fields.length === 0 && (
                <div className="rounded-2xl border border-dashed border-brand/30 p-8 text-center text-sm text-muted-foreground font-space-grotesk">
                  No questions added yet. Click "+ ADD_FIELD" to start building your form.
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand py-4 text-center font-space-grotesk font-bold text-white shadow-xl shadow-brand/20 transition-all hover:bg-brand/90 hover:scale-[1.005] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {editingId ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
            {loading ? "Saving..." : editingId ? "Update Form Details" : "Create & Launch Form"}
          </button>
        </form>
      )}
    </div>
  );
}
