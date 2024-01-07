/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function ErrorSplash() {
  const params = new URLSearchParams(location.search);
  const error = params.get("error") || "Unknown error";

  return (
    <>
      <div className="z-50 h-[33px] select-none [-webkit-app-region:drag]" />

      <div className="fixed inset-0 mx-auto flex max-w-2xl flex-col justify-center gap-4 p-4 lg:max-w-4xl">
        <h1 className="text-center text-5xl font-semibold tracking-tight text-neutral-200">
          Triplex couldn&apos;t start up
        </h1>

        <p className="mx-auto max-w-2xl text-center text-lg text-neutral-400">
          We&apos;re looking into it. Meanwhile, close and re-open Triplex and
          try again. If the problem persists try restarting your computer.
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

        <code className="mx-auto max-w-2xl bg-white/5 px-4 py-2 text-center text-sm text-neutral-400">
          {JSON.parse(error)}
        </code>
      </div>
    </>
  );
}
