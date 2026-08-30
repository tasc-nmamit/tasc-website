"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import MoltenMetal from "@/components/MoltenMetal";

export default function ScrollExpandHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detect prefers-reduced-motion for accessibility
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setPrefersReducedMotion(true);
      setScrollProgress(1);
      return;
    }

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effective progress (1.0 if reduced motion is preferred)
  const p = prefersReducedMotion ? 1 : scrollProgress;

  // Interpolation logic (Tightly mapped across 1.5vh scroll):
  // 1. Initial TASC Intro Text (p: 0 -> 0.3)
  const initialTascOpacity = Math.max(1 - p / 0.3, 0);
  const initialTascScale = 1 + p * 0.2;

  // 2. Media Frame Expansion (p: 0 -> 0.6)
  const frameWidthPercent = Math.min(32 + p * 115, 100);
  const frameHeightPercent = Math.min(38 + p * 105, 100);
  const frameBorderRadius = Math.max(28 * (1 - p / 0.6), 0);
  const frameBorderOpacity = Math.max(1 - p / 0.45, 0);
  const imageScale = 1.12 - p * 0.12;

  // 3. Background & Shader Opacity (p: 0.1 -> 0.6)
  const bgOpacity = Math.min(Math.max((p - 0.1) / 0.5, 0), 1);

  // 4. Final TASC Full Title Reveal (p: 0.35 -> 0.8)
  const fullTitleOpacity = Math.min(Math.max((p - 0.35) / 0.45, 0), 1);
  const fullTitleTranslateY = (1 - fullTitleOpacity) * 25;

  // 5. Tagline & Scroll Down Arrow (p: 0.6 -> 0.95)
  const subtitleOpacity = Math.min(Math.max((p - 0.6) / 0.35, 0), 1);

  return (
    <div ref={containerRef} className="relative h-[160vh] w-full bg-[#050308]">
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#050308] select-none">
        {/* Backdrop Image (Tasc-bg.jpeg) */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat mix-blend-luminosity filter contrast-125 brightness-75 pointer-events-none transition-opacity duration-150"
          style={{
            backgroundImage: "url('/Tasc-bg.jpeg')",
            opacity: bgOpacity * 0.5,
          }}
        />

        {/* Blueprint Grid Background Overlay */}
        <div
          className="absolute inset-0 z-0 bg-blueprint-grid pointer-events-none transition-opacity duration-150"
          style={{ opacity: 0.15 + bgOpacity * 0.45 }}
        />

        {/* Radial Dark Vignette */}
        <div className="absolute inset-0 z-0 bg-radial from-transparent via-[#050308]/60 to-[#050308] pointer-events-none" />

        {/* MoltenMetal Shader Background */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-150"
          style={{ opacity: bgOpacity * 0.45 }}
        >
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

        {/* STAGE 1: Centered "TASC" Initial Intro Text */}
        {initialTascOpacity > 0.01 && (
          <div
            className="absolute z-40 text-center pointer-events-none flex flex-col items-center justify-center font-valley px-4"
            style={{
              opacity: initialTascOpacity,
              transform: `scale(${initialTascScale})`,
            }}
          >
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter bg-linear-to-r from-white via-purple-200 to-brand-accent bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(139,92,246,0.6)]">
              TASC
            </h1>
            <p className="text-xs sm:text-sm font-mono-tech text-purple-300/80 tracking-widest mt-2 uppercase">
              Scroll to explore
            </p>
          </div>
        )}

        {/* STAGE 2: Expanding Media Frame (Handshake Visual) */}
        <div
          className="relative z-30 flex items-center justify-center overflow-hidden transition-all duration-75"
          style={{
            width: p >= 0.65 ? "100%" : `${frameWidthPercent}vw`,
            height: p >= 0.65 ? "100%" : `${frameHeightPercent}vh`,
            borderRadius: `${frameBorderRadius}px`,
            boxShadow: `0 0 50px rgba(139, 92, 246, ${frameBorderOpacity * 0.5})`,
            border:
              frameBorderOpacity > 0.05
                ? `1px solid rgba(139, 92, 246, ${frameBorderOpacity * 0.4})`
                : "none",
          }}
        >
          {/* Main Handshake Center Graphic */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src="/CenterGraphic.png"
              alt="TASC Handshake"
              width={650}
              height={650}
              priority
              className="object-contain md:scale-90 lg:scale-100 drop-shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-transform duration-75"
              style={{
                transform: `scale(${imageScale})`,
              }}
            />
          </div>
        </div>

        {/* STAGE 3 & 4: Full Hero Content Reveal */}
        {fullTitleOpacity > 0.01 && (
          <div
            className="absolute inset-0 z-40 flex flex-col items-center justify-center px-4 pointer-events-auto font-valley"
            style={{
              opacity: fullTitleOpacity,
              transform: `translateY(${fullTitleTranslateY}px)`,
            }}
          >
            <div className="flex flex-col md:flex-row-reverse items-center justify-center max-w-6xl w-full translate-y-[-6%]">
              <div className="flex flex-col text-center md:text-left md:pl-8">
                <div className="font-valley bg-linear-to-r from-[#5B35A0] via-[#8B5CF6] to-[#C9A15A] bg-clip-text text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-bold tracking-tight leading-tight">
                  <p className="text-transparent">Turing</p>
                  <p className="text-transparent">Artificial Intelligence</p>
                  <p className="text-transparent">Students</p>
                  <p className="text-transparent">Committee</p>
                </div>
              </div>
            </div>

            {/* Tagline Subtitle */}
            <div
              className="absolute bottom-24 md:bottom-28 w-full text-center px-4 transition-opacity duration-300"
              style={{ opacity: subtitleOpacity }}
            >
              <p className="text-xs sm:text-sm md:text-xl font-valley text-foreground">
                Welcome to the official website of TASC,
                <br />
                <span className="font-bold text-brand-accent">
                  Department of Artificial Intelligence and Machine Learning
                </span>
              </p>
            </div>

            {/* Bouncing Down Arrow Link */}
            <div
              className="absolute bottom-6 md:bottom-8 w-full flex items-center justify-center animate-bounce transition-opacity duration-300"
              style={{ opacity: subtitleOpacity }}
            >
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
        )}
      </div>
    </div>
  );
}
