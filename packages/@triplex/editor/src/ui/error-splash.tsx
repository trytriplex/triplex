/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function ErrorSplash() {
  return (
    <>
      <div className="z-50 h-[33px] select-none [-webkit-app-region:drag]" />
      <div className="fixed inset-0 mx-auto flex max-w-2xl flex-col justify-center gap-4 p-10 lg:max-w-4xl">
        <h1 className="text-center text-6xl font-extrabold tracking-tight text-neutral-200 md:text-7xl">
          Triplex couldn&apos;t start up
        </h1>
        <p className="mx-auto max-w-xl text-center text-lg text-neutral-400">
          Something unexpected happened and we couldn&apos;t open your project,
          sorry! We&apos;re looking into it.
        </p>

        <div className="mx-auto flex items-center gap-2">
          <a
            className="text-blue-400"
            href="#"
            onClick={() => window.triplex.openLink("mailto:team@triplex.dev")}
          >
            Contact us
          </a>
          <span className="text-xs text-neutral-400">•</span>
          <a
            className="text-blue-400"
            href="#"
            onClick={() =>
              window.triplex.openLink(
                "https://github.com/try-triplex/triplex/issues/new"
              )
            }
          >
            Report a bug
          </a>
          <span className="text-xs text-neutral-400">•</span>
          <a
            className="text-blue-400"
            href="#"
            onClick={() => window.triplex.sendCommand("view-logs")}
          >
            View logs
          </a>
        </div>
      </div>
    </>
  );
}
