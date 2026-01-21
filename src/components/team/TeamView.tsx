"use client";

import { useRouter } from "next/navigation";
import { MemberCard } from "@/components/team/MemberCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Member } from "@/lib/types/Member";
// teamYears removed
interface TeamViewProps {
  initialMembers: Member[];
  year: string;
  teamYears: string[];
}

export function TeamView({ initialMembers, year, teamYears }: TeamViewProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen w-full pt-20 px-6 md:px-20 lg:px-30 pb-20 bg-transparent text-foreground">
      {/* Year Navigation */}
      <div className="flex flex-wrap w-full justify-center gap-4 md:gap-8 py-10 font-bold">
        {teamYears.map((teamYear) => (
          <Button
            key={teamYear}
            variant="ghost"
            className={cn(
              "text-xl md:text-2xl hover:bg-transparent hover:underline underline-offset-4",
              year === teamYear && "underline decoration-primary",
            )}
            onClick={() => router.push(`/team/${teamYear}`)}
          >
            {teamYear}-{parseInt(teamYear.slice(2)) + 1}
          </Button>
        ))}
      </div>

      {/* Team Grid */}
      {initialMembers.length > 0 ? (
        <div className="grid-container justify-items-center">
          {initialMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
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
