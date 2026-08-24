"use client";

import { useState } from "react";
import { downloadCSV, downloadExcel } from "@/lib/export";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

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
      { label: "", type: "TEXT", isRequired: false, options: [] },
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
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `poll-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {},
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
        title, description, published: true, startTime, endTime, requireAiml, allowEdit,
        fields: fields.map(f => ({
          ...f,
          options: (f.type === "SELECT" || f.type === "MULTI_SELECT" || f.type === "IMAGE_POLL") ? f.options : null
        }))
      };

      const res = await fetch("/api/admin/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Form created successfully");
      window.location.reload();
    } catch (err) {
      alert("Error creating form: " + err);
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
        body: JSON.stringify({ allowEdit: !currentVal })
      });
      if (!res.ok) throw new Error("Failed to update");
      setForms(forms.map((f: any) => f.id === id ? { ...f, allowEdit: !currentVal } : f));
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

      const filename = `${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses`;

      if (format === "csv") downloadCSV(data, filename);
      else downloadExcel(data, filename);
      
    } catch (err: any) {
      alert("Failed to export: " + err.message);
    } finally {
      setExporting(null);
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
          Manage Forms
        </button>
        <button
          onClick={() => setActiveTab("CREATE")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "CREATE" ? "text-brand border-b-2 border-brand" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Create Form
        </button>
      </div>

      {activeTab === "LIST" && (
        <div className="space-y-4">
          {forms.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No forms found.</p>
          ) : (
            forms.map((form: any) => (
              <div key={form.id} className="flex flex-col justify-between gap-4 rounded-xl border border-border/50 bg-background/80 p-6 sm:flex-row sm:items-center relative group">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => handleDelete(form.id)} className="rounded-md bg-red-500/10 px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-500/20">
                    Delete
                  </button>
                </div>
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${form.published ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {form.published ? "Published" : "Draft"}
                    </span>
                    {form.requireAiml && (
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">AIML Only</span>
                    )}
                    {form.allowEdit && (
                      <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-500">Editable by Users</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{form.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {form._count.responses} responses | {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleToggleEdit(form.id, form.allowEdit)}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    {form.allowEdit ? "Disable Edits" : "Allow Edits"}
                  </button>
                  <button
                    onClick={() => handleExport(form.id, "csv")}
                    disabled={exporting === form.id}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport(form.id, "excel")}
                    disabled={exporting === form.id}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    Export Excel
                  </button>
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
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-brand" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Start Time (Optional)</label>
              <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-brand" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">End Time (Optional)</label>
              <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-brand" />
            </div>

            <div className="flex flex-wrap gap-6 sm:col-span-2 border border-border/50 p-4 rounded-xl bg-muted/20">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={requireAiml} onChange={e => setRequireAiml(e.target.checked)} className="h-5 w-5 rounded border-border text-brand focus:ring-brand" />
                AIML Students Only
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={allowEdit} onChange={e => setAllowEdit(e.target.checked)} className="h-5 w-5 rounded border-border text-brand focus:ring-brand" />
                Allow Users to Edit Submission
              </label>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Form Fields</h3>
              <button type="button" onClick={addField} className="rounded-lg bg-brand/10 px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/20">
                + Add Field
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((cf, index) => (
                <div key={index} className="flex flex-col gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-start relative group">
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="mb-1 text-xs text-muted-foreground">Label / Question</label>
                        <input type="text" required value={cf.label} onChange={e => updateField(index, "label", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" placeholder="e.g. Vote for Logo" />
                      </div>
                      <div>
                        <label className="mb-1 text-xs text-muted-foreground">Type</label>
                        <select value={cf.type} onChange={e => updateField(index, "type", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand">
                          <option value="TEXT">Text</option>
                          <option value="NUMBER">Number</option>
                          <option value="SELECT">Dropdown (Single Select)</option>
                          <option value="MULTI_SELECT">Checkboxes (Multi Select)</option>
                          <option value="IMAGE_POLL">Image Poll (Voting)</option>
                        </select>
                      </div>
                    </div>

                    {(cf.type === "SELECT" || cf.type === "MULTI_SELECT") && (
                      <div className="space-y-3 rounded-lg border border-border bg-background p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold">{cf.type === "SELECT" ? "Dropdown Options" : "Checkbox Options"}</h4>
                          <button type="button" onClick={() => addTextOption(index)} className="text-xs font-semibold text-brand hover:underline">+ Add Option</button>
                        </div>
                        {(Array.isArray(cf.options) ? cf.options : []).map((opt: string, optIndex: number) => (
                          <div key={optIndex} className="flex gap-2">
                            <input type="text" required value={opt} onChange={e => updateTextOption(index, optIndex, e.target.value)} placeholder={`Option ${optIndex + 1}`} className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm outline-none focus:border-brand" />
                            <button type="button" onClick={() => removeTextOption(index, optIndex)} className="rounded text-red-500 hover:bg-red-500/10 px-2">&times;</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {cf.type === "IMAGE_POLL" && (
                      <div className="space-y-3 rounded-lg border border-border bg-background p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold">Image Poll Options</h4>
                          <button type="button" onClick={() => addImageOption(index)} className="text-xs font-semibold text-brand hover:underline">+ Add Option</button>
                        </div>
                        {(Array.isArray(cf.options) ? cf.options : []).map((opt: any, optIndex: number) => (
                          <div key={optIndex} className="flex gap-2 items-center">
                            <input type="text" required value={opt.label || ""} onChange={e => updateImageOption(index, optIndex, "label", e.target.value)} placeholder="Label (e.g. Logo 1)" className="w-1/3 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm outline-none focus:border-brand" />
                            
                            {opt.imageUrl ? (
                              <div className="flex-1 flex items-center gap-2 overflow-hidden">
                                <img src={opt.imageUrl} alt="preview" className="h-8 w-8 object-cover rounded border border-border" />
                                <span className="text-xs text-muted-foreground truncate flex-1">{opt.imageUrl}</span>
                                <button type="button" onClick={() => updateImageOption(index, optIndex, "imageUrl", "")} className="text-xs text-red-500 underline flex-shrink-0">Change</button>
                              </div>
                            ) : (
                              <div className="flex-1 flex items-center gap-2">
                                <input 
                                  type="file" 
                                  required
                                  accept="image/*" 
                                  onChange={e => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleImageUpload(index, optIndex, e.target.files[0]);
                                    }
                                  }} 
                                  className="flex-1 text-sm file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer" 
                                />
                                {uploadingImage === `${index}-${optIndex}` && <span className="text-xs text-brand font-semibold animate-pulse">Uploading...</span>}
                              </div>
                            )}

                            <button type="button" onClick={() => removeImageOption(index, optIndex)} className="rounded text-red-500 hover:bg-red-500/10 px-2 flex-shrink-0">&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input type="checkbox" checked={cf.isRequired} onChange={e => updateField(index, "isRequired", e.target.checked)} className="rounded border-border text-brand focus:ring-brand" />
                      Required Field
                    </label>
                  </div>
                  
                  <button type="button" onClick={() => removeField(index)} className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              
              {fields.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No fields added to this form.</p>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand px-6 py-3.5 text-center font-semibold text-white transition-all hover:bg-brand/90 disabled:opacity-50">
            {loading ? "Creating Form..." : "Create Form"}
          </button>
        </form>
      )}
    </div>
  );
}
