"use client";

import Image from "next/image";
import TechnicalCard from "@/components/ui/circuit-ink/TechnicalCard";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function AboutSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      <TechnicalCard className="bg-blueprint-grid">
        <h2 className="text-3xl md:text-5xl font-bold font-space-grotesk tracking-tight text-center mb-10 text-foreground">
          About <span className="text-gold">TASC</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-6">
            <ScrollReveal variant="slideRight" delay={100}>
              <div className="bg-background/80 border border-brand/20 p-4 rounded-lg">
                <h3 className="text-xl font-bold font-space-grotesk text-brand-accent flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
                  MISSION
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  To promote and advance the fields of Artificial Intelligence and Machine Learning while simultaneously fostering a deep sense of community among its members. TASC provides students with the necessary resources, peer mentorship, and support to succeed both academically and professionally through student-led events, technical workshops, and hands-on activities.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="slideRight" delay={200}>
              <div className="bg-background/80 border border-brand/20 p-4 rounded-lg">
                <h3 className="text-xl font-bold font-space-grotesk text-gold flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  VISION
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  To create a cooperative and inclusive student platform that enables peers to explore, collaborate, and expand their technical boundaries in AI/ML, ultimately empowering them to bridge the gap between classroom engineering and real-world industrial visibility.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ScrollReveal variant="fadeUp" delay={300}>
                <div className="bg-background/80 border border-brand/20 p-3.5 rounded-lg h-full">
                  <h4 className="text-sm font-bold font-space-grotesk text-foreground mb-1">VALUES</h4>
                  <p className="text-xs text-muted-foreground">
                    Curiosity, Peer Mentorship, Active Collaboration and Community-Led Innovation
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="fadeUp" delay={400}>
                <div className="bg-background/80 border border-brand/20 p-3.5 rounded-lg h-full">
                  <h4 className="text-sm font-bold font-space-grotesk text-foreground mb-1">BELIEF</h4>
                  <p className="text-xs text-muted-foreground">
                    True learning extends beyond the classroom; by building together, students master tomorrow&apos;s tech today.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center h-full items-stretch">
            <ScrollReveal variant="scaleUp" delay={300} className="w-full h-full relative min-h-[300px]">
              <div className="relative w-full h-full rounded-lg overflow-hidden border border-brand/40 shadow-2xl group">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/AboutBanner.jpeg?alt=media&token=a258cf9b-be51-4160-a773-7917daa50cbc&_gl=1*1h5cmm8*_ga*MTE2MzE3ODExMC4xNjk1Mzg4Nzkx*_ga_CW55HF8NVT*MTY5NjIxODM2NC4xOS4xLjE2OTYyMTg1NTYuNjAuMC4w"
                  alt="AboutBanner"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </TechnicalCard>
    </div>
  );
}
