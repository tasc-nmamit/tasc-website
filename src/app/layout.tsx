import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import Vectorall from "@/components/background/Vectorall";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Script for iconify-icon */}
        <script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          async
        ></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <Vectorall />
          <div className="relative z-10">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
