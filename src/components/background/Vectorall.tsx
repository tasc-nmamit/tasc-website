"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Vectorall() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const themeClass = isDark ? "svg-gradient-dark" : "svg-gradient-light";

  return (
    <div className="fixed -z-50 w-full overflow-x-hidden">
      <div className="min-h-dvh grow flex-col">
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
            <g opacity="0.7">
              <g opacity="0.7">
                <path
                  opacity="0.7"
                  d="M-253 298.519L33.3317 1"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-250.706 322.786L53.6192 6.05569"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-241.515 339.677L71.4434 13.7558"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-228.578 352.589L91.3679 19.2004"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-218.505 368.546L111.474 24.4505"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-206.656 382.611L132.811 28.3913"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-194.899 396.78L149.145 37.66"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-183.128 410.923L169.134 43.0397"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-170.982 424.677L185.39 52.3992"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-160.274 439.961L198.937 64.6624"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-148.114 453.689L214.208 75.0719"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-135.203 466.626L229.245 85.7276"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-124.34 481.728L227.249 114.571"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
              </g>
              <g opacity="0.7">
                <path
                  opacity="0.7"
                  d="M-84.2318 467.287L202.1 169.768"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-81.9373 491.541L222.387 174.824"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-72.7466 508.445L240.199 182.524"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-59.822 521.357L260.136 187.956"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-49.7369 537.302L280.229 193.206"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-37.8883 551.38L301.58 197.147"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-26.1436 565.548L317.913 206.428"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-14.3602 579.691L337.89 211.808"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M-2.22681 593.445L354.145 221.167"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M8.49384 608.716L367.692 233.418"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M20.6405 622.457L382.963 243.84"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M33.5519 635.381L398 254.496"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M44.4282 650.496L396.004 283.339"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
              </g>
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_106_7"
                x1="230.411"
                y1="195.648"
                x2="87.7267"
                y2="299.604"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.1031" stopColor="#2F3E41" />
                <stop offset="0.3506" stopColor="#273132" />
                <stop offset="0.714" stopColor="#1E2422" />
                <stop offset="0.9948" stopColor="#1B1F1C" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
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
          <path
            d="M43.0525 216.435C39.9125 209.245 40.6125 201.095 43.6425 193.995C46.7825 186.615 52.3025 180.705 58.7525 176.045C72.2425 166.305 88.7225 161.965 102.503 152.715C109.193 148.225 114.833 142.565 119.103 135.725C123.283 129.025 126.183 121.595 128.423 114.035C133.393 97.2551 135.012 79.4951 141.902 63.2851C147.662 49.7351 158.193 36.7151 172.953 32.7551C174.663 32.2951 176.403 31.9251 178.163 31.6851C178.543 31.6351 178.453 30.9951 178.073 31.0151C163.163 32.0451 151.023 43.8751 144.173 56.3651C135.593 72.0151 133.563 90.1151 129.293 107.175C127.303 115.115 124.822 122.985 121.082 130.295C117.302 137.685 112.203 144.225 105.623 149.325C92.1325 159.785 75.1525 164.125 60.9625 173.415C54.3525 177.745 48.3325 183.175 44.4925 190.165C40.9325 196.635 39.0725 204.385 40.7025 211.695C41.0925 213.455 41.7025 215.145 42.4925 216.775C42.6625 217.175 43.2225 216.825 43.0525 216.435Z"
            fill="url(#paint1_linear_35_9)"
          />
          <path
            d="M167.483 71.6952C158.813 74.1652 151.813 80.7152 146.753 87.9552C141.273 95.8152 137.783 104.825 135.243 114.015C132.273 124.735 130.343 135.745 126.803 146.305C125.103 151.375 123.053 156.375 120.283 160.955C117.823 165.015 114.823 168.745 111.363 171.995C104.643 178.295 95.8826 182.775 86.4926 182.455C85.3326 182.415 84.1726 182.305 83.0226 182.135C82.4826 182.055 82.2326 182.855 82.7926 182.975C91.9326 184.925 101.223 181.545 108.473 176.035C112.273 173.145 115.613 169.695 118.463 165.865C121.483 161.805 123.813 157.345 125.733 152.675C130.013 142.275 132.163 131.175 134.823 120.295C137.183 110.605 140.073 101.045 145.153 92.3952C149.793 84.4952 156.123 77.6652 164.463 73.6652C165.503 73.1652 166.563 72.7152 167.633 72.3052C168.023 72.1552 167.883 71.5752 167.483 71.6952Z"
            fill="url(#paint2_linear_35_9)"
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
            <linearGradient
              id="paint1_linear_35_9"
              x1="40.0865"
              y1="123.984"
              x2="178.153"
              y2="123.984"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#5C5A44" />
              <stop offset="0.6103" stopColor="#3F4541" />
              <stop offset="1" stopColor="#313C40" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_35_9"
              x1="82.8286"
              y1="127.604"
              x2="167.721"
              y2="127.604"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#5C5A44" />
              <stop offset="0.6103" stopColor="#3F4541" />
              <stop offset="1" stopColor="#313C40" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute right-0 top-0 z-0 hidden md:block">
        <svg
          width="307"
          height="273"
          viewBox="0 0 307 273"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.7">
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
              <path
                opacity="0.7"
                d="M11.1699 31.26L288.27 -220.16"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M22.6201 41.22L305.92 -215.97"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M31.5498 53.53L323.72 -211.91"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M42.04 64.38L342.62 -208.88"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M52.4399 75.31L357.08 -201.72"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M62.8701 86.22L374.78 -197.57"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M73.6201 96.83L389.17 -190.35"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M83.1001 108.61L401.16 -180.89"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M93.8701 119.21L414.69 -172.86"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M105.3 129.19L428 -164.64"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M114.93 140.84L426.23 -142.39"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
            </g>
            <g opacity="0.5">
              <path
                opacity="0.7"
                d="M150.43 129.7L403.97 -99.81"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M152.46 148.41L421.93 -95.91"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M160.6 161.45L437.71 -89.98"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M172.05 171.41L455.35 -85.78"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M180.98 183.71L473.15 -81.73"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M191.47 194.57L492.05 -78.69"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M201.87 205.49L506.51 -71.53"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M212.3 216.41L524.21 -67.38"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M223.05 227.02L538.6 -60.16"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M232.53 238.8L550.59 -50.71"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M243.3 249.4L564.12 -42.68"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M254.73 259.37L577.44 -34.45"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M264.36 271.03L575.66 -12.2"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
            </g>
          </g>
        </svg>
      </div>
      <div className="absolute top-0 z-0 mx-auto flex h-dvh w-screen items-center justify-center opacity-75">
        <svg
          width="735"
          height="668"
          viewBox="0 0 735 668"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="md:scale-75 lg:scale-100"
        >
          <g opacity="0.5">
            <path
              d="M226.113 466.897C226.113 468.015 225.206 468.923 224.087 468.923C222.969 468.923 222.061 468.015 222.061 466.897C222.061 465.779 222.969 464.871 224.087 464.871C225.206 464.884 226.113 465.779 226.113 466.897Z"
              fill="white"
            />
            <path
              d="M389.454 16.9225C390.573 16.9225 391.48 16.0155 391.48 14.8965C391.48 13.7776 390.573 12.8706 389.454 12.8706C388.335 12.8706 387.428 13.7776 387.428 14.8965C387.428 16.0155 388.335 16.9225 389.454 16.9225Z"
              fill="white"
            />
            <g opacity="0.7">
              <path
                opacity="0.7"
                d="M73.074 308.898L363.655 6.96371"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M75.4026 333.526L384.244 12.0944"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M84.7297 350.667L402.319 19.9088"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M97.859 363.77L422.553 25.4342"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M108.081 379.965L442.957 30.7622"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M120.105 394.239L464.611 34.7615"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M132.037 408.618L481.187 44.1678"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M143.983 422.971L501.473 49.6273"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M156.296 436.929L517.97 59.1257"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M167.176 452.439L531.705 71.571"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M179.516 466.371L547.203 82.1349"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M192.606 479.5L562.476 92.9488"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M203.644 494.826L560.437 122.22"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
            </g>
            <g opacity="0.7">
              <g opacity="0.7">
                <path
                  opacity="0.7"
                  d="M244.334 480.171L534.928 178.237"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M246.663 504.798L555.517 183.367"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M256.003 521.94L573.593 191.182"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M269.119 535.043L593.813 196.694"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M279.354 551.225L614.217 202.022"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M291.379 565.512L635.872 206.021"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M303.297 579.891L652.447 215.441"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M315.243 594.243L672.733 220.9"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M327.57 608.202L689.231 230.399"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M338.436 623.699L702.978 242.831"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M350.776 637.644L718.476 253.408"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M363.879 650.76L733.736 264.222"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
                <path
                  opacity="0.7"
                  d="M374.917 666.099L731.71 293.493"
                  stroke="#969696"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="0.3 0.3"
                />
              </g>
            </g>
            <path
              d="M494.909 133.337C498.549 133.337 501.5 130.386 501.5 126.746C501.5 123.106 498.549 120.155 494.909 120.155C491.269 120.155 488.318 123.106 488.318 126.746C488.318 130.386 491.269 133.337 494.909 133.337Z"
              fill="url(#paint0_linear_35_79)"
            />
            <path
              d="M494.909 138.033C501.143 138.033 506.196 132.98 506.196 126.746C506.196 120.512 501.143 115.458 494.909 115.458C488.675 115.458 483.621 120.512 483.621 126.746C483.621 132.98 488.675 138.033 494.909 138.033Z"
              stroke="url(#paint1_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M351.697 451.558C351.697 455.965 348.118 459.543 343.711 459.543C339.304 459.543 335.726 455.965 335.726 451.558C335.726 447.151 339.304 443.572 343.711 443.572C348.118 443.572 351.697 447.137 351.697 451.558Z"
              stroke="url(#paint2_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M526.746 162.332C535.435 162.332 542.48 155.287 542.48 146.597C542.48 137.908 535.435 130.863 526.746 130.863C518.056 130.863 511.011 137.908 511.011 146.597C511.011 155.287 518.056 162.332 526.746 162.332Z"
              fill="url(#paint3_linear_35_79)"
            />
            <path
              d="M82.6645 317.12C82.6645 321.146 79.4019 324.409 75.3762 324.409C71.3506 324.409 68.088 321.146 68.088 317.12C68.088 313.095 71.3506 309.832 75.3762 309.832C79.4019 309.832 82.6645 313.095 82.6645 317.12Z"
              fill="url(#paint4_linear_35_79)"
            />
            <path
              d="M447.64 108.604L459.375 94.6196"
              stroke="url(#paint5_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M451.245 111.617L469.676 89.6599"
              stroke="url(#paint6_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M447.64 123.233L466.571 100.658"
              stroke="url(#paint7_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M89.6502 271.418L101.372 257.433"
              stroke="url(#paint8_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M93.2417 274.444L111.673 252.474"
              stroke="url(#paint9_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M89.6502 286.047L108.568 263.472"
              stroke="url(#paint10_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M480.845 349.681L495.817 331.815"
              stroke="url(#paint11_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M485.437 353.535L508.972 325.474"
              stroke="url(#paint12_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M480.845 368.362L505.025 339.538"
              stroke="url(#paint13_linear_35_79)"
              strokeMiterlimit="10"
            />
            <g opacity="0.5">
              <path
                opacity="0.5"
                d="M456.56 37.8136L438.984 57.4023"
                stroke="url(#paint14_linear_35_79)"
                strokeMiterlimit="10"
              />
              <path
                opacity="0.5"
                d="M461.599 42.3392L433.998 73.1101"
                stroke="url(#paint15_linear_35_79)"
                strokeMiterlimit="10"
              />
              <path
                opacity="0.5"
                d="M477.438 34.8405L449.075 66.4534"
                stroke="url(#paint16_linear_35_79)"
                strokeMiterlimit="10"
              />
            </g>
            <path
              d="M82.6646 341.182L104.963 314.595"
              stroke="url(#paint17_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M89.5054 346.918L124.539 305.162"
              stroke="url(#paint18_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M82.6646 368.993L118.645 326.079"
              stroke="url(#paint19_linear_35_79)"
              strokeMiterlimit="10"
            />
            <path
              d="M124.539 283.521C126.958 283.521 128.92 281.56 128.92 279.14C128.92 276.721 126.958 274.759 124.539 274.759C122.119 274.759 120.158 276.721 120.158 279.14C120.158 281.56 122.119 283.521 124.539 283.521Z"
              fill="white"
            />
            <path
              d="M127.42 371.124C127.42 373.545 125.46 375.505 123.039 375.505C120.618 375.505 118.658 373.545 118.658 371.124C118.658 368.704 120.618 366.743 123.039 366.743C125.46 366.743 127.42 368.704 127.42 371.124Z"
              fill="white"
            />
            <path
              d="M104.477 158.661C104.477 159.779 103.569 160.687 102.451 160.687C101.332 160.687 100.425 159.779 100.425 158.661C100.425 157.543 101.332 156.635 102.451 156.635C103.569 156.648 104.477 157.543 104.477 158.661Z"
              fill="white"
            />
            <path
              d="M492.935 217.217C494.054 217.217 494.961 216.31 494.961 215.191C494.961 214.072 494.054 213.165 492.935 213.165C491.816 213.165 490.909 214.072 490.909 215.191C490.909 216.31 491.816 217.217 492.935 217.217Z"
              fill="white"
            />
            <path
              d="M513.024 397.541C513.024 398.659 512.116 399.567 510.998 399.567C509.88 399.567 508.972 398.659 508.972 397.541C508.972 396.422 509.88 395.515 510.998 395.515C512.116 395.528 513.024 396.422 513.024 397.541Z"
              fill="white"
            />
            <path
              d="M82.6645 131.126C85.0839 131.126 87.0453 129.165 87.0453 126.746C87.0453 124.326 85.0839 122.365 82.6645 122.365C80.245 122.365 78.2836 124.326 78.2836 126.746C78.2836 129.165 80.245 131.126 82.6645 131.126Z"
              fill="white"
            />
            <path
              d="M201.946 418.05C201.946 420.471 199.986 422.431 197.565 422.431C195.145 422.431 193.185 420.471 193.185 418.05C193.185 415.63 195.145 413.67 197.565 413.67C199.986 413.67 201.946 415.63 201.946 418.05Z"
              fill="white"
            />
            <path
              d="M485.226 415.406C485.226 417.827 483.266 419.787 480.845 419.787C478.425 419.787 476.464 417.827 476.464 415.406C476.464 412.985 478.425 411.025 480.845 411.025C483.266 411.025 485.226 412.985 485.226 415.406Z"
              fill="white"
            />
            <path
              d="M560.227 286.047C560.227 288.468 558.266 290.428 555.846 290.428C553.425 290.428 551.465 288.468 551.465 286.047C551.465 283.626 553.425 281.666 555.846 281.666C558.266 281.653 560.227 283.626 560.227 286.047Z"
              fill="white"
            />
            <path
              d="M33.6598 225.978C36.0792 225.978 38.0406 224.017 38.0406 221.598C38.0406 219.178 36.0792 217.217 33.6598 217.217C31.2403 217.217 29.279 219.178 29.279 221.598C29.279 224.017 31.2403 225.978 33.6598 225.978Z"
              fill="white"
            />
            <path
              d="M157.559 422.523L169.662 427.443L175.109 408.631L157.559 422.523Z"
              fill="#FF7E3D"
            />
            <path
              d="M124.539 406.815L134.379 431.943L172.149 398.869L124.539 406.815Z"
              fill="url(#paint20_linear_35_79)"
            />
            <path
              d="M550.873 199.943L545.597 226.413L502.605 200.483L550.873 199.943Z"
              fill="#FF7E3D"
            />
            <path
              d="M116.724 99.2898L100.714 110.512L119.973 120.47L116.724 99.2898Z"
              fill="#FF7E3D"
            />
            <path
              d="M509.077 244.383L490.883 237.24L493.225 258.788L509.077 244.383Z"
              fill="url(#paint21_linear_35_79)"
            />
            <path
              d="M342.357 52.6268C324.662 42.7864 302.745 36.3139 282.643 42.076C267.041 46.5489 255.266 58.2048 246.373 71.3341C236.362 86.1079 229.31 102.671 221.838 118.813C217.26 128.693 212.274 138.191 205.591 146.847C198.408 156.162 189.857 164.423 180.319 171.29C170.452 178.381 159.586 183.92 148.061 187.748C134.919 192.116 121.263 194.536 107.779 197.589C85.6116 202.627 62.1025 210.455 47.5919 229.109C41.1719 237.358 37.3568 247.356 37.1858 257.841C37.0016 268.603 40.4484 279.206 45.8817 288.415C58.2085 309.346 79.6389 321.317 102.003 328.987C125.947 337.196 151.219 341.103 174.662 350.838C186.37 355.706 197.579 362.086 206.867 370.808C216.076 379.465 223.193 390.003 229.521 400.869C241.453 421.392 251.057 443.77 268.251 460.648C276.184 468.436 285.669 474.738 296.378 477.948C307.139 481.158 318.637 481.158 329.569 478.829C380.942 467.871 403.806 416.103 424.513 373.598C436.09 349.839 448.93 326.711 468.44 308.49C487.279 290.901 509.762 277.483 527.324 258.486C542.927 241.62 554.662 220.019 551.912 196.378C549.294 173.908 535.31 154.03 518.155 139.967C498.395 123.772 473.952 114.3 450.219 105.591C437.485 100.921 424.592 96.5666 412.226 90.9623C400.018 85.4238 388.283 78.9381 376.693 72.2287C371.154 69.0188 365.655 65.7562 360.13 62.5199C354.262 59.0863 348.171 56.1131 342.238 52.811C341.778 52.5479 341.357 53.2583 341.817 53.5214C347.737 56.8103 353.368 60.6386 359.209 64.0722C364.734 67.3085 370.233 70.5711 375.772 73.7811C387.099 80.3457 398.571 86.6867 410.476 92.1332C434.091 102.947 459.323 109.722 482.872 120.72C504.828 130.969 525.483 144.729 538.665 165.541C544.716 175.092 549.031 185.88 550.215 197.168C551.452 208.942 549.084 220.716 544.058 231.385C533.534 253.737 513.919 269.681 494.83 284.508C484.7 292.375 474.465 300.176 465.217 309.082C456.271 317.686 448.575 327.408 441.892 337.854C428.263 359.153 418.725 382.675 407.03 405.026C395.61 426.838 381.639 448.677 361.09 462.964C342.107 476.159 317.098 483.236 294.589 475.501C272.434 467.884 257.792 447.716 246.636 428.193C234.796 407.46 224.956 384.714 206.893 368.427C189.054 352.351 165.598 344.747 142.839 338.669C118.79 332.249 93.676 326.987 72.4691 313.279C53.7619 301.189 38.2119 280.272 38.9486 257.131C39.6853 233.688 58.6294 217.204 78.6786 208.363C102.74 197.746 129.736 196.812 154.205 187.393C174.701 179.5 192.869 165.897 206.38 148.61C218.378 133.271 225.14 114.998 233.573 97.6322C240.848 82.648 249.096 67.2822 261.581 55.9421C274.474 44.2204 291.023 39.8001 308.178 42.1944C320.005 43.8389 331.253 48.0487 341.712 53.7451C342.422 54.1003 343.054 53.0215 342.357 52.6268Z"
              fill="url(#paint22_linear_35_79)"
            />
            <g opacity="0.4248">
              <path
                opacity="0.4248"
                d="M349.198 14.5282C328.964 3.28011 303.89 -4.11333 280.907 2.49079C263.081 7.60832 249.623 20.935 239.467 35.9324C228.008 52.8505 219.944 71.8077 211.379 90.2782C206.13 101.605 200.421 112.472 192.777 122.391C184.555 133.06 174.754 142.545 163.809 150.399C152.508 158.53 140.05 164.871 126.854 169.251C111.818 174.251 96.1756 177.013 80.744 180.526C55.3932 186.288 28.4899 195.234 11.8875 216.572C4.55987 225.992 0.218514 237.411 0.0080245 249.382C-0.202465 261.683 3.74422 273.786 9.94052 284.31C24.0302 308.24 48.5391 321.935 74.1136 330.697C101.53 340.09 130.459 344.563 157.297 355.706C170.728 361.284 183.581 368.598 194.224 378.597C204.775 388.503 212.932 400.58 220.18 413.038C233.823 436.521 244.821 462.135 264.502 481.447C273.566 490.354 284.393 497.55 296.641 501.22C308.941 504.891 322.071 504.891 334.568 502.233C393.335 489.696 419.488 430.456 443.181 381.82C456.442 354.614 471.137 328.118 493.501 307.254C515.077 287.126 540.809 271.76 560.911 250.014C578.75 230.728 592.169 206.034 589.011 179C586.012 153.32 570.015 130.587 550.399 114.511C527.798 95.9877 499.829 85.1475 472.689 75.1887C458.1 69.8344 443.326 64.8484 429.157 58.4284C415.186 52.0874 401.741 44.6677 388.48 36.9716C382.139 33.3012 375.838 29.5651 369.523 25.8552C362.814 21.9216 355.867 18.4617 349.079 14.686C348.619 14.4229 348.198 15.1333 348.658 15.3964C355.433 19.1589 361.919 23.4872 368.615 27.4075C374.93 31.1174 381.245 34.8405 387.572 38.524C400.531 46.0359 413.66 53.2977 427.289 59.5335C454.324 71.9129 483.214 79.6616 510.17 92.2516C535.323 104 558.977 119.76 574.093 143.598C581.026 154.543 585.972 166.923 587.327 179.868C588.748 193.379 586.025 206.863 580.25 219.111C568.186 244.712 545.729 262.972 523.878 279.956C512.274 288.967 500.566 297.887 489.976 308.083C479.741 317.923 470.94 329.053 463.296 340.998C447.694 365.388 436.774 392.318 423.382 417.906C410.292 442.901 394.295 467.91 370.746 484.276C348.987 499.391 320.308 507.509 294.51 498.628C269.119 489.893 252.32 466.792 239.532 444.401C225.982 420.681 214.721 394.646 194.053 376.005C173.649 357.613 146.812 348.918 120.777 341.971C93.2419 334.617 64.4705 328.579 40.1984 312.898C18.7548 299.045 0.92892 275.049 1.75772 248.514C2.59968 221.637 24.3196 202.719 47.3025 192.576C74.8503 180.42 105.779 179.355 133.801 168.554C157.231 159.529 178.017 143.953 193.474 124.193C207.209 106.631 214.944 85.7264 224.588 65.8614C232.928 48.6933 242.374 31.1042 256.674 18.1065C271.474 4.66146 290.445 -0.403456 310.139 2.35922C323.689 4.25363 336.568 9.06859 348.54 15.6069C349.276 15.9884 349.908 14.9097 349.198 14.5282Z"
                fill="url(#paint23_linear_35_79)"
              />
            </g>
            <path
              d="M444.418 312.016C459.915 295.269 479.517 283.245 496.435 268.09C511.182 254.881 524.733 238.095 528.048 218.032C531.232 198.667 523.707 179.618 511.564 164.739C498.04 148.163 479.214 137.402 459.823 129.035C438.629 119.892 416.251 113.669 395.466 103.565C374.759 93.4882 355.736 80.4378 335.331 69.8476C319.873 61.8227 300.89 56.9156 283.696 61.8753C270.461 65.6904 260.2 75.215 252.333 86.1868C243.347 98.711 237.019 112.945 230.613 126.877C226.942 134.876 223.351 142.901 218.523 150.294C213.116 158.556 206.577 166.068 199.171 172.593C191.58 179.289 183.055 184.92 173.925 189.274C163.414 194.287 152.113 197.22 140.786 199.733C120.184 204.298 98.7144 207.982 81.4148 220.953C74.1398 226.413 67.8514 233.359 64.1809 241.765C60.5105 250.158 59.7738 259.459 61.6288 268.405C65.6149 287.586 79.6914 303.031 96.307 312.555C133.853 334.091 183.713 330.395 215.97 361.836C231.626 377.097 240.111 397.646 251.03 416.182C260.726 432.653 273.211 449.032 291.457 456.438C310.073 464.003 331.279 460.056 348.421 450.558C366.957 440.297 380.534 423.352 391.19 405.408C393.874 400.882 396.4 396.278 398.82 391.608C401.32 386.806 403.241 381.78 405.595 376.913C405.819 376.439 405.122 376.018 404.885 376.492C402.557 381.32 399.741 385.938 397.268 390.687C394.782 395.462 392.203 400.198 389.44 404.829C384.007 413.946 377.916 422.694 370.707 430.496C356.801 445.546 338.055 456.859 317.282 458.464C307.297 459.241 297.219 457.543 288.234 453.044C279.459 448.65 272.066 442.007 265.804 434.521C252.609 418.748 244.715 399.567 233.98 382.188C228.639 373.545 222.535 365.283 214.971 358.455C207.367 351.588 198.46 346.326 189.12 342.208C169.926 333.736 149.206 329.921 129.183 323.961C109.239 318.028 88.9661 309.543 75.5869 292.914C63.4706 277.851 57.7215 256.855 67.5093 239.081C77.0077 221.834 96.307 212.652 114.514 207.639C135.813 201.772 158.138 199.549 178.003 189.248C194.764 180.565 209.248 167.528 219.667 151.794C228.56 138.375 234.046 122.878 241.256 108.538C247.623 95.8957 254.977 83.0821 265.817 73.7153C277.052 64.0065 291.247 60.336 305.889 62.1778C327.741 64.9142 346.211 77.9514 364.774 88.7917C374.548 94.5012 384.402 100.105 394.597 105.052C404.425 109.827 414.554 113.708 424.816 117.431C462.993 131.337 509.564 147.4 523.93 189.893C527.101 199.259 528.035 209.284 526.18 219.019C524.285 228.938 519.773 238.147 513.971 246.356C501.579 263.932 483.898 276.378 467.269 289.586C458.889 296.242 450.732 303.189 443.536 311.121C442.997 311.727 443.878 312.608 444.418 312.016Z"
              fill="url(#paint24_linear_35_79)"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_35_79"
              x1="488.324"
              y1="126.751"
              x2="501.493"
              y2="126.751"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_35_79"
              x1="482.959"
              y1="126.751"
              x2="506.857"
              y2="126.751"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_35_79"
              x1="335.064"
              y1="451.553"
              x2="352.348"
              y2="451.553"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_35_79"
              x1="511.005"
              y1="146.603"
              x2="542.482"
              y2="146.603"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint4_linear_35_79"
              x1="68.098"
              y1="317.116"
              x2="82.6638"
              y2="317.116"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint5_linear_35_79"
              x1="446.62"
              y1="102.214"
              x2="460.401"
              y2="101.006"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint6_linear_35_79"
              x1="449.899"
              y1="101.564"
              x2="471.021"
              y2="99.7128"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint7_linear_35_79"
              x1="446.274"
              y1="112.894"
              x2="467.949"
              y2="110.994"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint8_linear_35_79"
              x1="89.1403"
              y1="264.426"
              x2="101.876"
              y2="264.426"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.1674" stopColor="#EBC34D" />
              <stop offset="0.4544" stopColor="#B69D4D" />
              <stop offset="0.8604" stopColor="#625F4E" />
              <stop offset="1" stopColor="#44494E" />
            </linearGradient>
            <linearGradient
              id="paint9_linear_35_79"
              x1="92.7416"
              y1="263.454"
              x2="112.174"
              y2="263.454"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.1674" stopColor="#EBC34D" />
              <stop offset="0.4544" stopColor="#B69D4D" />
              <stop offset="0.8604" stopColor="#625F4E" />
              <stop offset="1" stopColor="#44494E" />
            </linearGradient>
            <linearGradient
              id="paint10_linear_35_79"
              x1="89.1403"
              y1="274.761"
              x2="109.078"
              y2="274.761"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.1674" stopColor="#EBC34D" />
              <stop offset="0.4544" stopColor="#B69D4D" />
              <stop offset="0.8604" stopColor="#625F4E" />
              <stop offset="1" stopColor="#44494E" />
            </linearGradient>
            <linearGradient
              id="paint11_linear_35_79"
              x1="479.657"
              y1="341.509"
              x2="497.004"
              y2="339.989"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint12_linear_35_79"
              x1="483.846"
              y1="340.679"
              x2="510.57"
              y2="338.337"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint13_linear_35_79"
              x1="479.215"
              y1="355.152"
              x2="506.646"
              y2="352.748"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint14_linear_35_79"
              x1="447.243"
              y1="37.8576"
              x2="448.3"
              y2="57.3658"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint15_linear_35_79"
              x1="446.982"
              y1="42.6716"
              x2="448.614"
              y2="72.7901"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint16_linear_35_79"
              x1="462.42"
              y1="35.1917"
              x2="464.095"
              y2="66.1097"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint17_linear_35_79"
              x1="81.1296"
              y1="329"
              x2="106.493"
              y2="326.778"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.1674" stopColor="#EBC34D" />
              <stop offset="0.4544" stopColor="#B69D4D" />
              <stop offset="0.8604" stopColor="#625F4E" />
              <stop offset="1" stopColor="#44494E" />
            </linearGradient>
            <linearGradient
              id="paint18_linear_35_79"
              x1="87.3641"
              y1="327.765"
              x2="126.683"
              y2="324.319"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.1674" stopColor="#EBC34D" />
              <stop offset="0.4544" stopColor="#B69D4D" />
              <stop offset="0.8604" stopColor="#625F4E" />
              <stop offset="1" stopColor="#44494E" />
            </linearGradient>
            <linearGradient
              id="paint19_linear_35_79"
              x1="80.4721"
              y1="349.304"
              x2="120.843"
              y2="345.766"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.1674" stopColor="#EBC34D" />
              <stop offset="0.4544" stopColor="#B69D4D" />
              <stop offset="0.8604" stopColor="#625F4E" />
              <stop offset="1" stopColor="#44494E" />
            </linearGradient>
            <linearGradient
              id="paint20_linear_35_79"
              x1="124.537"
              y1="415.407"
              x2="172.149"
              y2="415.407"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#FFBE56" />
              <stop offset="1" stopColor="#FFB45A" />
            </linearGradient>
            <linearGradient
              id="paint21_linear_35_79"
              x1="488.665"
              y1="239.54"
              x2="501.66"
              y2="252.073"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.7154" stopColor="#F6BE56" />
              <stop offset="1" stopColor="#F2B45A" />
            </linearGradient>
            <linearGradient
              id="paint22_linear_35_79"
              x1="66.3755"
              y1="348.107"
              x2="545.616"
              y2="173.677"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.0277" stopColor="#FFD24D" />
              <stop offset="0.0356" stopColor="#F7CC4C" />
              <stop offset="0.0797" stopColor="#CEAE4A" />
              <stop offset="0.1292" stopColor="#A89348" />
              <stop offset="0.1831" stopColor="#887B45" />
              <stop offset="0.2427" stopColor="#6C6744" />
              <stop offset="0.3099" stopColor="#565742" />
              <stop offset="0.3884" stopColor="#454B41" />
              <stop offset="0.4856" stopColor="#3A4241" />
              <stop offset="0.6218" stopColor="#333D40" />
              <stop offset="1" stopColor="#313C40" />
            </linearGradient>
            <linearGradient
              id="paint23_linear_35_79"
              x1="0.00644584"
              y1="252.063"
              x2="589.482"
              y2="252.063"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#5C5A44" />
              <stop offset="0.6103" stopColor="#3F4541" />
              <stop offset="1" stopColor="#313C40" />
            </linearGradient>
            <linearGradient
              id="paint24_linear_35_79"
              x1="182.489"
              y1="118.927"
              x2="433.363"
              y2="369.801"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#313C40" />
              <stop offset="0.251" stopColor="#333E40" />
              <stop offset="0.397" stopColor="#3C4441" />
              <stop offset="0.5161" stopColor="#4A4E42" />
              <stop offset="0.6208" stopColor="#5E5D43" />
              <stop offset="0.716" stopColor="#786F44" />
              <stop offset="0.8042" stopColor="#988746" />
              <stop offset="0.8873" stopColor="#BDA249" />
              <stop offset="0.964" stopColor="#E8C14C" />
              <stop offset="1" stopColor="#FFD24D" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute left-0 top-0">
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
          <g opacity="0.7">
            <g opacity="0.7">
              <path
                opacity="0.7"
                d="M-36.6122 -115.471L128.341 -15.5254"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-47.4346 -111.936L128.119 -5.76207"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-54.1884 -106.015L126.439 3.15005"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-58.7444 -98.7944L126.003 12.7879"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-64.9824 -92.5672L125.673 22.4884"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-70.1757 -85.7249L126.067 32.6158"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-75.4257 -78.9134L123.52 41.0097"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-80.6625 -72.0986L123.119 50.6703"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-85.6834 -65.1523L120.522 59.0382"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-91.5491 -58.705L116.324 66.4693"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-96.5569 -51.7553L113.148 74.4961"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-101.127 -44.5444L109.835 82.4416"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-106.894 -38.0447L96.4875 84.4915"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
            </g>
            <g opacity="0.7">
              <path
                opacity="0.7"
                d="M-96.1984 -21.2502L68.7547 78.6957"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-107.015 -17.7159L68.5327 88.459"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-113.775 -11.7934L66.8516 97.3653"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-118.332 -4.57908L66.4223 107.008"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-124.563 1.65258L66.0917 116.702"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-129.762 8.49623L66.4868 126.836"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-135.013 15.302L63.9334 135.231"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-140.249 22.1226L63.5317 144.886"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-145.271 29.0627L60.9348 153.253"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-151.129 35.5148L56.7427 160.683"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-156.145 42.4598L53.5604 168.711"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-160.709 49.6693L50.2478 176.657"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
              <path
                opacity="0.7"
                d="M-166.481 56.1763L36.8999 178.707"
                stroke="#969696"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.3 0.3"
              />
            </g>
          </g>
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
    </div>
  );
}
