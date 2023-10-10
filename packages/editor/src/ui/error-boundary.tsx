/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ReactNode } from "react";
import { ErrorBoundary as ErrorBound } from "react-error-boundary";

function humanize(message: string) {
  if (message.includes("path is outside of cwd")) {
    return {
      description:
        "Only files within the directory that you ran Triplex in can be opened.",
      title: "Unable to Load",
    };
  }

  if (message.includes("not found")) {
    return {
      description: (
        <span>
          This file or export does not exist. Try opening another through the{" "}
          <code className="-my-0.5 rounded bg-white/5 px-1 py-0.5 text-neutral-400">
            File {">"} Open
          </code>{" "}
          menu.
        </span>
      ),
      title: "Not Found",
    };
  }

  return {
    description:
      "This was unexpected please raise an issue on Github or Discord.",
    title: "An Error Occurred",
  };
}

export function ErrorBoundary({
  children,
  keys,
}: {
  children: ReactNode;
  keys: unknown[];
}) {
  return (
    <ErrorBound
      fallbackRender={(e) => {
        const message = humanize(e.error.message);
        return (
          <div className="flex flex-col gap-2 p-4">
            <h2 className="text-xl font-medium text-neutral-300">
              {message.title}
            </h2>

            <div className="text-neutral-400">{message.description}</div>

            <div className="mt-4 rounded bg-white/5 p-2">
              <code className="block max-h-64 overflow-hidden text-xs text-neutral-500">
                {e.error.message}
              </code>
            </div>
          </div>
        );
      }}
      resetKeys={keys}
    >
      {children}
    </ErrorBound>
  );
}
