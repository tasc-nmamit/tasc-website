"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Faculty } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface FacultyCardProps {
  faculty: Faculty;
}

export default function FacultyCard({ faculty }: FacultyCardProps) {
  const { name, designation, designation2, image, about } = faculty;

  const [isLoading, setIsLoading] = useState(true);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="dark:custom-shadow-black w-60 cursor-pointer h-64 overflow-hidden rounded-lg border-zinc-300 dark:border-zinc-600 border bg-background pt-4 shadow-xl duration-300 ease-in-out hover:scale-105">
          <div className="mx-14 flex items-center justify-center">
            <div className="relative aspect-square w-full">
              {isLoading && (
                <Skeleton className="absolute inset-0 rounded-full" />
              )}
              <Image
                src={image}
                alt={name}
                fill
                className={`rounded-full border border-border object-cover duration-300 ease-in-out ${
                  isLoading ? "grayscale" : "grayscale-0"
                }`}
                onLoad={() => setIsLoading(false)}
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center pt-4">
            <h1 className="text-xl font-bold">{name}</h1>
            <h2 className="text-lg font-medium text-zinc-600 dark:text-slate-400">
              {designation}
            </h2>
            {designation2 && (
              <h2 className="text-lg text-zinc-600 dark:text-slate-400 font-medium">
                {designation2}
              </h2>
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-[70vh] max-w-lg overflow-hidden lg:max-w-4xl">
        <DialogHeader className="w-full">
          <DialogTitle className="text-2xl font-bold">{name}</DialogTitle>
          <DialogDescription className="text-lg font-medium">
            {designation}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col justify-center lg:flex-row gap-6 lg:gap-8">
          <div className="flex min-w-[16rem] justify-center object-cover md:shrink-0 lg:min-w-[24rem]">
            <div className="relative aspect-square w-64 md:shrink-0 lg:w-96">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>

          <div className="flex grow flex-col overflow-y-auto space-y-4 px-4 pr-6">
            {about.map((para, index) => (
              <p key={index}>{para}</p>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
