"use client";

import { useState } from "react";
import { downloadCSV, downloadExcel } from "@/lib/export";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Trash2Icon, PlusIcon, FileSpreadsheetIcon, Edit3Icon, UploadCloudIcon } from "lucide-react";

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

  // Custom Fields State
  const [fields, setFields] = useState<any[]>([]);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title,
        description,
        published: true,
        startTime: startTime ? new Date(startTime).toISOString() : null,
        endTime: endTime ? new Date(endTime).toISOString() : null,
        requireAiml,
        allowEdit,
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
            label: f.label,
            type: f.type,
            isRequired: f.isRequired,
            options: fieldOptions,
          };
        }),
      };

      const res = await fetch("/api/admin/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Form created successfully");
      window.location.reload();
    } catch (err: any) {
      alert("Error creating form: " + err.message);
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

  const handleToggleEdit = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowEdit: !currentVal }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setForms(forms.map((f: any) => (f.id === id ? { ...f, allowEdit: !currentVal } : f)));
    } catch (err) {
      alert("Error updating form.");
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
          onClick={() => setActiveTab("LIST")}
          className={`px-5 py-2.5 rounded-xl font-space-grotesk font-semibold text-sm transition-all ${
            activeTab === "LIST"
              ? "bg-brand/20 text-brand-accent border border-brand/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          Manage Forms ({forms.length})
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
          Create New Form
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
                className="group relative flex flex-col justify-between gap-4 rounded-2xl border border-brand/20 bg-card/70 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:border-brand-accent/50 sm:flex-row sm:items-center"
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
                    {form.requireAiml && (
                      <span className="rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/40 px-3 py-1 text-[10px] font-bold font-mono-tech uppercase tracking-wider">
                        AIML ONLY
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

                  <p className="font-mono-tech text-xs text-muted-foreground">
                    RESPONSES: <span className="text-gold font-bold">{form._count.responses}</span> | CREATED:{" "}
                    {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleEdit(form.id, form.allowEdit)}
                    className="rounded-xl border border-brand/30 bg-background/60 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-brand/10 hover:border-brand-accent/50"
                  >
                    {form.allowEdit ? "Lock Submissions" : "Allow Edits"}
                  </button>
                  <button
                    onClick={() => handleExport(form.id, "csv")}
                    disabled={exporting === form.id}
                    className="rounded-xl border border-brand/30 bg-background/60 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-brand/10 hover:border-brand-accent/50 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <FileSpreadsheetIcon className="w-3.5 h-3.5 text-brand-accent" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport(form.id, "excel")}
                    disabled={exporting === form.id}
                    className="rounded-xl border border-brand/30 bg-background/60 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-brand/10 hover:border-brand-accent/50 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <FileSpreadsheetIcon className="w-3.5 h-3.5 text-emerald-400" />
                    Excel
                  </button>
                  <button
                    onClick={() => handleDelete(form.id)}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500/20"
                    title="Delete Form"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "CREATE" && (
        <form
          onSubmit={handleCreate}
          className="space-y-8 rounded-3xl border border-brand/20 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
        >
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

            <div className="flex flex-wrap gap-6 sm:col-span-2 border border-brand/20 p-5 rounded-2xl bg-background/40">
              <label className="flex items-center gap-3 text-sm font-semibold font-space-grotesk text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireAiml}
                  onChange={(e) => setRequireAiml(e.target.checked)}
                  className="h-5 w-5 rounded border-brand/30 text-brand focus:ring-brand-accent"
                />
                AIML Students Only
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold font-space-grotesk text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowEdit}
                  onChange={(e) => setAllowEdit(e.target.checked)}
                  className="h-5 w-5 rounded border-brand/30 text-brand focus:ring-brand-accent"
                />
                Allow Users to Edit Responses After Submitting
              </label>
            </div>
          </div>

          {/* Dynamic Fields Section */}
          <div className="border-t border-brand/20 pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-space-grotesk text-foreground">Form Questions & Fields</h3>
                <p className="text-xs text-muted-foreground font-space-grotesk mt-0.5">
                  Configure text inputs, numerical thresholds, multiple choice dropdowns, or visual image polls.
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
                          className="w-full rounded-xl border border-brand/30 bg-card/60 px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                          placeholder="e.g., Which topic do you prefer?"
                        />
                      </div>
                      <div>
                        <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase">
                          Field Type
                        </label>
                        <select
                          value={cf.type}
                          onChange={(e) => updateField(index, "type", e.target.value)}
                          className="w-full rounded-xl border border-brand/30 bg-card/60 px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                        >
                          <option value="TEXT">Short Text</option>
                          <option value="TEXTAREA">Long Text</option>
                          <option value="NUMBER">Number (With Min/Max)</option>
                          <option value="SELECT">Dropdown (Single Select)</option>
                          <option value="MULTI_SELECT">Checkboxes (Multi Select)</option>
                          <option value="IMAGE_POLL">Image Poll (Voting)</option>
                        </select>
                      </div>
                    </div>

                    {/* Numeric Min/Max Threshold Controls */}
                    {cf.type === "NUMBER" && (
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
                    {(cf.type === "SELECT" || cf.type === "MULTI_SELECT") && (
                      <div className="space-y-3 rounded-xl border border-brand/20 bg-card/40 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono-tech uppercase font-bold text-brand-accent">
                            {cf.type === "SELECT" ? "Dropdown Choices" : "Checkbox Choices"}
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
            className="w-full rounded-2xl bg-brand py-4 text-center font-space-grotesk font-bold text-white shadow-xl shadow-brand/20 transition-all hover:bg-brand/90 hover:scale-[1.005] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Publishing Form..." : "Create & Launch Form"}
          </button>
        </form>
      )}
    </div>
  );
}
