"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Faculty } from "@prisma";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";

interface FacultyCardProps {
  faculty: Faculty;
}

export default function FacultyCard({ faculty }: FacultyCardProps) {
  const { name, designation, designation2, image, about } = faculty;
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-64 cursor-pointer min-h-[280px] overflow-hidden rounded-xl border border-brand/20 dark:border-brand/30 bg-white dark:bg-card p-5 shadow-lg dark:shadow-xl transition-all duration-300 hover:border-brand-accent/60 hover:scale-105 relative group bg-blueprint-grid">
          <CircuitTrace corners={true} />

          <div className="mx-auto flex items-center justify-center relative z-10">
            <div className="relative aspect-square w-32 rounded-full overflow-hidden border-2 border-brand-accent/40 shadow-inner">
              {isLoading && (
                <Skeleton className="absolute inset-0 rounded-full bg-muted/40" />
              )}
              <Image
                src={image}
                alt={name}
                fill
                className={`rounded-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                  isLoading ? "grayscale" : "grayscale-0"
                }`}
                onLoad={() => setIsLoading(false)}
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-4 relative z-10 text-center">
            <h3 className="text-base font-bold font-space-grotesk text-foreground line-clamp-1">
              {name}
            </h3>
            <p className="mt-1 text-xs font-mono-tech text-brand-accent uppercase tracking-wider line-clamp-1">
              {designation}
            </p>
            {designation2 && (
              <p className="text-[11px] font-mono-tech text-gold uppercase tracking-wider line-clamp-1 mt-0.5">
                {designation2}
              </p>
            )}
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-lg overflow-hidden lg:max-w-4xl bg-white dark:bg-card border border-brand/30 rounded-xl p-6 shadow-2xl bg-blueprint-grid">
        <DialogHeader className="w-full border-b border-brand/20 pb-4">
          <DialogTitle className="text-2xl font-bold font-space-grotesk text-foreground">
            {name}
          </DialogTitle>
          <DialogDescription className="text-sm font-mono-tech text-brand-accent uppercase tracking-wider">
            {designation} {designation2 ? `// ${designation2}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col justify-center lg:flex-row gap-6 lg:gap-8 pt-4">
          <div className="flex min-w-[16rem] justify-center object-cover md:shrink-0 lg:min-w-[20rem]">
            <div className="relative aspect-square w-48 md:shrink-0 lg:w-72 rounded-lg overflow-hidden border-2 border-brand/40 shadow-md">
              <Image src={image} alt={name} fill className="object-cover" />
            </div>
          </div>

          <div className="flex grow flex-col overflow-y-auto space-y-3 pr-2 font-space-grotesk text-sm text-muted-foreground leading-relaxed max-h-[350px]">
            {about.map((para: string, index: number) => (
              <p key={index} className="bg-background/60 p-3 rounded-lg border border-brand/20">
                {para}
              </p>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
