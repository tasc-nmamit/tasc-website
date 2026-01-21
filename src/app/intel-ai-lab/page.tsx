"use client";

import { useState } from "react";
import Image from "next/image";
import {
  facilitiesData,
  heading,
  specs,
  subHeading,
} from "@/lib/data/Facilities";
import { cn } from "@/lib/utils";

export default function IntelAIlab() {
  const [active, setActive] = useState(0);
  const activeData = facilitiesData[active];

  return (
    <div className="flex min-h-screen w-full flex-col sm:flex-row pt-20">
      {/* Sidebar Navigation */}
      <div className="relative flex h-fit w-full sm:w-1/3 sm:min-h-[calc(100vh-80px)]">
        <div className="flex w-full flex-col px-4 pb-4 sm:sticky sm:top-24">
          {facilitiesData.map((data, index) => (
            <button
              key={data.key}
              onClick={() => setActive(index)}
              className={cn(
                "m-1 w-full rounded rounded-b-md rounded-t-md border-b-[1px] p-3 text-left transition-colors duration-300 sm:p-6",
                index === active
                  ? "bg-[#dfdee3] text-black"
                  : "bg-slate-900 text-white hover:bg-[#dfdee3] hover:text-black",
              )}
            >
              {data.key}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="h-full w-full bg-[#0e162a1e] px-6 pt-10 dark:bg-[#0e162a59] sm:w-2/3 md:px-20 pb-20">
        <div className="flex flex-col gap-5">
          {/* Header */}
          <h1 className="flex flex-col gap-y-2 self-center rounded-full border-2 bg-slate-50 p-4 text-center text-lg font-semibold drop-shadow-2xl dark:bg-slate-900 sm:max-w-2xl md:p-6 md:text-xl lg:text-3xl text-slate-800 dark:text-slate-100">
            {heading}
            <span className="text-md font-normal text-slate-600 dark:text-slate-400 md:text-lg lg:text-2xl">
              {subHeading}
            </span>
          </h1>

          {/* Content Logic */}
          {activeData.key === "Workstation Specifications" ? (
            <>
              <h2 className="text-2xl font-medium">{activeData.title}</h2>
              <div className="w-full overflow-hidden rounded-lg border border-border">
                <div className="p-4">
                  <p className="pb-4 text-lg leading-7 sm:pb-0 font-semibold mb-4">
                    Lab is equipped with 38 Dell Precision 3660 Tower
                    Workstations
                  </p>
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-border">
                      {specs.map((spec) => (
                        <tr
                          key={spec.title}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-4 font-semibold text-foreground align-top w-1/3">
                            {spec.title}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {spec.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              {activeData.title && (
                <h2 className="text-2xl font-bold">{activeData.title}</h2>
              )}

              {activeData.content && (
                <p className="pb-10 text-lg leading-7 text-slate-800 dark:text-slate-300 sm:pb-0">
                  {activeData.content}
                </p>
              )}

              {activeData.bullets && (
                <ul className="space-y-6">
                  {activeData.bullets.map((bullet, idx) => (
                    <li key={idx} className="pb-6 text-lg leading-7 sm:pb-0">
                      <span className="font-semibold block mb-2">
                        {bullet.header}
                      </span>
                      <ul className="ml-8 list-disc text-slate-800 dark:text-slate-300 space-y-2">
                        {bullet.points.map((point, pIdx) => (
                          <li key={pIdx} className="text-md leading-7">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}

              {activeData.images && activeData.images.length > 0 && (
                <div className="mb-10 grid w-full grid-cols-1 place-items-center gap-10 sm:pb-0 md:grid-cols-2 lg:grid-cols-3 pt-6">
                  {activeData.images.map((i) => (
                    <div
                      key={i}
                      className="relative h-44 w-72 md:h-48 overflow-hidden rounded-md drop-shadow-2xl transition-transform hover:scale-105"
                    >
                      <Image
                        src={`/facilities/${i}.webp`}
                        alt={`Facility image ${i}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
