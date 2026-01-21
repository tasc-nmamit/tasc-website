"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function VectorBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const themeClass = isDark
    ? "fill-[url(#paint0_linear_9_563)]"
    : "fill-[url(#paint0_linear_light)]";

  return (
    <div className="fixed inset-0 -z-50 w-full overflow-hidden pointer-events-none">
      <div className="min-h-dvh grow flex-col relative w-full h-full">
        {/* Bottom Left */}
        <div className="absolute bottom-0 -left-4 z-0 hidden md:flex w-72">
          <svg
            width="399"
            height="324"
            viewBox="0 0 399 324"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M323.123 398.921C339.853 385.591 349.083 365.561 347.543 345.961C345.363 318.311 323.913 298.681 296.133 287.031C285.963 282.761 275.283 279.291 265.763 274.011C242.783 261.261 243.853 241.311 233.353 221.861C205.083 169.461 126.203 207.671 77.6133 195.391C45.9933 187.401 23.8532 161.441 22.7432 133.271C22.6632 131.251 22.6533 129.121 21.4833 127.361C20.6733 126.151 19.3832 125.241 18.0732 124.431C-2.37675 111.731 -33.1167 116.431 -51.3567 130.061C-71.5267 145.141 -80.7567 168.321 -86.2167 190.861C-90.5767 208.851 -93.0767 227.561 -88.7467 245.561C-77.0067 294.421 -19.7867 325.081 4.07326 370.541C9.22326 380.361 12.7833 390.811 18.8933 400.211C34.4333 424.111 64.4633 438.211 94.4232 447.311C131.363 458.531 172.843 463.891 209.283 451.521C232.623 443.601 252.303 428.941 275.803 421.381C292.173 416.091 310.293 409.141 323.123 398.921Z"
              className={themeClass}
            />
            <defs>
              <linearGradient
                id="paint0_linear_9_563"
                x1="59.8671"
                y1="94.2521"
                x2="-2.14419"
                y2="39.901"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.1031" stopColor="#2F3E41" />
                <stop offset="0.3506" stopColor="#273132" />
                <stop offset="0.714" stopColor="#1E2422" />
                <stop offset="0.9948" stopColor="#1B1F1C" />
              </linearGradient>
              <linearGradient
                id="paint0_linear_light"
                x1="59.8671"
                y1="94.2521"
                x2="-2.14419"
                y2="39.901"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.1031" stopColor="#FFF4E6" />
                <stop offset="0.3506" stopColor="#FFE8CC" />
                <stop offset="0.714" stopColor="#FFD1A3" />
                <stop offset="0.9948" stopColor="#FFBC7A" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Top Left */}
        <div className="absolute left-0 top-0 hidden md:block w-40">
          <svg
            width="166"
            height="218"
            viewBox="0 0 166 218"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-23.2465 157.357C-15.4557 163.612 -5.38138 165.763 3.39185 163.05C15.7676 159.219 22.5115 147.431 24.9696 133.577C25.8718 128.505 26.3571 123.282 27.7862 118.402C31.2381 106.622 40.4386 105.063 48.2241 98.2824C69.2008 80.0236 43.6954 48.0006 44.3053 24.5993C44.7016 9.37091 54.2591 -3.38155 66.9816 -6.77789C67.8939 -7.02162 68.8635 -7.24474 69.5454 -7.95848C70.0136 -8.45173 70.2959 -9.13293 70.5306 -9.81298C74.2193 -20.4347 68.9234 -33.9599 60.8409 -40.8729C51.8996 -48.5165 40.39 -50.3439 29.5588 -50.519C20.9138 -50.6598 12.1315 -49.8791 4.37365 -46.0591C-16.686 -35.6959 -24.7857 -6.47602 -43.0524 9.06111C-46.9987 12.4155 -51.3952 15.11 -55.0516 18.8587C-64.3477 28.3923 -67.6914 43.5231 -68.7638 58.1089C-70.0861 76.0929 -68.2722 95.5443 -58.8963 110.88C-52.8924 120.703 -44.1928 128.166 -38.3366 138.099C-34.2463 145.015 -29.22 152.559 -23.2465 157.357Z"
              className={themeClass}
            />
          </svg>
        </div>

        {/* Top Right */}
        <div className="absolute right-0 top-0 z-0 hidden md:block">
          <svg
            width="307"
            height="273"
            viewBox="0 0 307 273"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.7">
              <path
                opacity="0.7"
                d="M1 -0.490005L254.53 -230"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              {/* Simplified pattern for Top Right because it's mostly strokes */}
              <path
                opacity="0.7"
                d="M3.02979 18.23L272.5 -226.1"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
            </g>
          </svg>
        </div>

        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0">
          <svg
            width="164"
            height="184"
            viewBox="0 0 164 184"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.70273 242.095C-2.31727 220.515 2.7027 197.045 15.8627 179.245C30.5327 159.405 54.1127 151.055 74.8427 139.345C84.6827 133.775 94.2627 127.235 101.633 118.545C105.303 114.215 108.313 109.405 110.543 104.185C112.893 98.6551 114.403 92.8251 115.623 86.9651C118.083 75.0751 119.513 62.9151 124.213 51.6151C128.543 41.2051 135.073 31.7151 143.193 23.8951C160.573 7.14513 185.043 -0.974894 209.013 1.68511C212.063 2.02511 215.113 2.54514 218.123 3.15514C218.693 3.27514 218.943 2.41513 218.363 2.27513C194.923 -3.68487 168.623 2.3551 149.543 16.9951C140.743 23.7551 133.313 32.2651 127.803 41.8951C125.013 46.7551 122.723 51.9051 120.983 57.2351C119.073 63.1151 117.863 69.1851 116.743 75.2551C114.473 87.5451 112.493 100.265 105.813 111.075C99.6027 121.125 90.2227 128.745 80.3127 134.945C59.9327 147.695 35.6127 155.135 19.2727 173.605C4.72267 190.055 -2.24733 212.905 0.642667 234.675C0.982667 237.235 1.48269 239.765 2.10269 242.265C2.18269 242.655 2.79273 242.485 2.70273 242.095Z"
              fill="url(#paint0_linear_35_9)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_35_9"
                x1="-0.017233"
                y1="121.236"
                x2="218.446"
                y2="121.236"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#5C5A44" />
                <stop offset="0.6103" stopColor="#3F4541" />
                <stop offset="1" stopColor="#313C40" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
