"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import TuringNeuralField from "./TuringNeuralField";
import Link from "next/link";
import { ArrowRight, Cpu, Sparkles } from "lucide-react";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Entrance animation for title parts & badges
      tl.from(".title-word", {
        y: 60,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: "power4.out",
        delay: 0.15,
      })
      // Entrance animation for subtitle
      .from(
        subtitleRef.current,
        {
          y: 25,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
        },
        "-=0.5"
      )
      // Entrance animation for action buttons
      .from(
        actionsRef.current,
        {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.4"
      )
      // Entrance animation for arrow
      .from(
        arrowRef.current,
        {
          y: -15,
          opacity: 0,
          duration: 0.8,
          ease: "bounce.out",
        },
        "-=0.3"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden w-full pt-20 pb-12"
    >
      {/* Background Atmosphere & Grid */}
      <div className="absolute inset-0 z-0 bg-background/70 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-blueprint-grid opacity-35 pointer-events-none" />

      {/* Bespoke Interactive Turing Neural Synapse Field */}
      <TuringNeuralField />

      {/* Radial Depth Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-brand/15 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Hero Content */}
      <div className="relative z-30 flex flex-col items-center justify-center max-w-5xl w-full text-center px-4">
        {/* Futuristic Status Badge */}
        <div className="title-word inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-brand/35 bg-card/75 backdrop-blur-md shadow-lg shadow-brand/10 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-mono-tech text-xs tracking-widest text-foreground uppercase">
            TASC // DEPT OF AIML // NMAMIT
          </span>
        </div>

        {/* Hero Title */}
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-extrabold font-space-grotesk tracking-tight leading-[1.08] pb-3"
        >
          <span className="title-word inline-block mr-2 md:mr-4 bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm">
            Turing
          </span>
          <span className="title-word inline-block mr-2 md:mr-4 text-foreground">
            Artificial
          </span>
          <span className="title-word inline-block mr-2 md:mr-4 text-foreground">
            Intelligence
          </span>
          <span className="title-word inline-block mr-2 md:mr-4 bg-gradient-to-r from-cyan-300 via-violet-300 to-purple-400 bg-clip-text text-transparent">
            Students
          </span>
          <span className="title-word inline-block text-foreground">
            Committee
          </span>
        </h1>

        {/* Subtitle */}
        <div ref={subtitleRef} className="mt-6 max-w-2xl text-center px-4">
          <p className="text-sm sm:text-base md:text-lg font-space-grotesk text-muted-foreground leading-relaxed">
            Welcome to the official portal of{" "}
            <span className="font-semibold text-foreground">TASC</span>, Department of{" "}
            <span className="font-semibold text-brand-accent">
              Artificial Intelligence and Machine Learning
            </span>
            . Driving student research, engineering breakthroughs, and intelligent systems.
          </p>
        </div>

        {/* Interactive Action Buttons */}
        <div
          ref={actionsRef}
          className="mt-10 flex flex-wrap items-center justify-center gap-4 relative z-30"
        >
          <Link
            href="/events"
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-brand text-white font-space-grotesk font-semibold text-sm shadow-xl shadow-brand/25 border border-brand-accent/50 hover:bg-brand/90 hover:shadow-brand/40 hover:scale-[1.02] transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
            <span>Explore Events</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/intel-ai-lab"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-card/80 backdrop-blur-md border border-brand/30 text-foreground font-space-grotesk font-semibold text-sm hover:border-brand-accent/60 hover:bg-card hover:scale-[1.02] transition-all shadow-md"
          >
            <Cpu className="w-4 h-4 text-brand-accent" />
            <span>Intel AI Lab</span>
          </Link>

          <Link
            href="/team/2026"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-card/50 backdrop-blur-md border border-border/60 text-muted-foreground hover:text-foreground font-space-grotesk text-sm hover:border-brand/40 transition-all"
          >
            <span>Core Team 2026–27</span>
          </Link>
        </div>

        {/* Bouncing Scroll Down Arrow */}
        <div ref={arrowRef} className="mt-14 flex flex-col items-center justify-center gap-2">
          <span className="text-[10px] font-mono-tech tracking-widest text-muted-foreground uppercase opacity-75">
            SCROLL TO EXPLORE
          </span>
          <Link
            href="/#about"
            aria-label="Scroll down to about section"
            className="animate-bounce block p-2 rounded-full hover:bg-brand/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 74 74"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="currentColor"
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
