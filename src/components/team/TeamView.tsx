"use client";

import { useRouter } from "next/navigation";
import { MemberCard } from "@/components/team/MemberCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Member } from "@/lib/types/Member";
import { Shield, Terminal, Trophy, Palette, Image as ImageIcon, Camera, Calendar, Users } from "lucide-react";

interface TeamViewProps {
  initialMembers: Member[];
  year: string;
  teamYears: string[];
}

const SECTION_CONFIG: Record<string, { label: string; icon: any }> = {
  ADMIN: { label: "Executive Board", icon: Shield },
  TECHNICAL: { label: "Technical Team", icon: Terminal },
  SPORTS: { label: "Sports Team", icon: Trophy },
  CULTURAL: { label: "Cultural Team", icon: Palette },
  GRAPHICS: { label: "Graphics Team", icon: ImageIcon },
  MEDIA: { label: "Media & Outreach Team", icon: Camera },
  EVENT: { label: "Event Team", icon: Calendar },
  REPRESENTATIVE: { label: "Class Representatives", icon: Users },
};

const SECTION_ORDER = ["ADMIN", "TECHNICAL", "SPORTS", "CULTURAL", "GRAPHICS", "MEDIA", "EVENT", "REPRESENTATIVE"];

export function TeamView({ initialMembers, year, teamYears }: TeamViewProps) {
  const router = useRouter();

  const groupedMembers = initialMembers.reduce((acc, member) => {
    const section = member.section || "ADMIN";
    if (!acc[section]) acc[section] = [];
    acc[section].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  return (
    <div className="flex flex-col min-h-screen w-full pt-20 px-4 md:px-10 lg:px-20 pb-20 bg-transparent text-foreground overflow-x-hidden">
      {/* Year Navigation */}
      <div className="flex flex-wrap w-full justify-center gap-4 md:gap-8 py-10 font-bold relative z-20">
        {teamYears.map((teamYear) => (
          <Button
            key={teamYear}
            variant="ghost"
            className={cn(
              "text-xl md:text-2xl hover:bg-transparent hover:underline underline-offset-4 text-muted-foreground",
              year === teamYear && "underline decoration-primary text-foreground font-extrabold",
            )}
            onClick={() => router.push(`/team/${teamYear}`)}
          >
            {teamYear}-{parseInt(teamYear.slice(2)) + 1}
          </Button>
        ))}
      </div>

      {initialMembers.length > 0 ? (
        <div className="flex flex-col gap-24 relative z-10 w-full max-w-7xl mx-auto">
          {SECTION_ORDER.map((sectionKey) => {
            const members = groupedMembers[sectionKey];
            if (!members || members.length === 0) return null;

            const config = SECTION_CONFIG[sectionKey] || { label: sectionKey, icon: Users };
            const Icon = config.icon;
            
            let featuredMembers: Member[] = [];
            let regularMembers = members;

            if (sectionKey === "ADMIN") {
              featuredMembers = members.filter(m => m.post.toLowerCase().includes("president"));
              regularMembers = members.filter(m => !m.post.toLowerCase().includes("president"));
            }

            return (
              <section key={sectionKey} className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col items-center mb-12">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="h-px w-12 md:w-24 bg-brand-accent/50 hidden sm:block"></span>
                    <div className="bg-brand/10 p-3 rounded-xl border border-brand/20 text-brand-accent">
                      <Icon className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span className="h-px w-12 md:w-24 bg-brand-accent/50 hidden sm:block"></span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-space-grotesk font-bold tracking-wider text-center text-foreground uppercase mt-4">
                    {config.label}
                  </h2>
                </div>

                {featuredMembers.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
                    {featuredMembers.map((member) => (
                      <MemberCard key={member.id} member={member} featured={true} />
                    ))}
                  </div>
                )}

                {regularMembers.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-8 lg:gap-12 w-full">
                    {regularMembers.map((member) => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">
            No members found for the year {year}-{parseInt(year.slice(2)) + 1}.
          </p>
        </div>
      )}
    </div>
  );
}
