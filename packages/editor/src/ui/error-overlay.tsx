import { compose, listen } from "@triplex/bridge/host";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "../ds/button";
import { ArrowLeftIcon, ArrowRightIcon, CodeIcon } from "@radix-ui/react-icons";
import { getEditorLink } from "../util/ide";
import { ScrollContainer } from "../ds/scroll-container";

interface TriplexError {
  message: string;
  line: number;
  col: number;
  source: string;
  stack: string;
}

export function ErrorOverlay() {
  const [errors, setErrors] = useState<TriplexError[]>([]);
  const [index, setIndex] = useState(0);
  const error = errors[index];
  const resetTimeoutId = useRef<number>();

  useEffect(() => {
    return compose([
      listen("trplx:onOpenFileHmr", () => {
        resetTimeoutId.current = window.setTimeout(() => {
          // Delay resetting the errors by a short amount.
          // We do this to prevent a flash if the module was
          // Updated and still contains errors.
          setErrors([]);
          setIndex(0);
          resetTimeoutId.current = undefined;
        }, 200);
      }),
      listen("trplx:onError", (e) => {
        setErrors((prevErrors) => {
          let nextErrors = prevErrors;

          if (resetTimeoutId.current) {
            // There is a pending reset. Cancel it and clear all prev errors.
            window.clearTimeout(resetTimeoutId.current);
            resetTimeoutId.current = undefined;
            nextErrors = [];
            setIndex(0);
          }

          const newErrorStr = JSON.stringify(e);
          const errorExists = nextErrors.find((err) => {
            return JSON.stringify(err) === newErrorStr;
          });

          if (errorExists) {
            // Skip adding a new error as it already exists.
            return nextErrors;
          }

          return nextErrors.concat(e);
        });
      }),
    ]);
  }, []);

  if (!error) {
    return null;
  }

  return (
    <div
      className="fixed right-3 top-11 z-50 flex w-96 flex-col gap-1 rounded bg-red-400 p-2"
      key={error.message}
    >
      <div className="flex items-center gap-1">
        <IconButton
          isDisabled={index === 0}
          onClick={() => setIndex((prev) => prev - 1)}
          variant="inverse"
          title="Previous error"
          icon={ArrowLeftIcon}
        />
        <IconButton
          isDisabled={index === errors.length - 1}
          onClick={() => setIndex((prev) => prev + 1)}
          variant="inverse"
          title="Next error"
          icon={ArrowRightIcon}
        />
        <div className="mr-auto px-1 text-xs text-neutral-800 [font-variant-numeric:tabular-nums]">
          {index + 1} of {errors.length} errors in the scene
        </div>
        <IconButton
          onClick={() => {
            const context = window.open(
              getEditorLink({
                path: error.source,
                column: error.col,
                line: error.line,
              })
            );

            context?.close();
          }}
          className="ml-auto"
          variant="inverse"
          title="View source"
          icon={CodeIcon}
        />
      </div>
      <div className="px-2 text-sm text-neutral-800">{error.message}</div>
      <StackTrace>{error.stack}</StackTrace>
    </div>
  );
}

function StackTrace({ children }: { children: string }) {
  return (
    <div className="rounded bg-black/10 text-left text-xs text-neutral-800/80">
      <ScrollContainer>
        <div className="max-h-52 px-2 pt-1 font-mono after:block after:h-1">
          {children}
        </div>
      </ScrollContainer>
    </div>
  );
}
