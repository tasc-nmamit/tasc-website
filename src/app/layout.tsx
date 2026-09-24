import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import SessionProvider from "@/components/auth/SessionProvider";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import OnboardingGuard from "@/components/auth/OnboardingGuard";
import Script from "next/script";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TASC - NMAMIT",
  description: "Turing Artificial Intelligence Students Committee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-valley">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Valley+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        {/* Script for iconify-icon */}
        <Script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`font-valley ${jetbrainsMono.variable} bg-background text-foreground min-h-screen flex flex-col`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <OnboardingGuard>
              <Navbar />
              {/* <Vectorall /> */}
              <div className="relative z-10 flex-1">{children}</div>
              <Footer />
            </OnboardingGuard>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
