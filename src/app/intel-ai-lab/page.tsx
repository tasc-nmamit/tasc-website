"use client";

import { useState } from "react";
import Image from "next/image";
import {
  facilitiesData,
  heading,
  specs,
  subHeading,
} from "@/lib/data/Facilities";
import TechnicalLabel from "@/components/ui/circuit-ink/TechnicalLabel";
import CircuitTrace from "@/components/ui/circuit-ink/CircuitTrace";
import LineSidebar from "@/components/ui/LineSidebar";

export default function IntelAIlab() {
  const [active, setActive] = useState(0);
  const activeData = facilitiesData[active];
  const sidebarItems = facilitiesData.map((f) => f.key);

  return (
    <main className="min-h-dvh bg-background bg-blueprint-grid relative overflow-x-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent pointer-events-none" />
      <div className="flex min-h-screen w-full flex-col lg:flex-row pt-28 pb-20 px-4 md:px-12 max-w-7xl mx-auto gap-8 relative z-10 text-foreground">

        {/* Interactive Line Sidebar Navigation */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-40 pt-4 lg:pt-8 space-y-4">
            <LineSidebar
              items={sidebarItems}
              active={active}
              onItemClick={(index) => setActive(index)}
              accentColor="#c084fc"
              textColor="#94a3b8"
              markerColor="#475569"
              showIndex={true}
              showMarker={true}
              proximityRadius={100}
              maxShift={26}
              falloff="smooth"
              markerLength={48}
              itemGap={22}
              fontSize={0.98}
              smoothing={90}
            />
          </div>
        </aside>

        {/* Main Content Display Area */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header Container */}
          <div className="relative bg-card/85 border border-brand/25 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <CircuitTrace corners={true} />
            <div className="relative z-10 text-center sm:text-left space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-valley text-foreground tracking-tight">
                {heading}
              </h1>
              <p className="text-sm md:text-base font-valley text-muted-foreground">
                {subHeading}
              </p>
            </div>
          </div>

          {/* Content View */}
          {activeData.key === "Workstation Specifications" ? (
            <div className="bg-card/85 border border-brand/25 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
              <h2 className="text-2xl font-bold font-valley text-foreground">
                {activeData.title}
              </h2>
              <p className="pb-3 text-xs sm:text-sm font-mono text-brand-accent border-b border-border/50 uppercase tracking-wider">
                LAB_EQUIPMENT: 38 Dell Precision 3660 Tower Workstations
              </p>

              <div className="w-full overflow-hidden rounded-xl border border-border/60 bg-background/60">
                <table className="w-full text-left text-xs sm:text-sm font-mono">
                  <tbody className="divide-y divide-border/40">
                    {specs.map((spec) => (
                      <tr
                        key={spec.title}
                        className="hover:bg-brand/5 transition-colors"
                      >
                        <td className="p-4 font-bold text-brand-accent align-top w-1/3 border-r border-border/40">
                          {spec.title}
                        </td>
                        <td className="p-4 text-foreground/90">
                          {spec.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-card/85 border border-brand/25 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
              {activeData.title && (
                <h2 className="text-2xl sm:text-3xl font-bold font-valley text-foreground">
                  {activeData.title}
                </h2>
              )}

              {activeData.content && (
                <p className="text-sm sm:text-base font-valley text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {activeData.content}
                </p>
              )}

              {activeData.bullets && (
                <div className="space-y-4 pt-2">
                  {activeData.bullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="bg-background/60 dark:bg-card/50 p-5 rounded-xl border border-border/50 space-y-2"
                    >
                      <h4 className="font-valley font-bold text-brand-accent text-base sm:text-lg">
                        {bullet.header}
                      </h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm font-valley text-muted-foreground list-disc pl-5 leading-relaxed">
                        {bullet.points.map((point, pIdx) => (
                          <li key={pIdx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {activeData.images && activeData.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {activeData.images.map((i) => (
                    <div
                      key={i}
                      className="relative h-48 w-full overflow-hidden rounded-xl border border-border/50 shadow-md group"
                    >
                      <Image
                        src={`/facilities/${i}.webp`}
                        alt={`Facility image ${i}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

