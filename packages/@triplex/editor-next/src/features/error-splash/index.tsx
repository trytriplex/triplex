/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useScreenView } from "@triplex/ux";

export function ErrorSplash({ error }: { error: Error | { message: string } }) {
  useScreenView("error_splash", "Screen");

  return (
    <>
      <div
        className="fixed inset-0 mx-auto flex max-w-2xl select-none flex-col justify-center gap-4 p-10"
        data-testid="ErrorSplash"
      >
        <h1 className="text-heading text-center font-medium">
          An Unexpected Error Occurred
        </h1>

        <p className="mx-auto max-w-md text-center text-lg">
          We&apos;re looking into it. Re-open Triplex for VS Code and try again,
          if the problem persists try restarting Visual Studio Code or raising
          an issue.
        </p>

        <div className="mx-auto flex items-center gap-2">
          <a
            className="text-link hover:underline"
            href="https://discord.gg/nBzRBUEs4b"
          >
            Join Discord
          </a>
          <span className="text-xs">•</span>
          <a
            className="text-link hover:underline"
            href="https://github.com/trytriplex/triplex/issues/new"
          >
            Raise an Issue
          </a>
        </div>

        <code className="mx-auto my-2 max-h-32 w-full max-w-2xl select-text overflow-auto bg-white/5 px-4 py-2 text-left">
          <pre>{error.message}</pre>
        </code>
      </div>
    </>
  );
}
