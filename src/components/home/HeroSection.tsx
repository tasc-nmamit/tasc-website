"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import MoltenMetal from "@/components/MoltenMetal";
import Link from "next/link";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Entrance animation for title parts
      tl.from(".title-word", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
        delay: 0.2
      })
      // Entrance animation for subtitle
      .from(subtitleRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.6")
      // Entrance animation for arrow
      .from(arrowRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.8,
        ease: "bounce.out"
      }, "-=0.4");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden w-full">
      {/* Background Atmosphere Layer */}
      <div className="absolute inset-0 z-0 bg-background/60 pointer-events-none" />

      {/* Blueprint Grid Background Overlay */}
      <div className="absolute inset-0 z-0 bg-blueprint-grid opacity-40 pointer-events-none" />

      {/* MoltenMetal Shader Layer */}
      <div className="absolute inset-0 z-10 opacity-50 pointer-events-none mix-blend-screen dark:mix-blend-normal">
        <MoltenMetal
          color1="#5B35A0"
          color2="#8B5CF6"
          color3="#C9A15A"
          speed={0.3}
          scale={3}
          detail={3}
          glow={1.2}
          coreSize={0.08}
          swirl={1}
          fold={-0.2}
          opacity={0.65}
          mouseInteraction={true}
        />
      </div>

      {/* Revealed Full Hero Content */}
      <div className="relative z-30 flex flex-col items-center justify-center max-w-6xl w-full text-center px-4 font-valley">
        <h1 ref={titleRef} className="font-valley text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tight leading-tight pb-4">
          <span className="title-word inline-block mr-2 md:mr-4 bg-linear-to-r from-[#5B35A0] via-[#8B5CF6] to-[#C9A15A] bg-clip-text text-transparent">Turing</span>
          <span className="title-word inline-block mr-2 md:mr-4 bg-linear-to-r from-[#5B35A0] via-[#8B5CF6] to-[#C9A15A] bg-clip-text text-transparent">Artificial</span>
          <span className="title-word inline-block mr-2 md:mr-4 bg-linear-to-r from-[#5B35A0] via-[#8B5CF6] to-[#C9A15A] bg-clip-text text-transparent">Intelligence</span>
          <span className="title-word inline-block mr-2 md:mr-4 bg-linear-to-r from-[#5B35A0] via-[#8B5CF6] to-[#C9A15A] bg-clip-text text-transparent">Students</span>
          <span className="title-word inline-block bg-linear-to-r from-[#5B35A0] via-[#8B5CF6] to-[#C9A15A] bg-clip-text text-transparent">Committee</span>
        </h1>

        <div ref={subtitleRef} className="mt-8 text-center px-4">
          <p className="text-xs sm:text-sm md:text-xl font-valley text-foreground">
            Welcome to the official website of TASC,
            <br />
            <span className="font-bold text-brand-accent">
              Department of Artificial Intelligence and Machine Learning
            </span>
          </p>
        </div>

        {/* Bouncing Scroll Down Arrow */}
        <div ref={arrowRef} className="mt-16 flex items-center justify-center">
          <Link href="/#about" aria-label="Scroll down to about section" className="animate-bounce block">
            <svg
              width="40"
              height="40"
              viewBox="0 0 74 74"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-foreground"
            >
              <path
                d="M65.2726 18.5L69.375 22.1445L37 55.5L4.625 22.1445L8.72738 18.5L37 47.6283L65.2726 18.5Z"
                fill="currentColor"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
