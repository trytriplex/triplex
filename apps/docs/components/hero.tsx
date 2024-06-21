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
      className={cn([
        variant === "outline" && "border-2 border-blue-400 text-blue-400",
        variant === "bold" && "bg-blue-400 text-black/90",
        "flex h-[54px] w-[250px] items-center justify-center rounded-full text-xl font-bold",
      ])}
      href="/download"
    >
      Gain Early Access
    </Link>
  );
}

export function BigDownloadLink({ variant }: { variant: "outline" | "bold" }) {
  return (
    <Link
      className={cn([
        variant === "outline" && "border-2 border-blue-400 text-blue-400",
        variant === "bold" && "bg-blue-400 text-black/90",
        "flex items-center justify-center rounded-full px-20 py-6 text-2xl font-bold md:px-28 md:py-8 md:text-4xl",
      ])}
      href="/download"
    >
      Download Now
    </Link>
  );
}

export function Hero() {
  return (
    <div
      className="relative -mb-20 flex h-[80lvh] min-h-[400px] items-center pt-28"
      id="hero-section"
    >
      <div className="w-full px-10 xl:px-28">
        <div className="flex flex-col items-center gap-8 lg:gap-4">
          <span className="z-10 mb-3 rounded-full border border-pink-400 px-2 text-center text-sm font-semibold text-pink-300">
            <a
              className="[text-shadow:black_1px_0_20px]"
              href="https://forms.gle/tgM5JJNFrhEC32n98"
              rel="noreferrer"
              target="_blank"
            >
              {" "}
              Triplex for VS Code is coming — join the waitlist
            </a>
          </span>

          <h1 className="max-w-2xl text-center text-5xl font-bold tracking-tighter text-neutral-200 [text-shadow:black_1px_0_50px] md:text-6xl lg:max-w-3xl lg:text-7xl">
            Visually Edit React Three Fiber Components
          </h1>
          <span className="text-center text-2xl font-medium tracking-tight text-neutral-200 [text-shadow:black_1px_0_20px] md:max-w-3xl lg:text-3xl">
            Your component types populate the editor, build scenes, reusable
            components, and more.
          </span>

          <div className="flex flex-col gap-4 md:mt-8 md:flex-row">
            <DownloadLink variant="bold" />

            <a
              aria-label="View Triplex Product Hunt Page"
              className="rounded-full bg-white"
              href="https://www.producthunt.com/posts/triplex?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-triplex"
              rel="noreferrer"
              target="_blank"
            >
              <svg height="54" viewBox="0 0 250 54" width="250">
                <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
                  <g transform="translate(-130.000000, -73.000000)">
                    <g transform="translate(130.000000, 73.000000)">
                      <text
                        fill="#4B587C"
                        fontFamily="inherit"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        <tspan x="53" y="20">
                          FEATURED ON
                        </tspan>
                      </text>
                      <text
                        fill="#4B587C"
                        fontFamily="inherit"
                        fontSize="21"
                        fontWeight="bold"
                      >
                        <tspan x="52" y="40">
                          Product Hunt
                        </tspan>
                      </text>
                      <g
                        fill="#4B587C"
                        transform="translate(201.000000, 13.000000)"
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
