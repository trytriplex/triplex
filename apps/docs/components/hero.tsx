/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Link from "next/link";
import { cn } from "../util/cn";

export function DownloadLink({ variant }: { variant: "outline" | "bold" }) {
  return (
    <Link
      href="/download"
      className={cn([
        variant === "outline" && "border-2 border-blue-400 text-blue-400",
        variant === "bold" && "bg-blue-400 text-black/90",
        "flex h-[54px] w-[250px] items-center justify-center rounded-full text-xl font-bold",
      ])}
    >
      Gain Early Access
    </Link>
  );
}

export function BigDownloadLink({ variant }: { variant: "outline" | "bold" }) {
  return (
    <Link
      href="/download"
      className={cn([
        variant === "outline" && "border-2 border-blue-400 text-blue-400",
        variant === "bold" && "bg-blue-400 text-black/90",
        "flex items-center justify-center rounded-full px-20 py-6 text-2xl font-bold md:px-28 md:py-8 md:text-4xl",
      ])}
    >
      Download Now
    </Link>
  );
}

export function Hero() {
  return (
    <div
      id="hero-section"
      className="relative flex h-[100lvh] min-h-[700px] items-center"
    >
      <div className="max-w-[80rem] px-10 pt-16 xl:px-28">
        <div className="flex flex-col items-center gap-8 md:items-start lg:gap-4">
          <h1 className="max-w-2xl text-center text-6xl font-extrabold tracking-tighter text-neutral-200 md:text-left md:text-7xl lg:max-w-4xl lg:text-8xl">
            Visually Edit React Three Fiber Components
          </h1>
          <span className="text-center text-2xl font-medium tracking-tight text-neutral-300 md:max-w-3xl md:text-left lg:text-3xl">
            Code is source of truth, build scenes, reusable components, and
            more. Made for coders, artists, everyone.
          </span>
          <div className="flex flex-col gap-4 md:mt-8 md:flex-row">
            <DownloadLink variant="bold" />

            <a
              aria-label="View Triplex Product Hunt Page"
              href="https://www.producthunt.com/posts/triplex?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-triplex"
              target="_blank"
              className="rounded-full bg-white"
            >
              <svg width="250" height="54" viewBox="0 0 250 54">
                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <g transform="translate(-130.000000, -73.000000)">
                    <g transform="translate(130.000000, 73.000000)">
                      <text
                        fontFamily="inherit"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#4B587C"
                      >
                        <tspan x="53" y="20">
                          FEATURED ON
                        </tspan>
                      </text>
                      <text
                        fontFamily="inherit"
                        fontSize="21"
                        fontWeight="bold"
                        fill="#4B587C"
                      >
                        <tspan x="52" y="40">
                          Product Hunt
                        </tspan>
                      </text>
                      <g
                        transform="translate(201.000000, 13.000000)"
                        fill="#4B587C"
                      >
                        <g>
                          <polygon points="26.0024997 10 15 10 20.5012498 0"></polygon>
                          <text
                            fontFamily="inherit"
                            fontSize="13"
                            fontWeight="bold"
                          >
                            <tspan x="9.100000000000001" y="27">
                              120
                            </tspan>
                          </text>
                        </g>
                      </g>

                      <g transform="translate(11.000000, 12.000000)">
                        <path
                          d="M31,15.5 C31,24.0603917 24.0603917,31 15.5,31 C6.93960833,31 0,24.0603917 0,15.5 C0,6.93960833 6.93960833,0 15.5,0 C24.0603917,0 31,6.93960833 31,15.5"
                          fill="#4B587C"
                        ></path>
                        <path
                          d="M17.4329412,15.9558824 L17.4329412,15.9560115 L13.0929412,15.9560115 L13.0929412,11.3060115 L17.4329412,11.3060115 L17.4329412,11.3058824 C18.7018806,11.3058824 19.7305882,12.3468365 19.7305882,13.6308824 C19.7305882,14.9149282 18.7018806,15.9558824 17.4329412,15.9558824 M17.4329412,8.20588235 L17.4329412,8.20601152 L10.0294118,8.20588235 L10.0294118,23.7058824 L13.0929412,23.7058824 L13.0929412,19.0560115 L17.4329412,19.0560115 L17.4329412,19.0558824 C20.3938424,19.0558824 22.7941176,16.6270324 22.7941176,13.6308824 C22.7941176,10.6347324 20.3938424,8.20588235 17.4329412,8.20588235"
                          fill="#FFFFFF"
                        ></path>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
