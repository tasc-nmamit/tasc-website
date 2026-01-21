"use client";

import Link from "next/link";
import Image from "next/image";
import AboutSection from "@/components/navigation/AboutSection";

export default function Home() {
  return (
    <main className="min-h-dvh overflow-x-hidden">
      <div className="relative hidden min-h-screen w-full items-center justify-center md:flex">
        <div className="z-30 flex translate-y-[-10%] flex-col items-center md:flex-row-reverse">
          <Image
            src="/CenterGraphic.png"
            alt="Center Graphic"
            width={600}
            height={600}
            className="brightness-90 md:scale-75 lg:scale-90"
            priority
          />
          <div className="z-50 flex flex-col md:pl-6">
            <div className="istok_web bg-linear-to-r from-brand to-[#C850AF] to-22% bg-clip-text md:text-6xl lg:text-[5rem] font-bold">
              <p className="text-transparent">Turing</p>
              <p className="text-transparent">Artificial Intelligence</p>
              <p className="text-transparent">Students</p>
              <p className="text-transparent">Committee</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-36 hidden w-full justify-center text-center md:flex">
          <p className="text-xl">
            Welcome to the official website of TASC,
            <br />
            <span className="font-bold text-brand dark:text-primary">
              Department of Artificial Intelligence and Machine Learning
            </span>
          </p>
        </div>

        <div className="absolute bottom-10 hidden w-full animate-bounce items-center justify-center bg-transparent md:flex">
          <Link href="/#about">
            <svg
              width="50"
              height="50"
              viewBox="0 0 74 74"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="hidden dark:block"
            >
              <path
                d="M65.2726 18.5L69.375 22.1445L37 55.5L4.625 22.1445L8.72738 18.5L37 47.6283L65.2726 18.5Z"
                fill="white"
              />
            </svg>
            <svg
              width="50"
              height="50"
              viewBox="0 0 74 74"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block dark:hidden"
            >
              <path
                d="M65.2726 18.5L69.375 22.1445L37 55.5L4.625 22.1445L8.72738 18.5L37 47.6283L65.2726 18.5Z"
                fill="black"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile View */}
      <div className="flex min-h-dvh grow flex-col md:hidden pt-20">
        <div className="z-0 flex flex-col">
          <div className="flex w-full translate-y-[-10%] flex-col items-center px-2">
            <Image
              src="/CenterGraphic.png"
              alt="Center Graphic"
              width={300}
              height={300}
              className="translate-y-[10dvh] scale-50 brightness-90 md:translate-y-[12dvh]"
            />
            <div className="z-50 flex w-full flex-col items-center justify-center bg-linear-to-r from-brand to-[#C850AF] to-20% bg-clip-text md:ml-16 md:py-10">
              <div className="istok_web mt-10 pl-[5vw] text-left text-5xl sm:mt-4 sm:text-5xl font-bold">
                <p className="text-transparent">Turing</p>
                <p className="text-transparent">Artificial Intelligence</p>
                <p className="text-transparent">Students</p>
                <p className="text-transparent">Committee</p>
              </div>
              <div className="w-full text-center">
                <p className="pt-6 text-center text-lg">
                  Browse for glimpses of our 24 hour hackathon!
                </p>
                <div className="flex w-full justify-center pt-4">
                  <Link href="/snh2023">
                    <button className="rounded-full bg-accent text-accent-foreground px-4 py-2 font-semibold">
                      Hackathon
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-center px-2 mt-10">
            <p className="text-center text-sm">
              Welcome to the official website of TASC,
              <br />{" "}
              <span className="font-bold">
                Department of Artifiteamcial Intelligence and Machine Learning
              </span>
            </p>
          </div>

          <div className="mt-6 flex w-full animate-bounce justify-center">
            <Link href="/#about">
              <svg
                width="30"
                height="30"
                viewBox="0 0 74 74"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="hidden dark:block"
              >
                <path
                  d="M65.2726 18.5L69.375 22.1445L37 55.5L4.625 22.1445L8.72738 18.5L37 47.6283L65.2726 18.5Z"
                  fill="white"
                />
              </svg>
              <svg
                width="30"
                height="30"
                viewBox="0 0 74 74"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="block dark:hidden"
              >
                <path
                  d="M65.2726 18.5L69.375 22.1445L37 55.5L4.625 22.1445L8.72738 18.5L37 47.6283L65.2726 18.5Z"
                  fill="black"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <section id="about" className="flex max-w-[100vw] py-10 justify-center">
        <AboutSection />
      </section>
    </main>
  );
}
