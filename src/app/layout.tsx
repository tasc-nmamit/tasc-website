import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import SessionProvider from "@/components/auth/SessionProvider";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import Vectorall from "@/components/background/Vectorall";
import OnboardingGuard from "@/components/auth/OnboardingGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TASC - NMAMIT",
  description: "Turing Artificial Intelligence Students Committee",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Script for iconify-icon */}
        <Script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <OnboardingGuard>
              <Navbar />
              <Vectorall />
              <div className="relative z-10">{children}</div>
              <Footer />
            </OnboardingGuard>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

