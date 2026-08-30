import { useState } from "react";
import { Member } from "@/lib/types/Member";
import Image from "next/image";
import { Github, Linkedin, Instagram, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";

interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* Main Card */}
      <div
        onClick={() => setIsOpen(true)}
        className="w-72 cursor-pointer overflow-hidden rounded-xl border border-brand/30 bg-card p-5 shadow-xl transition-all duration-300 hover:border-brand-accent/60 hover:scale-105 relative group bg-blueprint-grid"
      >
        <CircuitTrace corners={true} />

        <div className="mx-auto flex items-center justify-center relative z-10">
          <div className="relative aspect-square w-32 rounded-full overflow-hidden border-2 border-brand-accent/40 shadow-inner">
            {isLoading && (
              <Skeleton className="absolute inset-0 rounded-full bg-muted/40" />
            )}
            <Image
              src={member.image || "/fallback_profile.png"}
              alt={member.name}
              fill
              className={`rounded-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                isLoading ? "grayscale" : "grayscale-0"
              }`}
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-4 relative z-10">
          <span className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            NODE_MEMBER // AIML
          </span>
          <h3 className="text-lg font-bold font-space-grotesk text-foreground text-center">
            {member.name}
          </h3>
          <p className="mt-1 px-2 py-0.5 rounded text-xs font-mono-tech text-brand-accent bg-brand/10 border border-brand/20 text-center uppercase tracking-wider">
            {member.post}
          </p>
        </div>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn"
        >
          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-card border border-brand-accent/40 rounded-xl p-6 shadow-2xl overflow-hidden bg-blueprint-grid"
          >
            <CircuitTrace corners={true} />

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center justify-center relative z-10 pt-2">
              <div className="relative h-36 w-36 rounded-full overflow-hidden border-2 border-gold shadow-lg mb-4">
                {isLoading && (
                  <Skeleton className="absolute inset-0 rounded-full bg-muted/40" />
                )}
                <Image
                  src={member.image || "/fallback_profile.png"}
                  alt={member.name}
                  fill
                  className="rounded-full object-cover"
                  onLoad={() => setIsLoading(false)}
                />
              </div>

              <span className="font-mono-tech text-xs text-gold uppercase tracking-widest mb-1">
                EXECUTIVE_PROFILE
              </span>
              <h2 className="text-2xl font-bold font-space-grotesk text-foreground text-center">
                {member.name}
              </h2>
              <span className="mt-1 px-3 py-1 rounded text-xs font-mono-tech text-brand-accent bg-brand/15 border border-brand/30 uppercase tracking-wider">
                {member.post}
              </span>

              {member.quote && (
                <p className="mt-4 px-4 py-3 text-xs md:text-sm font-space-grotesk text-muted-foreground text-center italic bg-background/60 rounded-lg border border-brand/20">
                  &ldquo;{member.quote}&rdquo;
                </p>
              )}

              <div className="flex gap-4 mt-6">
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-background border border-brand/30 hover:border-brand-accent hover:text-brand-accent transition-all"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {member.github && (
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-background border border-brand/30 hover:border-brand-accent hover:text-brand-accent transition-all"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-background border border-brand/30 hover:border-brand-accent hover:text-brand-accent transition-all"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
