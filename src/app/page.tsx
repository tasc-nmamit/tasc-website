"use client";

import Link from "next/link";
import AboutSection from "@/components/navigation/AboutSection";
import TrainModelSection from "@/components/interactive/TrainModelSection";
import MoltenMetal from "@/components/MoltenMetal";
import ScrollExpand from "@/components/ui/ScrollExpand";

export default function Home() {
  return (
    <main className="min-h-dvh overflow-x-hidden relative bg-[#050308]">
      {/* Official React Bits ScrollExpand Hero Section */}
      <ScrollExpand
        useWindowScroll={true}
        src="/CenterGraphic.png"
        alt="TASC Handshake"
        title="TASC"
        scrollHint="Scroll to explore"
        startWidth={38}
        startHeight={50}
        startRadius={24}
        endRadius={0}
        mediaZoom={1.2}
        scrollDistance={1.0}
        holdDistance={0.2}
        overlayScrim={0.55}
      >
        {/* Background Atmosphere Layer inside Expanded Frame Overlay */}
        <div className="absolute inset-0 z-0 bg-[#050308]/60 pointer-events-none" />

        {/* Blueprint Grid Background Overlay */}
        <div className="absolute inset-0 z-0 bg-blueprint-grid opacity-40 pointer-events-none" />

        {/* MoltenMetal Shader Layer */}
        <div className="absolute inset-0 z-10 opacity-50 pointer-events-none">
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
          <div className="font-valley bg-linear-to-r from-[#5B35A0] via-[#8B5CF6] to-[#C9A15A] bg-clip-text text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tight leading-tight">
            <p className="text-transparent">Turing</p>
            <p className="text-transparent">Artificial Intelligence</p>
            <p className="text-transparent">Students</p>
            <p className="text-transparent">Committee</p>
          </div>

          <div className="mt-8 text-center px-4">
            <p className="text-xs sm:text-sm md:text-xl font-valley text-foreground">
              Welcome to the official website of TASC,
              <br />
              <span className="font-bold text-brand-accent">
                Department of Artificial Intelligence and Machine Learning
              </span>
            </p>
          </div>

          {/* Bouncing Scroll Down Arrow */}
          <div className="mt-8 flex items-center justify-center animate-bounce">
            <Link href="/#about" aria-label="Scroll down to about section">
              <svg
                width="40"
                height="40"
                viewBox="0 0 74 74"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="hidden dark:block"
              >
                <path
                  d="M65.2726 18.5L69.375 22.1445L37 55.5L4.625 22.1445L8.72738 18.5L37 47.6283L65.2726 18.5Z"
                  fill="white"
                />
              </svg>
              <svg
                width="40"
                height="40"
                viewBox="0 0 74 74"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="block dark:hidden"
              >
                <path
                  d="M65.2726 18.5L69.375 22.1445L37 55.5L4.625 22.1445L8.72738 18.5L37 47.6283L65.2726 18.5Z"
                  fill="black"
                />
              </svg>
            </Link>
          </div>
        </div>
      </ScrollExpand>

      {/* Subsequent Homepage Sections (Strictly Preserved) */}
      <section id="about" className="flex max-w-[100vw] py-10 justify-center">
        <AboutSection />
      </section>

      {/* Signature Interactive Centerpiece: Train the Model */}
      <section id="train-model" className="w-full py-6">
        <TrainModelSection />
      </section>
    </main>
  );
}
