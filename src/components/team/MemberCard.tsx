import { useState } from "react";
import { Member } from "@/lib/types/Member";
import Image from "next/image";
import { Github, Linkedin, Instagram } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
        className="dark:custom-shadow-black w-72 cursor-pointer overflow-hidden rounded-lg border-zinc-300 bg-background dark:border-zinc-700 border dark:bg-background py-5 shadow-xl duration-300 ease-in-out hover:scale-110"
      >
        <div className="mx-14 flex items-center justify-center">
          <div className="relative aspect-square w-full">
            {isLoading && (
              <Skeleton className="absolute inset-0 rounded-full" />
            )}
            <Image
              src={member.image || "/fallback_profile.png"}
              alt={member.name}
              fill
              className={`rounded-full border border-border object-cover duration-300 ease-in-out ${
                isLoading ? "grayscale" : "grayscale-0"
              }`}
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <h1 className="pt-4 text-xl font-bold">{member.name}</h1>
          <h2 className="p-2 text-lg font-medium text-zinc-600 dark:text-slate-400 text-center">
            {member.post}
          </h2>
        </div>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed top-0 z-10 h-screen w-full duration-300"
          style={{ display: "block" }}
        >
          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="card dark:shadow-black fixed inset-0 top-[20%] z-20 mx-auto flex min-h-max w-[80%] cursor-pointer flex-col items-center overflow-hidden rounded-lg border border-border bg-background shadow-lg md:min-h-fit md:w-1/2 lg:w-1/4"
          >
            <div className="flex items-center justify-center p-5">
              <div className="relative h-48 w-48">
                {isLoading && (
                  <Skeleton className="absolute inset-0 rounded-full" />
                )}
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className={`rounded-full border border-border object-cover duration-300 ease-in-out ${
                    isLoading ? "grayscale" : "grayscale-0"
                  }`}
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <h1 className="pt-4 text-2xl font-bold">{member.name}</h1>
              <h2 className="p-2 text-base font-medium">{member.post}</h2>
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex gap-5 py-2"
              >
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-10 h-10" />
                  </a>
                )}
                {member.github && (
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-10 h-10" />
                  </a>
                )}
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-10 h-10" />
                  </a>
                )}
              </div>
              {member.quote && (
                <p className="px-10 py-4 text-center">{member.quote}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
