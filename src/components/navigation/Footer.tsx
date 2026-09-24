"use client";

import { GithubIcon, InstagramIcon, LinkedinIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-background bg-blueprint-grid border-t border-brand/15 mt-16 py-8 relative z-30 text-foreground">
      <div className="flex w-full flex-col items-center justify-center px-4 max-w-6xl mx-auto space-y-4">
        {/* Social Links */}
        <div className="flex items-center space-x-6 text-muted-foreground">
          <a
            href="https://www.instagram.com/tasc_nmamit/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-muted-foreground hover:text-brand-accent transition-colors"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/tasc-nmamit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground hover:text-brand-accent transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/company/tasc-aiml/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-muted-foreground hover:text-brand-accent transition-colors"
          >
            <LinkedinIcon className="w-5 h-5" />
          </a>
        </div>

        {/* Copyright & Technical Team Credit */}
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground font-medium">
            © 2026 TASC • Department of Artificial Intelligence & Machine Learning
          </p>
          <a
            href="https://github.com/tasc-nmamit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] text-brand-accent/80 hover:text-brand-accent font-semibold transition-colors"
          >
            Engineered by TASC Technical Team
          </a>
        </div>
      </div>
    </footer>
  );
}
