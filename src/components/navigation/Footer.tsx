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
    <>
      <hr className="border-border" />
      <div className="flex w-full flex-col items-center justify-between px-4 py-3 md:flex md:px-16 md:py-6">
        <div className="flex flex-row flex-wrap content-center items-center justify-center py-5">
          <div className="px-5">
            <Image
              width={84} // approx based on w-21 (21 * 4 = 84)
              height={28}
              className="md:w-21 w-15 h-5 md:h-7 object-contain"
              src="https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/TASCLogo.png?alt=media&token=885899c8-a49c-46d7-9d22-ebc5507964db&_gl=1*1sdhvuu*_ga*MTE2MzE3ODExMC4xNjk1Mzg4Nzkx*_ga_CW55HF8NVT*MTY5NjIxODM2NC4xOS4xLjE2OTYyMTg2ODMuNjAuMC4w"
              alt="TASC Logo"
            />
          </div>
          <div className="md:text-md py-3 text-center text-sm lg:text-lg">
            Turing Artificial Intelligence Students Committee
          </div>
        </div>

        <ul className="flex space-x-8 text-black dark:text-white">
          <a
            href="https://www.instagram.com/tasc_nmamit/"
            target="_blank"
            className="duration-200 hover:scale-110"
            rel="noopener noreferrer"
          >
            <InstagramIcon height="2rem" />
          </a>
          <a
            href="https://github.com/tasc-nmamit"
            target="_blank"
            className="duration-200 hover:scale-110"
            rel="noopener noreferrer"
          >
            <GithubIcon height="2rem" />
          </a>
          <a
            href="https://www.linkedin.com/company/tasc-aiml/"
            target="_blank"
            className="duration-200 hover:scale-110"
            rel="noopener noreferrer"
          >
            <LinkedinIcon height="2rem" />
          </a>
        </ul>

        <ul className="flex flex-wrap justify-center py-5">
          {NAVITEM.map((item) => (
            <Link key={item.title} href={item.href}>
              <li
                className={cn(
                  "text-md px-2 md:px-5 hover:underline",
                  pathname.split("/")[1] === item.title.toLowerCase() ||
                    (pathname === "/" && item.title === "Home")
                    ? "underline"
                    : "",
                )}
              >
                <span>{item.title}</span>
              </li>
            </Link>
          ))}
        </ul>

        <a
          href="https://github.com/tasc-nmamit"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="md:text-md text-sm">
            With regards from technical team :)
          </span>
        </a>

        <div>
          <h1 className="pt-3 text-xl">© TASC 2026</h1>
        </div>
      </div>
    </>
  );
}
