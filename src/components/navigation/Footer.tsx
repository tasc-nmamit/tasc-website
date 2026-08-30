"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAVITEM } from "@/lib/data/NavbarItems";
import { cn } from "@/lib/utils";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="w-full bg-transparent mt-16 pb-12 relative z-30">
      {/* Top Accent Text */}
      <div className="flex items-center justify-center gap-3 px-4 pt-4">
        <span className="h-[1px] bg-white/10 flex-1 max-w-xs hidden sm:block"></span>
        <span className="text-[11px] font-bold tracking-widest text-purple-300/80 uppercase">
          Department of Artificial Intelligence & Machine Learning
        </span>
        <span className="h-[1px] bg-white/10 flex-1 max-w-xs hidden sm:block"></span>
      </div>

      <div className="flex w-full flex-col items-center justify-between px-4 py-8 md:px-16 max-w-6xl mx-auto space-y-6">
        
        {/* Branding & Logo */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
          <Image
            width={90}
            height={30}
            className="w-20 md:w-24 h-auto object-contain brightness-125 shrink-0"
            src="https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/TASCLogo.png?alt=media&token=885899c8-a49c-46d7-9d22-ebc5507964db&_gl=1*1sdhvuu*_ga*MTE2MzE3ODExMC4xNjk1Mzg4Nzkx*_ga_CW55HF8NVT*MTY5NjIxODM2NC4xOS4xLjE2OTYyMTg2ODMuNjAuMC4w"
            alt="TASC Logo"
          />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Turing Artificial Intelligence Students Committee
            </h3>
            <p className="text-xs text-purple-200/80">
              NMAM Institute of Technology, Nitte (Deemed to be University)
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-6 text-slate-300">
          <a
            href="https://www.instagram.com/tasc_nmamit/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-slate-300 hover:text-purple-400 transition-colors"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/tasc-nmamit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-slate-300 hover:text-purple-400 transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/company/tasc-aiml/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-slate-300 hover:text-purple-400 transition-colors"
          >
            <LinkedinIcon className="w-5 h-5" />
          </a>
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-wrap justify-center text-xs font-semibold uppercase tracking-wider gap-x-6 gap-y-2 py-2">
          {NAVITEM.map((item) => {
            const isActive =
              pathname.split("/")[1] === item.title.toLowerCase() ||
              (pathname === "/" && item.title === "Home");

            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "text-white font-bold border-b border-purple-400 pb-0.5"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Copyright & Technical Team Credit */}
        <div className="text-center space-y-1 pt-2">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 TASC • Department of Artificial Intelligence & Machine Learning
          </p>
          <a
            href="https://github.com/tasc-nmamit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] text-purple-300/80 hover:text-white font-semibold transition-colors"
          >
            Engineered by TASC Technical Team
          </a>
        </div>

      </div>
    </footer>
  );
}
