"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ArrowLeftIcon, CheckCircle2Icon, AlertCircleIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchForm();
    }
  }, [status, id, router]);

  async function fetchForm() {
    try {
      const res = await fetch(`/api/forms/${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
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
    setSubmitting(true);
    setError("");

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
                          <Image
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
