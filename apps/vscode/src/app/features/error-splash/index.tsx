/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useScreenView } from "@triplex/ux";

export function ErrorSplash({ error }: { error: Error }) {
  useScreenView("error_splash", "Screen");

  return (
    <>
      <div className="fixed inset-0 mx-auto flex max-w-2xl flex-col justify-center gap-4 p-4">
        <h1 className="text-center">An unexpected error occurred</h1>

        <p className="mx-auto max-w-md text-center text-lg">
          We&apos;re looking into it. Re-open Triplex and try again, if the
          problem persists try restarting your computer.
        </p>

        <div className="mx-auto flex items-center gap-2">
          <a href="mailto:support@triplex.dev">Contact us</a>
          <span className="text-xs">•</span>
          <a href="https://github.com/try-triplex/triplex/issues/new">
            Report a bug
          </a>
        </div>

        <code className="mx-auto max-w-2xl bg-white/5 px-4 py-2 text-center">
          {error.message}
        </code>
      </div>
    </>
  );
}
