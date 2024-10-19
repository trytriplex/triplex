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
      <div className="mx-auto flex gap-14 px-6 py-10 md:px-8 lg:w-full lg:gap-32 lg:px-20">
        <div className="lg:mr-auto lg:flex-shrink-0">
          <div className="flex gap-1">
            <span className="text-sm text-neutral-400">
              <span className="font-medium text-neutral-200">Triplex</span> —
              Built in Sydney, Australia
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <a
              aria-label="GitHub"
              className="-mt-0.5 text-neutral-400 hover:text-neutral-200"
              href="https://github.com/trytriplex/triplex"
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
              aria-label="X (formerly Twitter)"
              className="text-neutral-400 hover:text-neutral-200"
              href="https://twitter.com/trytriplex"
              rel="noreferrer"
              target="_blank"
            >
              <svg
                className="text-current"
                height="16"
                strokeLinejoin="round"
                viewBox="0 0 16 16"
                width="16"
              >
                <path
                  clipRule="evenodd"
                  d="M0.5 0.5H5.75L9.48421 5.71053L14 0.5H16L10.3895 6.97368L16.5 15.5H11.25L7.51579 10.2895L3 15.5H1L6.61053 9.02632L0.5 0.5ZM12.0204 14L3.42043 2H4.97957L13.5796 14H12.0204Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </a>
            <a
              aria-label="YouTube"
              className="ml-0.5 text-neutral-400 hover:text-neutral-200"
              href="https://www.youtube.com/@trytriplex"
              rel="noreferrer"
              target="_blank"
            >
              <svg className="w-6" height="20" viewBox="0 0 28 20" width="28">
                <g>
                  <path
                    d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"
                    fill="currentColor"
                  />
                  <path
                    d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z"
                    fill="black"
                  />
                </g>
              </svg>
            </a>
          </div>
        </div>
        <div className="grid w-full gap-14 sm:justify-end sm:[grid-template-columns:repeat(auto-fit,7rem)] xl:gap-32">
          <ul className="flex flex-col gap-4">
            <span className="text-sm font-medium text-neutral-200">
              Product
            </span>
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
                href="https://github.com/trytriplex/triplex/releases"
              >
                Changelog
              </Link>
            </li>
          </ul>

          <ul className="flex flex-col gap-4">
            <span className="text-sm font-medium text-neutral-200">
              Resources
            </span>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="https://discord.gg/nBzRBUEs4b"
              >
                Discord
              </Link>
            </li>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="https://www.youtube.com/@trytriplex"
              >
                YouTube
              </Link>
            </li>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="https://github.com/trytriplex/triplex/issues/new"
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
            <span className="text-sm font-medium text-neutral-200">
              Developers
            </span>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="https://github.com/trytriplex/triplex"
              >
                GitHub
              </Link>
            </li>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="https://github.com/sponsors/itsdouges"
              >
                Sponsor
              </Link>
            </li>
            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="https://pmnd.rs/"
              >
                Poimandres
              </Link>
            </li>
          </ul>
          <ul className="flex flex-col gap-4">
            <span className="text-sm font-medium text-neutral-200">Legal</span>

            <li>
              <Link
                className="text-sm text-neutral-400 hover:text-neutral-200"
                href="/legal/privacy-policy"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
