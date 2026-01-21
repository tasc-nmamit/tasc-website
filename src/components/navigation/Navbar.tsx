"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { NAVITEM } from "@/lib/data/NavbarItems";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [y, setY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="z-50">
      <div className="fixed top-0 z-50 hidden w-full lg:grid">
        <div
          className={cn(
            "flex items-center justify-center px-6 py-2 md:px-10 md:py-6 transition-all duration-150 ease-out",
            y > 0 ? "backdrop-blur-xl" : "",
          )}
        >
          <div className="absolute left-6 flex items-center gap-x-2">
            <Link href="/">
              <Image
                src="/nitte-nmamit-logo.png"
                alt="TASC Logo"
                width={300}
                height={100}
                className="dark:hidden w-28 md:w-56 lg:w-80 h-auto"
              />
              <Image
                src="/NMAMITLogo.png"
                alt="TASC Logo"
                width={300}
                height={100}
                className="hidden dark:block w-28 md:w-56 lg:w-80 h-auto"
              />
            </Link>
          </div>
          <ul className="flex flex-wrap items-center space-x-6 md:text-lg">
            {NAVITEM.map((nav) => (
              <li
                key={nav.title}
                className="hover:dark:drop-shadow-[0_0_0.3rem_#ffffff] hover:scale-110 transition-transform"
              >
                <Link href={nav.href} className="scroll-smooth">
                  {nav.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="absolute right-10 flex w-28 justify-center gap-2 items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "fixed z-50 flex w-full pt-4 lg:hidden transition-all duration-150 ease-out pb-4",
          y > 0 ? "backdrop-blur-xl" : "",
        )}
      >
        <div className="flex pl-4">
          <div>
            <Link href="/" className="block">
              <Image
                src="/nitte-nmamit-logo.png"
                alt="logo"
                width={240}
                height={80}
                className="dark:hidden w-60 h-auto"
              />
              <Image
                src="/NMAMITLogo.png"
                alt="logo"
                width={240}
                height={80}
                className="hidden dark:block w-60 h-auto"
              />
            </Link>
          </div>
        </div>
        <nav className="ml-auto pr-4">
          <div id="menuToggle" className="relative z-50 select-none">
            <input
              type="checkbox"
              className="absolute w-10 h-8 cursor-pointer opacity-0 z-20"
              checked={mobileMenuOpen}
              onChange={(e) => setMobileMenuOpen(e.target.checked)}
            />
            <div className="burger-icon cursor-pointer z-10 relative">
              <span
                className={cn(
                  "block w-[33px] h-[4px] mb-[5px] relative rounded-[3px] z-10 transform origin-[6px_6px] transition-transform duration-500 bg-black dark:bg-white",
                  mobileMenuOpen &&
                    "rotate-45 translate-x-[-2px] -translate-y-px",
                )}
              ></span>
              <span
                className={cn(
                  "block w-[33px] h-[4px] mb-[5px] relative rounded-[3px] z-10 transform origin-[4px_0px] transition-transform duration-500 bg-black dark:bg-white",
                  mobileMenuOpen && "opacity-0 scale-0",
                )}
              ></span>
              <span
                className={cn(
                  "block w-[33px] h-[4px] mb-[5px] relative rounded-[3px] z-10 transform origin-[4px_0px] transition-transform duration-500 bg-black dark:bg-white",
                  mobileMenuOpen && "-rotate-45 translate-x-0 -translate-y-px",
                )}
              ></span>
            </div>

            <ul
              className={cn(
                "flex flex-col absolute w-[70vw] pt-20 pr-8 z-0 top-0 -right-4 h-screen list-none bg-background text-foreground text-right drop-shadow-xl transform origin-[0%_0%] transition-transform duration-500",
                mobileMenuOpen ? "translate-x-0" : "translate-x-[120%]",
              )}
            >
              {NAVITEM.map((nav) => (
                <Link
                  key={nav.title}
                  href={nav.href}
                  className="mt-10 text-2xl hover:text-gray-500 transition-colors"
                  onClick={closeMenu}
                >
                  {nav.title}
                </Link>
              ))}
              <div className="mt-6 flex flex-col items-end gap-y-4 text-2xl pr-0">
                <div className="max-w-sm">
                  <ThemeToggle />
                </div>
              </div>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
