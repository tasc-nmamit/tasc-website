"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

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
      // Using a quick server action/API to fetch form data
      // For simplicity in this implementation, we can just use a server action or an API route.
      // Wait, we don't have a GET route for a specific form for public users yet.
      // Let's create an inline server action since this is a client component, or we can use a dedicated API.
      // Actually, since I didn't create a GET /api/forms/[id] yet, I'll fetch it by calling a new route or I can use a Next.js Server Component to pass data down.
      // Let's fetch from a new endpoint: `/api/forms/${id}`
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
      <main className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </main>
    );
  }

  if (error && !form) {
    if (error === "You have already submitted a response for this form") {
      return (
        <main className="flex min-h-dvh items-center justify-center px-4">
          <div className="rounded-2xl bg-green-500/10 p-10 text-center border border-green-500/20 max-w-md w-full shadow-2xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-500 mb-2">Form Already Filled</h2>
            <p className="text-muted-foreground mb-8">You have already submitted your response for this form.</p>
            <button onClick={() => router.push("/forms")} className="rounded-xl bg-background border border-border px-6 py-2.5 font-semibold transition-colors hover:bg-muted">
              Back to Forms
            </button>
          </div>
        </main>
      );
    }

    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <div className="rounded-2xl bg-red-500/10 p-8 text-center text-red-500 border border-red-500/20 max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">Error Loading Form</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <div className="rounded-2xl bg-green-500/10 p-10 text-center border border-green-500/20 max-w-md w-full shadow-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-500 mb-2">Submission Successful!</h2>
          <p className="text-muted-foreground mb-8">Your response has been recorded.</p>
          <button onClick={() => router.push("/forms")} className="rounded-xl bg-background border border-border px-6 py-2.5 font-semibold transition-colors hover:bg-muted">
            Back to Forms
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 rounded-2xl border border-border/50 bg-background/80 p-8 shadow-xl backdrop-blur-xl border-t-4 border-t-brand">
          <h1 className="text-3xl font-bold text-foreground mb-3">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {form.fields.map((field: any) => (
            <div key={field.id} className="rounded-2xl border border-border/50 bg-background/80 p-6 sm:p-8 shadow-sm">
              <label className="mb-4 block text-lg font-medium text-foreground">
                {field.label} {field.isRequired && <span className="text-red-500">*</span>}
              </label>

              {field.type === "TEXT" && (
                <input 
                  type="text" 
                  required={field.isRequired}
                  value={answers[field.id] || ""}
                  onChange={(e) => setAnswers({...answers, [field.id]: e.target.value})}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-brand"
                  placeholder="Your answer"
                />
              )}

              {field.type === "NUMBER" && (
                <input 
                  type="number" 
                  required={field.isRequired}
                  value={answers[field.id] || ""}
                  onChange={(e) => setAnswers({...answers, [field.id]: e.target.value})}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-brand"
                  placeholder="Your number"
                />
              )}

              {field.type === "TEXTAREA" && (
                <textarea 
                  required={field.isRequired}
                  rows={4}
                  value={answers[field.id] || ""}
                  onChange={(e) => setAnswers({...answers, [field.id]: e.target.value})}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-brand"
                  placeholder="Your long answer"
                />
              )}

              {field.type === "SELECT" && (
                <div className="space-y-3">
                  {field.options?.map((opt: string) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                      <input 
                        type="radio" 
                        name={field.id} 
                        value={opt}
                        required={field.isRequired}
                        checked={answers[field.id] === opt}
                        onChange={(e) => setAnswers({...answers, [field.id]: e.target.value})}
                        className="h-5 w-5 text-brand focus:ring-brand"
                      />
                      <span className="text-foreground">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === "MULTI_SELECT" && (
                <div className="space-y-3">
                  {field.options?.map((opt: string) => {
                    const currentSelected = answers[field.id] ? JSON.parse(answers[field.id] || "[]") : [];
                    return (
                      <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                        <input 
                          type="checkbox" 
                          name={field.id} 
                          value={opt}
                          checked={currentSelected.includes(opt)}
                          onChange={(e) => {
                            let newSelected = [...currentSelected];
                            if (e.target.checked) {
                              newSelected.push(opt);
                            } else {
                              newSelected = newSelected.filter((v: string) => v !== opt);
                            }
                            setAnswers({...answers, [field.id]: JSON.stringify(newSelected)});
                          }}
                          className="h-5 w-5 rounded text-brand focus:ring-brand"
                        />
                        <span className="text-foreground">{opt}</span>
                      </label>
                    );
                  })}
                  {/* Hidden input to enforce required on multi_select if empty */}
                  {field.isRequired && (!answers[field.id] || JSON.parse(answers[field.id] || "[]").length === 0) && (
                     <input type="checkbox" required className="hidden" />
                  )}
                </div>
              )}

              {field.type === "IMAGE_POLL" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {field.options?.map((opt: { label: string, imageUrl: string }) => (
                    <label 
                      key={opt.label} 
                      className={`cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                        answers[field.id] === opt.label 
                          ? "border-brand shadow-lg shadow-brand/20 scale-[1.02]" 
                          : "border-border hover:border-brand/50"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={field.id} 
                        value={opt.label}
                        required={field.isRequired}
                        checked={answers[field.id] === opt.label}
                        onChange={(e) => setAnswers({...answers, [field.id]: e.target.value})}
                        className="sr-only"
                      />
                      <div className="relative aspect-video w-full border-b border-border group">
                        <Image src={opt.imageUrl} alt={opt.label} fill className="object-cover" />
                        <a 
                          href={opt.imageUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          title="View full image"
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                        </a>
                      </div>
                      <div className="p-4 text-center font-semibold">
                        {opt.label}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <button type="button" onClick={() => setAnswers({})} className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Clear form
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand px-8 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-brand/90 hover:shadow-brand/25 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Response"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
