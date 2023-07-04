/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800">
      <div className="mx-auto flex justify-center gap-14 px-10 py-10 lg:w-full lg:max-w-[79rem] lg:gap-32">
        <div className="lg:mr-auto">
          <span className="text-sm font-medium text-neutral-400">Triplex</span>{" "}
          <span className="text-sm text-neutral-400">
            — Built in Sydney, Australia
          </span>
        </div>

        <div className="flex flex-wrap gap-14 lg:gap-32">
          <ul className="flex flex-col gap-4">
            <span className="text-sm font-medium text-neutral-200">
              Product
            </span>
            <li>
              <Link
                href="/docs/setup/overview"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                Setup
              </Link>
            </li>
            <li>
              <Link
                href="/docs/get-started/user-interface"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                User Interface
              </Link>
            </li>
            <li>
              <Link
                href="/docs/get-started/settings"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                Settings
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/try-triplex/triplex/releases"
                className="text-sm text-neutral-400 hover:text-neutral-200"
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
                href="https://discord.gg/nBzRBUEs4b"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                Community
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/try-triplex/triplex/issues/new"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                Raise an Issue
              </Link>
            </li>
            <li>
              <Link
                href="/docs/faq"
                className="text-sm text-neutral-400 hover:text-neutral-200"
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
                href="/docs/api-reference/cli"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                API
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/try-triplex/triplex"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                Github
              </Link>
            </li>
            <li>
              <Link
                href="/license"
                className="text-sm text-neutral-400 hover:text-neutral-200"
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
