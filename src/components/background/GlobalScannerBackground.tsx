"use client";

import { usePathname } from "next/navigation";
import Scanner from "@/components/background/Scanner";

export default function GlobalScannerBackground() {
  const pathname = usePathname();

  // Do NOT render on the Home page ("/")
  if (pathname === "/") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Interactive WebGL Scanner Animated Background */}
      <div className="absolute inset-0 opacity-90">
        <Scanner
          color1="#5227FF"
          color2="#a855f7"
          color3="#FFFFFF"
          speed={0.4}
          sweepSpeed={0.2}
          sweepWidth={1.8}
          sweepFalloff={5}
          scale={1.4}
          frequency={2}
          ripple={0.25}
          bandDensity={12}
          lineSharpness={5.0}
          glow={0.3}
          scanDirection="vertical"
          colorSpread={0.7}
          brightness={1.15}
          contrast={1.2}
          softness={1.3}
          vignette={0.3}
          scanline={true}
          grain={true}
          grainIntensity={0.04}
          opacity={0.9}
          mouseInteraction={true}
          mouseRadius={0.6}
          mouseStrength={0.6}
        />
      </div>

      {/* Clean Dark Overlay for Legibility across all pages */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </div>
  );
}
