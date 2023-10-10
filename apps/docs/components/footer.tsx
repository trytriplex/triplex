/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative col-span-full border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex justify-center gap-14 px-10 py-10 lg:w-full lg:max-w-[79rem] lg:gap-32">
        <div className="lg:mr-auto">
          <div className="flex gap-1">
            <span className="text-sm text-neutral-400">
              <span className="font-bold text-neutral-200">Triplex</span> —
              Built in Sydney, Australia
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            <a
              aria-label="Github"
              className="-mt-0.5 text-neutral-400 hover:text-neutral-200"
              href="https://github.com/try-triplex/triplex"
              rel="noreferrer"
              target="_blank"
            >
              <svg
                fill="none"
                height="19"
                viewBox="0 0 17 16"
                width="19"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(githublogo)">
                  <path
                    clipRule="evenodd"
                    d="M8.18391.249268C3.82241.249268.253906 3.81777.253906 8.17927c0 3.46933 2.279874 6.44313 5.451874 7.53353.3965.0991.49563-.1983.49563-.3965v-1.3878c-2.18075.4956-2.67638-.9912-2.67638-.9912-.3965-.8922-.89212-1.1895-.89212-1.1895-.69388-.4957.09912-.4957.09912-.4957.793.0992 1.1895.793 1.1895.793.69388 1.2887 1.88338.8922 2.27988.6939.09912-.4956.29737-.8921.49562-1.0904-1.78425-.1982-3.5685-.8921-3.5685-3.96496 0-.89212.29738-1.586.793-2.08162-.09912-.19825-.3965-.99125.09913-2.08163 0 0 .69387-.19825 2.18075.793.59475-.19825 1.28862-.29737 1.9825-.29737.69387 0 1.38775.09912 1.98249.29737 1.4869-.99125 2.1808-.793 2.1808-.793.3965 1.09038.1982 1.88338.0991 2.08163.4956.59475.793 1.28862.793 2.08162 0 3.07286-1.8834 3.66766-3.66764 3.86586.29737.3965.59474.8921.59474 1.586v2.1808c0 .1982.0991.4956.5948.3965 3.172-1.0904 5.4518-4.0642 5.4518-7.53353-.0991-4.3615-3.6676-7.930002-8.02909-7.930002z"
                    fill="currentColor"
                    fillRule="evenodd"
                  ></path>
                </g>
                <defs>
                  <clipPath id="githublogo">
                    <path
                      d="M0 0h15.86v15.86H0z"
                      fill="transparent"
                      transform="translate(.253906 .0493164)"
                    ></path>
                  </clipPath>
                </defs>
              </svg>
            </a>
            <a
              aria-label="Twitter"
              className="text-neutral-400 hover:text-neutral-200"
              href="https://twitter.com/_douges"
              rel="noreferrer"
              target="_blank"
            >
              <svg
                aria-label="twitter"
                fill="currentColor"
                height="16"
                viewBox="0 0 18 15"
              >
                <path
                  d="M18 1.684l-1.687 1.684v.28c0 .307-.05.602-.123.886-.04 2.316-.777 5.387-3.816 7.81C6.404 17.115 0 12.907 0 12.907c5.063 0 5.063-1.684 5.063-1.684-1.126 0-3.376-2.243-3.376-2.243.563.56 1.689 0 1.689 0C.56 7.295.56 5.61.56 5.61c.563.561 1.689 0 1.689 0C-.563 3.368 1.124.561 1.124.561 1.687 3.368 9 4.49 9 4.49l.093-.046A6.637 6.637 0 0 1 9 3.368C9 1.353 10.636 0 12.656 0c1.112 0 2.094.506 2.765 1.286l.329-.163L17.437 0l-1.122 2.245L18 1.684z"
                  fillRule="nonzero"
                ></path>
              </svg>
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-14 lg:gap-32">
          <ul className="flex flex-col gap-4">
            <span className="text-sm font-bold text-neutral-200">Product</span>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="/docs/setup/overview"
              >
                Setup
              </Link>
            </li>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="/docs/get-started/user-interface"
              >
                User Interface
              </Link>
            </li>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="/docs/get-started/settings"
              >
                Settings
              </Link>
            </li>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="https://github.com/try-triplex/triplex/releases"
              >
                Changelog
              </Link>
            </li>
          </ul>

          <ul className="flex flex-col gap-4">
            <span className="text-sm font-bold text-neutral-200">
              Resources
            </span>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="https://discord.gg/nBzRBUEs4b"
              >
                Community
              </Link>
            </li>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="https://github.com/try-triplex/triplex/issues/new"
              >
                Raise an Issue
              </Link>
            </li>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="/docs/faq"
              >
                FAQ
              </Link>
            </li>
          </ul>

          <ul className="flex flex-col gap-4">
            <span className="text-sm font-bold text-neutral-200">
              Developers
            </span>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="https://github.com/try-triplex/triplex"
              >
                Github
              </Link>
            </li>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="/license"
              >
                License
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
