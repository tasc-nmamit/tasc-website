import { requireAdmin } from "@/lib/auth-guards";
import Link from "next/link";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";

const ADMIN_SECTIONS = [
  {
    title: "Events",
    description: "Create, manage and track event registrations",
    href: "/admin/events",
    icon: "MODULE_01",
    tag: "EVENT_OPERATIONS",
  },
  {
    title: "Users",
    description: "Manage user roles and privileges",
    href: "/admin/users",
    icon: "MODULE_02",
    tag: "USER_DIRECTORY",
    ownerOnly: true,
  },
  {
    title: "Forms & Voting",
    description: "Create forms, polls and voting systems",
    href: "/admin/forms",
    icon: "MODULE_03",
    tag: "POLL_ENGINE",
  },
  {
    title: "Announcements",
    description: "Post announcements for AIML students",
    href: "/admin/announcements",
    icon: "MODULE_04",
    tag: "BROADCAST_SYSTEM",
  },
  {
    title: "Marathon",
    description: "Manage coding marathon, problems and scores",
    href: "/admin/marathon",
    icon: "MODULE_05",
    tag: "COMPETITION_CORE",
  },
];

export default async function AdminDashboard() {
  const session = await requireAdmin();
  const isOwner = session.user.role === "OWNER";

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16 bg-blueprint-grid">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <TechnicalLabel variant={isOwner ? "gold" : "primary"} className="mb-3">
            [ ADMIN_CONSOLE // UNIVERSITY_OPERATIONS ]
          </TechnicalLabel>

          <h1 className="text-3xl md:text-5xl font-bold font-space-grotesk text-foreground">
            Administrative <span className="text-gold">Dashboard</span>
          </h1>

          <p className="mt-2 text-sm md:text-base text-muted-foreground font-space-grotesk">
            TASC Department Operations, Event Registrations, and Student Directories.
          </p>

          <div className="mt-4 flex items-center gap-3 justify-center md:justify-start font-mono-tech text-xs">
            <span
              className={`px-3 py-1 rounded text-xs uppercase font-bold tracking-wider border ${
                isOwner
                  ? "bg-gold/15 border-gold text-gold"
                  : "bg-brand/15 border-brand-accent text-brand-accent"
              }`}
            >
              ROLE: {session.user.role}
            </span>
            <span className="text-muted-foreground">
              USER: {session.user.email}
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
              className="group relative overflow-hidden rounded-xl border border-brand/30 bg-card p-6 shadow-xl transition-all duration-300 hover:border-brand-accent/60 hover:-translate-y-1 bg-blueprint-grid"
            >
              <CircuitTrace corners={true} />

              <div className="relative z-10">
                <div className="font-mono-tech text-xs text-gold uppercase tracking-widest mb-1">
                  {section.icon}
                </div>

                <div className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
                  {section.tag}
                </div>

                <h2 className="text-xl font-bold font-space-grotesk text-foreground transition-colors group-hover:text-brand-accent mb-2">
                  {section.title}
                </h2>

                <p className="text-xs font-space-grotesk text-muted-foreground leading-relaxed">
                  {section.description}
                </p>

                <div className="mt-6 flex items-center text-xs font-mono-tech text-brand-accent uppercase tracking-wider group-hover:text-gold transition-colors">
                  ACCESS_MODULE →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
