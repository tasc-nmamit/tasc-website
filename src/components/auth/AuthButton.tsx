"use client";

// Since we don't have shadcn yet, I'll use standard HTML button styled with Tailwind.

export default function AuthButton() {
  return (
    <button className="border bg-transparent text-primary font-bold text-base px-4 py-2 rounded-md hover:bg-accent/10">
      Login
    </button>
  );
}
