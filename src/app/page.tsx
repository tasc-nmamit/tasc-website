import HeroSection from "@/components/home/HeroSection";
import Link from "next/link";
import AboutSection from "@/components/navigation/AboutSection";
import TrainModelSection from "@/components/interactive/TrainModelSection";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { db } from "@/lib/db";
import { CalendarIcon, UsersIcon, TrophyIcon, ArrowRightIcon } from "lucide-react";

export default async function Home() {
  const latestCore = await db.core.findFirst({
    orderBy: { year: "desc" },
    select: { year: true },
  });
  const currentYear = latestCore?.year || "2026";

  const [registeredMembers, totalEvents, coreMembers] = await Promise.all([
    db.user.count({
      where: {
        accounts: { some: {} },
      },
    }),
    db.event.count(),
    db.core.count({
      where: { year: currentYear },
    }),
  ]);

  return (
    <main className="min-h-dvh overflow-x-hidden relative bg-background">
      <HeroSection />

      {/* About Section */}
      <section id="about" className="flex max-w-[100vw] py-16 justify-center overflow-hidden">
        <ScrollReveal variant="fadeUp" duration={800}>
          <AboutSection />
        </ScrollReveal>
      </section>

      {/* Dynamic Stats Section */}
      <section className="w-full py-16 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal variant="slideRight" delay={100} className="bg-card/50 backdrop-blur-md border border-brand/20 p-8 rounded-2xl text-center shadow-lg hover:border-brand-accent/50 transition-colors">
              <div className="mx-auto w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mb-4 text-brand-accent">
                <UsersIcon className="w-8 h-8" />
              </div>
              <h3 className="text-5xl font-bold font-space-grotesk text-foreground mb-2">{registeredMembers}</h3>
              <p className="text-muted-foreground font-space-grotesk text-sm font-medium">Registered Members</p>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={200} className="bg-card/50 backdrop-blur-md border border-brand/20 p-8 rounded-2xl text-center shadow-lg hover:border-brand-accent/50 transition-colors">
              <div className="mx-auto w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mb-4 text-brand-accent">
                <CalendarIcon className="w-8 h-8" />
              </div>
              <h3 className="text-5xl font-bold font-space-grotesk text-foreground mb-2">{totalEvents}+</h3>
              <p className="text-muted-foreground font-space-grotesk text-sm font-medium">Events Organized</p>
            </ScrollReveal>

            <ScrollReveal variant="slideLeft" delay={300} className="bg-card/50 backdrop-blur-md border border-brand/20 p-8 rounded-2xl text-center shadow-lg hover:border-brand-accent/50 transition-colors">
              <div className="mx-auto w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mb-4 text-brand-accent">
                <TrophyIcon className="w-8 h-8" />
              </div>
              <h3 className="text-5xl font-bold font-space-grotesk text-foreground mb-2">{coreMembers}</h3>
              <p className="text-muted-foreground font-space-grotesk text-sm font-medium">Core Team Members</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Signature Interactive Centerpiece: Train the Model */}
      <section id="train-model" className="w-full py-16 overflow-hidden">
        <ScrollReveal variant="fadeUp" duration={1000}>
          <TrainModelSection />
        </ScrollReveal>
      </section>

      {/* Quick Links Section */}
      <section className="w-full py-16 px-4 mb-20 relative">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="scaleUp" className="bg-gradient-to-r from-brand/20 to-brand-accent/20 border border-brand/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-blueprint-grid opacity-20" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold font-space-grotesk mb-6 text-foreground">Explore More</h2>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/events" className="group flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform">
                  Events <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href={`/team/${currentYear}`} className="group flex items-center justify-center gap-2 bg-transparent border border-foreground text-foreground px-8 py-4 rounded-xl font-bold hover:bg-foreground/10 transition-colors">
                  Our Team <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
