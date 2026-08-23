import { requireAdmin } from "@/lib/auth-guards";
import Link from "next/link";

const ADMIN_SECTIONS = [
  {
    title: "Events",
    description: "Create, manage and track event registrations",
    href: "/admin/events",
    icon: "🎪",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Users",
    description: "Manage user roles and permissions",
    href: "/admin/users",
    icon: "👥",
    color: "from-purple-500 to-brand",
    ownerOnly: true,
  },
  {
    title: "Forms & Voting",
    description: "Create forms, polls and voting systems",
    href: "/admin/forms",
    icon: "📋",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Announcements",
    description: "Post announcements for AIML students",
    href: "/admin/announcements",
    icon: "📢",
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "Marathon",
    description: "Manage coding marathon, problems and scores",
    href: "/admin/marathon",
    icon: "🏃",
    color: "from-red-500 to-pink-500",
  },
];

export default async function AdminDashboard() {
  const session = await requireAdmin();
  const isOwner = session.user.role === "OWNER";

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage the TASC website and its features
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                isOwner
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  : "bg-gradient-to-r from-purple-500 to-brand text-white"
              }`}
            >
              {session.user.role}
            </span>
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_SECTIONS.filter(
            (section) => !section.ownerOnly || isOwner
          ).map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/80 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-brand/30 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Gradient accent */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${section.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="mb-4 text-4xl">{section.icon}</div>
              <h2 className="text-xl font-bold text-foreground transition-colors group-hover:text-brand">
                {section.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {section.description}
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center text-sm font-medium text-brand opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                Manage
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
