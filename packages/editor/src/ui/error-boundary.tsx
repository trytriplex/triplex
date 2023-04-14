import { ReactNode } from "react";
import { ErrorBoundary as ErrorBound } from "react-error-boundary";

function humanize(message: string) {
  if (message.includes("path is outside of cwd")) {
    return "Only files within the directory that you ran triplex can be opened.";
  }

  return "This was unexpected please raise an issue on Github or Discord.";
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
      resetKeys={keys}
      fallbackRender={(e) => (
        <div className="flex flex-col gap-2 p-4">
          <h2 className="text-xl font-medium text-neutral-300">
            An error occurred
          </h2>
          <div className="text-neutral-400">{humanize(e.error.message)}</div>

          <div className="rounded bg-white/5 p-2">
            <code className="block max-h-64 overflow-hidden text-xs text-neutral-500">
              {e.error.message}
            </code>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBound>
  );
}
