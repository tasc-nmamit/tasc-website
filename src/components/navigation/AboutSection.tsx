"use client";

import Image from "next/image";

export default function AboutSection() {
  return (
    <div className="w-[100vw]">
      <div className="mx-6 flex space-y-10 rounded-xl px-6 py-10 md:mx-16 md:px-14">
        <div className="flex flex-col">
          <h1 className="text-center text-4xl font-extrabold lg:text-5xl">
            About Us
          </h1>
          <div className="items-center space-y-10 md:grid md:grid-cols-2 md:gap-x-10">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold lg:text-3xl">Mission</h3>
              <p className="text-md max-w-4xl pb-6 lg:text-xl">
                To provide excellent academic environment to students for
                continuous improvement in Computer Science, Artificial
                Intelligence and Machine learning specialization by imparting
                education with innovation, skills, and positive attitude to make
                them competent engineers and leaders to solve the real-world
                problems to inculcate values of professional ethics, leadership
                qualities and lifelong learning.
              </p>

              <h3 className="text-3xl font-bold">Vision</h3>
              <p className="text-md max-w-4xl pb-6 lg:text-xl">
                To be a center of excellence in Artificial Intelligence and
                Machine Learning Engineering education and research, to produce
                comprehensively trained, technically skilled, ethically strong,
                innovative engineers to excel globally, take future challenges
                and contribute to social welfare..
              </p>

              <h3 className="text-3xl font-bold">Values</h3>
              <p className="text-md max-w-4xl pb-6 lg:text-xl">
                Our values include creativity, collaboration, inclusivity,
                ethics, and excellence in everything we do.
              </p>

              <h3 className="text-3xl font-bold">Belief</h3>
              <p className="text-md max-w-4xl pb-6 lg:text-xl">
                We believe in the potential of AI to improve our world, and we
                strive to use it responsibly and ethically.
              </p>
            </div>
            <div>
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/AboutBanner.jpeg?alt=media&token=a258cf9b-be51-4160-a773-7917daa50cbc&_gl=1*1h5cmm8*_ga*MTE2MzE3ODExMC4xNjk1Mzg4Nzkx*_ga_CW55HF8NVT*MTY5NjIxODM2NC4xOS4xLjE2OTYyMTg1NTYuNjAuMC4w"
                alt="AboutBanner"
                width={800}
                height={600}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
