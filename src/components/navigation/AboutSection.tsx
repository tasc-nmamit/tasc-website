"use client";

import Image from "next/image";
import TechnicalCard from "@/components/ui/circuit-ink/TechnicalCard";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";

export default function AboutSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="h-px bg-brand/30 flex-1"></span>
        <TechnicalLabel variant="primary">[ SYSTEM_OVERVIEW // MISSION_VISION ]</TechnicalLabel>
        <span className="h-px bg-brand/30 flex-1"></span>
      </div>

      <TechnicalCard className="bg-blueprint-grid">
        <h2 className="text-3xl md:text-5xl font-bold font-space-grotesk tracking-tight text-center mb-10 text-foreground">
          About <span className="text-gold">TASC Laboratory</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="bg-background/80 border border-brand/20 p-4 rounded-lg">
              <h3 className="text-xl font-bold font-space-grotesk text-brand-accent flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
                MISSION
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                To provide an excellent academic environment for continuous improvement in Computer Science, 
                Artificial Intelligence, and Machine Learning specialization by imparting education with innovation, 
                skills, and a positive attitude.
              </p>
            </div>

            <div className="bg-background/80 border border-brand/20 p-4 rounded-lg">
              <h3 className="text-xl font-bold font-space-grotesk text-gold flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-gold"></span>
                VISION
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                To be a center of excellence in Artificial Intelligence and Machine Learning Engineering education 
                and research, producing comprehensively trained, technically skilled, and ethically strong engineers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-background/80 border border-brand/20 p-3.5 rounded-lg">
                <h4 className="text-sm font-bold font-space-grotesk text-foreground mb-1">VALUES</h4>
                <p className="text-xs text-muted-foreground">
                  Creativity, collaboration, inclusivity, ethics, and academic excellence.
                </p>
              </div>

              <div className="bg-background/80 border border-brand/20 p-3.5 rounded-lg">
                <h4 className="text-sm font-bold font-space-grotesk text-foreground mb-1">BELIEF</h4>
                <p className="text-xs text-muted-foreground">
                  Harnessing AI to solve real-world problems responsibly and ethically.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full aspect-4/3 rounded-lg overflow-hidden border border-brand/40 shadow-2xl">
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/AboutBanner.jpeg?alt=media&token=a258cf9b-be51-4160-a773-7917daa50cbc&_gl=1*1h5cmm8*_ga*MTE2MzE3ODExMC4xNjk1Mzg4Nzkx*_ga_CW55HF8NVT*MTY5NjIxODM2NC4xOS4xLjE2OTYyMTg1NTYuNjAuMC4w"
                alt="AboutBanner"
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-background/80 backdrop-blur border border-brand/20 font-mono-tech text-[10px] text-muted-foreground">
                DEPT_BANNER // AIML
              </div>
            </div>
          </div>
        </div>
      </TechnicalCard>
    </div>
  );
}
