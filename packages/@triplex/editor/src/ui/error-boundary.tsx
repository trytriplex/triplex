/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ReactNode } from "react";
import { ErrorBoundary as ErrorBound } from "react-error-boundary";
import { ExternalLink } from "../ds/external-link";

function humanize(message: string) {
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
    description: "An unexpected error occurred, sorry! We're looking into it.",
    title: "Something Went Wrong",
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
          <div className="flex h-full flex-col gap-2 px-4 py-3">
            <h2 className="text-sm font-medium text-neutral-300">
              {message.title}
            </h2>

            <div className="text-sm text-neutral-400">
              {message.description}
            </div>

            <div className="rounded bg-white/5 p-2">
              <code className="block max-h-64 overflow-hidden text-xs text-neutral-500">
                {e.error.message}
              </code>
            </div>

            <div className="flex items-center gap-2">
              <ExternalLink
                actionId="errorboundary_contact_issue"
                size="xs"
                to="https://github.com/trytriplex/triplex/issues/new"
              >
                Report a bug
              </ExternalLink>
              <span className="text-xs text-neutral-400">•</span>
              <ExternalLink
                actionId="errorboundary_logs_open"
                size="xs"
                to="triplex:view-logs"
              >
                View logs
              </ExternalLink>
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
