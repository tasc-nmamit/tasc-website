"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ArrowLeftIcon, CheckCircle2Icon, AlertCircleIcon, SendIcon } from "lucide-react";
import Link from "next/link";

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
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (loading || status === "loading") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-transparent">
        <div className="h-8 w-8 animate-spin border-2 border-purple-500 border-t-transparent" />
      </main>
    );
  }

  if (error && !form) {
    if (error === "You have already submitted a response for this form") {
      return (
        <main className="flex min-h-dvh items-center justify-center px-4 bg-transparent font-valley">
          <div className="rounded-none bg-black/80 p-10 text-center border border-purple-500/30 max-w-md w-full shadow-2xl backdrop-blur-md space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-purple-950/60 border border-purple-500/40 text-purple-400">
              <CheckCircle2Icon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white font-valley">Form Already Submitted</h2>
            <p className="text-slate-300 text-sm">You have already submitted your response for this form.</p>
            <button
              onClick={() => router.push("/forms")}
              className="mt-4 inline-flex items-center gap-2 rounded-none bg-purple-600 hover:bg-purple-500 px-6 py-2.5 font-bold text-white transition-colors cursor-pointer text-sm"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Forms</span>
            </button>
          </div>
        </main>
      );
    }

    return (
      <main className="flex min-h-dvh items-center justify-center px-4 bg-transparent font-valley">
        <div className="rounded-none bg-black/80 p-8 text-center border border-red-500/30 max-w-md w-full backdrop-blur-md space-y-3">
          <AlertCircleIcon className="h-8 w-8 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Error Loading Form</h2>
          <p className="text-slate-300 text-sm">{error}</p>
          <Link
            href="/forms"
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider"
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
      <main className="flex min-h-dvh items-center justify-center px-4 bg-transparent font-valley">
        <div className="rounded-none bg-black/80 p-10 text-center border border-purple-500/40 max-w-md w-full shadow-2xl backdrop-blur-md space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-purple-950/60 border border-purple-500/40 text-purple-400">
            <CheckCircle2Icon className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white font-valley">Submission Successful!</h2>
          <p className="text-slate-300 text-sm">Your response has been recorded in the system.</p>
          <button
            onClick={() => router.push("/forms")}
            className="mt-4 inline-flex items-center gap-2 rounded-none bg-purple-600 hover:bg-purple-500 px-6 py-2.5 font-bold text-white transition-colors cursor-pointer text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Forms</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-4 pt-28 pb-20 relative bg-transparent text-slate-100 font-valley">
      <div className="relative z-10 mx-auto max-w-3xl space-y-8">

        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/forms"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to Forms</span>
          </Link>

          <div className="rounded-none border border-white/20 bg-black/75 p-6 sm:p-8 backdrop-blur-md space-y-2 border-t-4 border-t-purple-500">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-valley">{form.title}</h1>
            {form.description && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-wrap">{form.description}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-none border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-300 font-mono">
              {error}
            </div>
          )}

          {form.fields.map((field: any) => (
            <div
              key={field.id}
              className="rounded-none border border-white/15 bg-black/75 p-6 sm:p-8 backdrop-blur-md space-y-4"
            >
              <label className="block text-base sm:text-lg font-bold text-white font-valley">
                {field.label} {field.isRequired && <span className="text-purple-400">*</span>}
              </label>

              {field.type === "TEXT" && (
                <input
                  type="text"
                  required={field.isRequired}
                  value={answers[field.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                  className="w-full rounded-none border border-white/20 bg-white/5 px-4 py-3 outline-none focus:border-purple-400 text-white placeholder:text-slate-500 font-valley text-sm"
                  placeholder="Your answer..."
                />
              )}

              {field.type === "NUMBER" && (
                <input
                  type="number"
                  required={field.isRequired}
                  value={answers[field.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                  className="w-full rounded-none border border-white/20 bg-white/5 px-4 py-3 outline-none focus:border-purple-400 text-white placeholder:text-slate-500 font-valley text-sm"
                  placeholder="Your number..."
                />
              )}

              {field.type === "TEXTAREA" && (
                <textarea
                  required={field.isRequired}
                  rows={4}
                  value={answers[field.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                  className="w-full rounded-none border border-white/20 bg-white/5 px-4 py-3 outline-none focus:border-purple-400 text-white placeholder:text-slate-500 font-valley text-sm leading-relaxed"
                  placeholder="Your detailed response..."
                />
              )}

              {field.type === "SELECT" && (
                <div className="space-y-2.5">
                  {field.options?.map((opt: string) => (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center gap-3.5 rounded-none border p-4 transition-all ${
                        answers[field.id] === opt
                          ? "border-purple-500/60 bg-purple-950/40 text-white"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                      }`}
                    >
                      <input
                        type="radio"
                        name={field.id}
                        value={opt}
                        required={field.isRequired}
                        checked={answers[field.id] === opt}
                        onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                        className="h-4 w-4 rounded-none text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-valley font-medium text-sm sm:text-base">{opt}</span>
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
                        className={`flex cursor-pointer items-center gap-3.5 rounded-none border p-4 transition-all ${
                          isChecked
                            ? "border-purple-500/60 bg-purple-950/40 text-white"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name={field.id}
                          value={opt}
                          checked={isChecked}
                          onChange={(e) => {
                            let newSelected = [...currentSelected];
                            if (e.target.checked) {
                              newSelected.push(opt);
                            } else {
                              newSelected = newSelected.filter((v: string) => v !== opt);
                            }
                            setAnswers({ ...answers, [field.id]: JSON.stringify(newSelected) });
                          }}
                          className="h-4 w-4 rounded-none text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-valley font-medium text-sm sm:text-base">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {field.type === "IMAGE_POLL" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {field.options?.map((opt: { label: string, imageUrl: string }) => (
                    <label
                      key={opt.label}
                      className={`cursor-pointer overflow-hidden rounded-none border-2 transition-all ${
                        answers[field.id] === opt.label
                          ? "border-purple-500 shadow-lg shadow-purple-950/40 scale-[1.02]"
                          : "border-white/15 hover:border-purple-500/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={field.id}
                        value={opt.label}
                        required={field.isRequired}
                        checked={answers[field.id] === opt.label}
                        onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                        className="hidden"
                      />
                      <div className="relative aspect-video w-full overflow-hidden rounded-none bg-black/60">
                        {opt.imageUrl ? (
                          <Image
                            src={opt.imageUrl}
                            alt={opt.label}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-500 font-mono">
                            NO IMAGE ATTACHED
                          </div>
                        )}
                      </div>
                      <div className={`p-3.5 text-center font-valley font-bold text-sm sm:text-base ${
                        answers[field.id] === opt.label ? "bg-purple-950/80 text-white" : "bg-black/60 text-slate-300"
                      }`}>
                        {opt.label}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-none bg-purple-600 hover:bg-purple-500 disabled:opacity-50 py-3.5 text-center font-valley font-bold text-sm uppercase tracking-wider text-white shadow-lg shadow-purple-950/40 transition-all cursor-pointer hover:scale-[1.01]"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Submitting Response...</span>
                </>
              ) : (
                <>
                  <span>Submit Response</span>
                  <SendIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}
