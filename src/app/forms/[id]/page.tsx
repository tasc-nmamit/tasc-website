"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  SendIcon,
  UploadCloudIcon,
  FileTextIcon,
  ExternalLinkIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { ensureFirebaseAuth } from "@/lib/firebase-client-auth";

export default function FormPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: session, status } = useSession();

  const [form, setForm] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const isImageUrl = (url: string) => {
    if (!url || typeof url !== "string") return false;
    const clean = url.split("?")[0].toLowerCase();
    return (
      clean.endsWith(".jpg") ||
      clean.endsWith(".jpeg") ||
      clean.endsWith(".png") ||
      clean.endsWith(".webp") ||
      clean.endsWith(".gif") ||
      clean.endsWith(".svg")
    );
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    if (!file) return;
    if (!session?.user?.id && !form?.allowAnonymous) {
      alert("Please sign in to upload files.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large. Maximum file size is 15MB.");
      return;
    }

    setUploadingFiles((prev) => ({ ...prev, [fieldId]: true }));
    setUploadProgress((prev) => ({ ...prev, [fieldId]: 0 }));

    try {
      await ensureFirebaseAuth({ formId: id });
      const ext = file.name.split(".").pop() || "bin";
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uploaderId = session?.user?.id || `guest_${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `form-uploads/${id}/${uploaderId}_${fieldId}_${Date.now()}_${safeName}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress((prev) => ({ ...prev, [fieldId]: progress }));
          },
          (error) => {
            alert("File upload failed: " + error.message);
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setAnswers((prev) => ({ ...prev, [fieldId]: downloadUrl }));
            resolve();
          }
        );
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("File upload failed: " + (err?.message || "Unknown error"));
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const removeUploadedFile = (fieldId: string) => {
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[fieldId];
      return updated;
    });
  };

  useEffect(() => {
    fetchForm();
  }, [id, status]);

  async function fetchForm() {
    try {
      setLoading(true);
      const res = await fetch(`/api/forms/${id}`, { cache: "no-store" });
      const data = await res.json();

      if (res.status === 401) {
        router.push(`/auth/signin?callbackUrl=/forms/${id}`);
        return;
      }

      if (!res.ok) throw new Error(data.error || "Failed to load form");
      setForm(data);
      if (data.existingAnswers) {
        setAnswers(data.existingAnswers);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const isAnyUploading = Object.values(uploadingFiles).some(Boolean);
    if (isAnyUploading) {
      setError("Please wait for all files to finish uploading before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/forms/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit response");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background bg-blueprint-grid text-foreground">
        <div className="flex items-center gap-3 font-mono-tech text-xs tracking-widest uppercase text-brand-accent">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <span>[ LOADING_FORM_DATA... ]</span>
        </div>
      </main>
    );
  }

  if (error && !form) {
    if (error === "You have already submitted a response for this form") {
      return (
        <main className="flex min-h-dvh items-center justify-center px-4 bg-background bg-blueprint-grid text-foreground">
          <div className="relative rounded-xl bg-card border border-brand/30 p-8 sm:p-10 text-center max-w-md w-full shadow-2xl backdrop-blur-md space-y-4">
            <CircuitTrace corners={true} />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2Icon className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-foreground font-space-grotesk">Form Already Submitted</h2>
            <p className="text-muted-foreground text-sm font-space-grotesk">You have already submitted your response for this form.</p>
            <button
              onClick={() => router.push("/forms")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand/90 px-6 py-2.5 font-bold text-white transition-colors cursor-pointer text-xs uppercase tracking-wider font-space-grotesk"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Forms</span>
            </button>
          </div>
        </main>
      );
    }

    return (
      <main className="flex min-h-dvh items-center justify-center px-4 bg-background bg-blueprint-grid text-foreground">
        <div className="relative rounded-xl bg-card border border-red-500/30 p-8 text-center max-w-md w-full backdrop-blur-md space-y-3 shadow-xl">
          <CircuitTrace corners={true} />
          <AlertCircleIcon className="h-8 w-8 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-foreground font-space-grotesk">Error Loading Form</h2>
          <p className="text-muted-foreground text-sm font-space-grotesk">{error}</p>
          <Link
            href="/forms"
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-brand-accent hover:underline uppercase tracking-wider font-mono-tech"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to Forms</span>
          </Link>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 bg-background bg-blueprint-grid text-foreground">
        <div className="relative rounded-xl bg-card border border-brand/30 p-8 sm:p-10 text-center max-w-md w-full shadow-2xl backdrop-blur-md space-y-4">
          <CircuitTrace corners={true} />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2Icon className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-foreground font-space-grotesk">Submission Successful!</h2>
          <p className="text-muted-foreground text-sm font-space-grotesk">Your response has been recorded in the system.</p>
          <button
            onClick={() => router.push("/forms")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand/90 px-6 py-2.5 font-bold text-white transition-colors cursor-pointer text-xs uppercase tracking-wider font-space-grotesk"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Forms</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-4 pt-28 pb-20 relative bg-background bg-blueprint-grid text-foreground overflow-x-hidden font-space-grotesk">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl space-y-8">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/forms"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors font-mono-tech"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to Forms</span>
          </Link>

          <div className="relative rounded-xl border border-brand/25 bg-card/85 p-6 sm:p-8 backdrop-blur-xl space-y-2 border-t-4 border-t-brand shadow-xl">
            <CircuitTrace corners={true} />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-space-grotesk">{form.title}</h1>
            {form.description && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{form.description}</p>
            )}

            {!session?.user?.id && form.allowAnonymous && (
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200">
                <div className="flex items-center gap-2.5">
                  <UserIcon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-space-grotesk">
                    Filling as <strong>Guest</strong> (not signed in). Want this response linked to your account?
                  </span>
                </div>
                <Link
                  href={`/auth/signin?callbackUrl=/forms/${id}`}
                  className="shrink-0 text-xs font-mono-tech font-bold uppercase underline hover:text-white"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-mono-tech">
              {error}
            </div>
          )}

          {form.fields.map((field: any) => (
            <div
              key={field.id}
              className="relative rounded-xl border border-brand/20 bg-card/85 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-lg"
            >
              <CircuitTrace corners={true} />

              <label className="block text-base font-bold text-foreground font-space-grotesk">
                {field.label} {field.isRequired && <span className="text-red-400">*</span>}
              </label>

              {field.type === "TEXT" && (
                <input
                  type="text"
                  required={field.isRequired}
                  value={answers[field.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                  className="w-full rounded-lg border border-brand/25 bg-background/70 px-4 py-2.5 outline-none focus:border-brand-accent text-foreground placeholder:text-muted-foreground text-sm font-space-grotesk"
                  placeholder="Your answer..."
                />
              )}

              {field.type === "NUMBER" && (
                <div className="space-y-1.5">
                  <input
                    type="number"
                    required={field.isRequired}
                    min={field.options?.min !== null && field.options?.min !== undefined ? field.options.min : undefined}
                    max={field.options?.max !== null && field.options?.max !== undefined ? field.options.max : undefined}
                    value={answers[field.id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                    className="w-full rounded-lg border border-brand/25 bg-background/70 px-4 py-2.5 outline-none focus:border-brand-accent text-foreground placeholder:text-muted-foreground text-sm font-space-grotesk"
                    placeholder="Your number..."
                  />
                  {(field.options?.min !== null && field.options?.min !== undefined || field.options?.max !== null && field.options?.max !== undefined) && (
                    <p className="text-xs text-muted-foreground font-mono-tech">
                      Acceptable range: {field.options?.min ?? "-∞"} to {field.options?.max ?? "+∞"}
                    </p>
                  )}
                </div>
              )}

              {field.type === "TEXTAREA" && (
                <textarea
                  required={field.isRequired}
                  rows={4}
                  value={answers[field.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                  className="w-full rounded-lg border border-brand/25 bg-background/70 px-4 py-2.5 outline-none focus:border-brand-accent text-foreground placeholder:text-muted-foreground text-sm leading-relaxed font-space-grotesk"
                  placeholder="Your detailed response..."
                />
              )}

              {field.type === "SELECT" && (
                <div className="space-y-2.5">
                  {field.options?.map((opt: string) => (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center gap-3.5 rounded-lg border p-3.5 transition-all ${
                        answers[field.id] === opt
                          ? "border-brand-accent/60 bg-brand/15 text-brand-accent font-semibold"
                          : "border-brand/20 bg-background/50 text-foreground hover:border-brand/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name={field.id}
                        value={opt}
                        required={field.isRequired}
                        checked={answers[field.id] === opt}
                        onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                        className="h-4 w-4 text-brand focus:ring-brand-accent"
                      />
                      <span className="font-space-grotesk text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === "MULTI_SELECT" && (
                <div className="space-y-2.5">
                  {field.options?.map((opt: string) => {
                    const currentSelected = answers[field.id] ? JSON.parse(answers[field.id] || "[]") : [];
                    const isChecked = currentSelected.includes(opt);

                    return (
                      <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-3.5 rounded-lg border p-3.5 transition-all ${
                          isChecked
                            ? "border-brand-accent/60 bg-brand/15 text-brand-accent font-semibold"
                            : "border-brand/20 bg-background/50 text-foreground hover:border-brand/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={opt}
                          checked={isChecked}
                          onChange={(e) => {
                            let updated;
                            if (e.target.checked) {
                              updated = [...currentSelected, opt];
                            } else {
                              updated = currentSelected.filter((item: string) => item !== opt);
                            }
                            setAnswers({ ...answers, [field.id]: JSON.stringify(updated) });
                          }}
                          className="h-4 w-4 rounded text-brand focus:ring-brand-accent"
                        />
                        <span className="font-space-grotesk text-sm">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {field.type === "FILE_UPLOAD" && (
                <div className="space-y-3">
                  {answers[field.id] ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2Icon className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span className="text-xs font-mono-tech text-emerald-300 font-bold uppercase tracking-wider">
                            File Uploaded
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(field.id)}
                          className="text-xs text-red-400 hover:text-red-300 font-mono-tech underline cursor-pointer shrink-0"
                        >
                          Replace File
                        </button>
                      </div>

                      {isImageUrl(answers[field.id]) ? (
                        <div className="relative group max-w-xs rounded-lg overflow-hidden border border-brand/30 bg-black/40 p-1">
                          <OptimizedImage
                            src={answers[field.id]}
                            alt="Uploaded preview"
                            className="max-h-48 max-w-full object-contain mx-auto rounded"
                          />
                          <a
                            href={answers[field.id]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-mono-tech gap-1 rounded"
                          >
                            <span>Open Full Image</span>
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-mono-tech text-foreground bg-background/50 border border-brand/20 p-2.5 rounded-lg">
                          <FileTextIcon className="w-4 h-4 text-brand-accent shrink-0" />
                          <a
                            href={answers[field.id]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-accent hover:underline flex items-center gap-1.5 truncate flex-1"
                          >
                            <span className="truncate">View Uploaded File</span>
                            <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          required={field.isRequired && !answers[field.id]}
                          disabled={uploadingFiles[field.id]}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(field.id, e.target.files[0]);
                            }
                          }}
                          className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand/20 file:text-brand-accent hover:file:bg-brand/30 cursor-pointer border border-brand/30 rounded-lg p-2 bg-background/70 font-space-grotesk text-foreground disabled:opacity-50"
                        />
                      </div>
                      {uploadingFiles[field.id] && (
                        <div className="flex items-center gap-2 text-xs font-mono-tech text-gold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-gold animate-ping inline-block" />
                          <span>
                            UPLOADING_FILE... {uploadProgress[field.id] !== undefined ? `(${uploadProgress[field.id]}%)` : ""}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] font-mono-tech text-muted-foreground">
                        Supports images, documents, PDFs, or other file formats (Max 15MB).
                      </p>
                    </div>
                  )}
                </div>
              )}

              {field.type === "IMAGE_POLL" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {field.options?.map((option: any) => (
                    <div
                      key={option.id}
                      onClick={() => setAnswers({ ...answers, [field.id]: option.id })}
                      className={`group cursor-pointer rounded-lg border overflow-hidden transition-all ${
                        answers[field.id] === option.id
                          ? "border-brand-accent/80 bg-brand/15 ring-2 ring-brand-accent/40"
                          : "border-brand/20 bg-background/50 hover:border-brand/40"
                      }`}
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                        {option.image ? (
                          <OptimizedImage
                            src={option.image}
                            alt={option.label || "Poll Option"}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground font-mono-tech">
                            NO_IMAGE_PROVIDED
                          </div>
                        )}
                      </div>
                      <div className="p-3.5 flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{option.label}</span>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            answers[field.id] === option.id
                              ? "border-brand-accent bg-brand-accent"
                              : "border-muted-foreground"
                          }`}
                        >
                          {answers[field.id] === option.id && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand hover:bg-brand/90 py-3.5 text-center font-bold text-white shadow-lg shadow-brand/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-space-grotesk text-xs uppercase tracking-wider"
          >
            <SendIcon className="h-4 w-4" />
            <span>{submitting ? "SUBMITTING_RESPONSE..." : "SUBMIT_RESPONSE"}</span>
          </button>
        </form>
      </div>
    </main>
  );
}
