"use client";

import React, { useState } from "react";
import { PlusIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface CustomFieldsEditorProps {
  fields: any[];
  setFields: React.Dispatch<React.SetStateAction<any[]>>;
  eventType: "SOLO" | "TEAM" | "SOLO_OR_TEAM";
  title?: string;
  subtitle?: string;
}

export default function CustomFieldsEditor({
  fields,
  setFields,
  eventType,
  title = "Registration Questionnaire & Custom Fields",
  subtitle = "Configure additional fields, payment QR displays, or file uploads for participants.",
}: CustomFieldsEditorProps) {
  const [uploadingFieldImage, setUploadingFieldImage] = useState<string | null>(null);

  const addCustomField = () => {
    setFields((prev) => [
      ...prev,
      {
        label: "",
        fieldType: "TEXT",
        isRequired: false,
        options: [],
        min: "",
        max: "",
        imageUrl: "",
        caption: "",
        registrationMode: "ALL",
        targetRole: "ALL_MEMBERS",
      },
    ]);
  };

  const updateField = (index: number, key: string, value: any) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    setFields((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const addTextOption = (fieldIndex: number) => {
    setFields((prev) => {
      const updated = [...prev];
      const opts = Array.isArray(updated[fieldIndex].options)
        ? [...updated[fieldIndex].options]
        : [];
      opts.push("");
      updated[fieldIndex] = { ...updated[fieldIndex], options: opts };
      return updated;
    });
  };

  const updateTextOption = (fieldIndex: number, optIndex: number, value: string) => {
    setFields((prev) => {
      const updated = [...prev];
      const opts = Array.isArray(updated[fieldIndex].options)
        ? [...updated[fieldIndex].options]
        : [];
      opts[optIndex] = value;
      updated[fieldIndex] = { ...updated[fieldIndex], options: opts };
      return updated;
    });
  };

  const removeTextOption = (fieldIndex: number, optIndex: number) => {
    setFields((prev) => {
      const updated = [...prev];
      const opts = Array.isArray(updated[fieldIndex].options)
        ? [...updated[fieldIndex].options]
        : [];
      opts.splice(optIndex, 1);
      updated[fieldIndex] = { ...updated[fieldIndex], options: opts };
      return updated;
    });
  };

  const addImageOption = (fieldIndex: number) => {
    setFields((prev) => {
      const updated = [...prev];
      const opts = Array.isArray(updated[fieldIndex].options)
        ? [...updated[fieldIndex].options]
        : [];
      opts.push({ label: "", imageUrl: "" });
      updated[fieldIndex] = { ...updated[fieldIndex], options: opts };
      return updated;
    });
  };

  const updateImageOption = (
    fieldIndex: number,
    optIndex: number,
    key: string,
    value: string
  ) => {
    setFields((prev) => {
      const updated = [...prev];
      const opts = Array.isArray(updated[fieldIndex].options)
        ? [...updated[fieldIndex].options]
        : [];
      opts[optIndex] = { ...opts[optIndex], [key]: value };
      updated[fieldIndex] = { ...updated[fieldIndex], options: opts };
      return updated;
    });
  };

  const removeImageOption = (fieldIndex: number, optIndex: number) => {
    setFields((prev) => {
      const updated = [...prev];
      const opts = Array.isArray(updated[fieldIndex].options)
        ? [...updated[fieldIndex].options]
        : [];
      opts.splice(optIndex, 1);
      updated[fieldIndex] = { ...updated[fieldIndex], options: opts };
      return updated;
    });
  };

  const handleFieldImageUpload = async (
    fieldIndex: number,
    optIndex: number,
    file: File
  ) => {
    if (!file) return;
    const uploadId = `${fieldIndex}-${optIndex}`;
    setUploadingFieldImage(uploadId);
    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `event-field-images/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      updateImageOption(fieldIndex, optIndex, "imageUrl", url);
    } catch (err: any) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploadingFieldImage(null);
    }
  };

  const handleDisplayImageUpload = async (fieldIndex: number, file: File) => {
    if (!file) return;
    const uploadId = `display-${fieldIndex}`;
    setUploadingFieldImage(uploadId);
    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `event-display-images/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      updateField(fieldIndex, "imageUrl", url);
    } catch (err: any) {
      alert("Display image upload failed: " + err.message);
    } finally {
      setUploadingFieldImage(null);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-brand/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold font-space-grotesk text-lg text-foreground flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-mono-tech font-normal px-2 py-0.5 rounded-full bg-brand/20 text-brand-accent border border-brand/30">
              {fields.length} {fields.length === 1 ? "field" : "fields"}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground font-space-grotesk mt-0.5">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={addCustomField}
          className="rounded-xl bg-brand/20 border border-brand/40 px-3.5 py-2 text-xs font-bold font-mono-tech uppercase tracking-wider text-brand-accent transition-all hover:bg-brand/30 flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          ADD_FIELD
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((cf, index) => (
          <div
            key={cf.id || index}
            className="flex flex-col gap-4 rounded-2xl border border-brand/20 bg-background/60 backdrop-blur-md p-4 sm:p-5 relative group transition-all hover:border-brand/40"
          >
            {/* Top Bar with Field Number and Order Controls */}
            <div className="flex items-center justify-between border-b border-brand/10 pb-2.5">
              <span className="font-mono-tech text-[11px] text-muted-foreground font-semibold flex items-center gap-2">
                <span className="h-5 w-5 rounded-md bg-brand/15 text-brand-accent border border-brand/30 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                FIELD #{index + 1}
                {cf.id && (
                  <span className="text-[10px] text-muted-foreground/60 font-mono-tech">
                    (ID: {cf.id.slice(-6)})
                  </span>
                )}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveField(index, "up")}
                  className="p-1 rounded-lg border border-brand/20 bg-background/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUpIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === fields.length - 1}
                  onClick={() => moveField(index, "down")}
                  className="p-1 rounded-lg border border-brand/20 bg-background/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDownIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all ml-1 cursor-pointer"
                  title="Delete Question"
                >
                  <Trash2Icon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-3 sm:gap-4">
                <div
                  className={
                    eventType === "SOLO_OR_TEAM"
                      ? "col-span-12 lg:col-span-4"
                      : eventType === "TEAM"
                      ? "col-span-12 lg:col-span-5"
                      : "col-span-12 sm:col-span-8"
                  }
                >
                  <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase block">
                    Label / Question *
                  </label>
                  <input
                    type="text"
                    required
                    value={cf.label}
                    onChange={(e) => updateField(index, "label", e.target.value)}
                    className="w-full rounded-xl border border-brand/30 bg-card px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent font-space-grotesk"
                    placeholder="e.g. GitHub Repository Link"
                  />
                </div>

                <div
                  className={
                    eventType === "SOLO_OR_TEAM"
                      ? "col-span-12 sm:col-span-4 lg:col-span-3"
                      : eventType === "TEAM"
                      ? "col-span-12 sm:col-span-6 lg:col-span-4"
                      : "col-span-12 sm:col-span-4"
                  }
                >
                  <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase block">
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

                {eventType === "SOLO_OR_TEAM" && (
                  <div className="col-span-12 sm:col-span-4 lg:col-span-2">
                    <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase block">
                      Show For
                    </label>
                    <select
                      value={cf.registrationMode || "ALL"}
                      onChange={(e) =>
                        updateField(index, "registrationMode", e.target.value)
                      }
                      className="w-full rounded-xl border border-brand/30 bg-card px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent"
                    >
                      <option value="ALL">All (Solo & Team)</option>
                      <option value="SOLO">Solo Only</option>
                      <option value="TEAM">Team Only</option>
                    </select>
                  </div>
                )}

                {(eventType === "TEAM" || eventType === "SOLO_OR_TEAM") && (
                  <div
                    className={
                      eventType === "SOLO_OR_TEAM"
                        ? "col-span-12 sm:col-span-4 lg:col-span-3"
                        : "col-span-12 sm:col-span-6 lg:col-span-3"
                    }
                  >
                    <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase block">
                      Target Member
                    </label>
                    <select
                      disabled={
                        eventType === "SOLO_OR_TEAM" && cf.registrationMode === "SOLO"
                      }
                      value={
                        eventType === "SOLO_OR_TEAM" && cf.registrationMode === "SOLO"
                          ? "ALL_MEMBERS"
                          : cf.targetRole || "ALL_MEMBERS"
                      }
                      onChange={(e) => updateField(index, "targetRole", e.target.value)}
                      className="w-full rounded-xl border border-brand/30 bg-card px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-accent disabled:opacity-50"
                    >
                      <option value="ALL_MEMBERS">All Team Members</option>
                      <option value="LEADER_ONLY">Team Leader Only</option>
                    </select>
                  </div>
                )}
              </div>

              {(eventType === "TEAM" || eventType === "SOLO_OR_TEAM") &&
                cf.targetRole === "LEADER_ONLY" &&
                cf.registrationMode !== "SOLO" && (
                  <p className="text-[11px] font-mono-tech text-gold flex items-center gap-1.5 bg-gold/5 border border-gold/20 rounded-lg p-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse inline-block" />
                    [LEADER_ONLY]: Asked only to the team leader during team creation. Teammates joining via code will not be asked this.
                  </p>
                )}

              {/* Numeric Min/Max Threshold Controls */}
              {cf.fieldType === "NUMBER" && (
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-brand/20 bg-card/40 p-4">
                  <div>
                    <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase block">
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
                    <label className="mb-1 text-xs font-mono-tech text-muted-foreground uppercase block">
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
                      {cf.fieldType === "SELECT"
                        ? "Dropdown Choices"
                        : "Checkbox Choices"}
                    </h4>
                    <button
                      type="button"
                      onClick={() => addTextOption(index)}
                      className="text-xs font-mono-tech text-gold hover:underline cursor-pointer"
                    >
                      + ADD_OPTION
                    </button>
                  </div>
                  {(Array.isArray(cf.options) ? cf.options : []).map(
                    (opt: string, optIndex: number) => (
                      <div key={optIndex} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) =>
                            updateTextOption(index, optIndex, e.target.value)
                          }
                          placeholder={`Option ${optIndex + 1}`}
                          className="flex-1 rounded-lg border border-brand/30 bg-background/70 px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand-accent font-space-grotesk"
                        />
                        <button
                          type="button"
                          onClick={() => removeTextOption(index, optIndex)}
                          className="rounded-lg text-red-400 hover:bg-red-500/10 px-2.5 transition-colors cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>
                    )
                  )}
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
                      className="text-xs font-mono-tech text-gold hover:underline cursor-pointer"
                    >
                      + ADD_IMAGE_OPTION
                    </button>
                  </div>
                  {(Array.isArray(cf.options) ? cf.options : []).map(
                    (opt: any, optIndex: number) => (
                      <div
                        key={optIndex}
                        className="flex gap-2 items-center flex-wrap sm:flex-nowrap"
                      >
                        <input
                          type="text"
                          required
                          value={opt.label || ""}
                          onChange={(e) =>
                            updateImageOption(
                              index,
                              optIndex,
                              "label",
                              e.target.value
                            )
                          }
                          placeholder="Title / Name (e.g. Option 1)"
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
                              onClick={() =>
                                updateImageOption(index, optIndex, "imageUrl", "")
                              }
                              className="text-xs text-red-400 hover:underline px-1 cursor-pointer"
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
                                  handleFieldImageUpload(
                                    index,
                                    optIndex,
                                    e.target.files[0]
                                  );
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
                          className="rounded-lg text-red-400 hover:bg-red-500/10 p-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  )}
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
                            className="text-xs text-red-400 hover:underline mt-1 cursor-pointer"
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
                        onChange={(e) =>
                          updateField(index, "caption", e.target.value)
                        }
                        placeholder="e.g. Scan QR via UPI and upload transaction screenshot below"
                        className="w-full rounded-lg border border-brand/30 bg-background/70 px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand-accent font-space-grotesk"
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
                    onChange={(e) =>
                      updateField(index, "isRequired", e.target.checked)
                    }
                    className="rounded border-brand/30 text-brand focus:ring-brand-accent h-4 w-4"
                  />
                  Required Field
                </label>
              )}
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="rounded-2xl border border-dashed border-brand/30 p-8 text-center text-sm text-muted-foreground font-space-grotesk">
            No custom questions added yet. Default participant details (Name, USN, Email) will be gathered automatically.
          </div>
        )}
      </div>
    </div>
  );
}
