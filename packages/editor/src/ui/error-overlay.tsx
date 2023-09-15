/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, listen } from "@triplex/bridge/host";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "../ds/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CodeIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { getEditorLink } from "../util/ide";
import { ScrollContainer } from "../ds/scroll-container";
import { cn } from "../ds/cn";

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
      className={cn([
        "highlight-danger fixed bottom-6 left-6 z-50 flex w-96 flex-col gap-1 rounded-md border border-neutral-600 bg-neutral-800 p-2",
      ])}
      key={error.message}
    >
      <div className="flex items-center">
        <IconButton
          isDisabled={index === 0}
          onClick={() => setIndex((prev) => prev - 1)}
          title="Previous error"
          icon={ArrowLeftIcon}
        />
        <IconButton
          isDisabled={index === errors.length - 1}
          onClick={() => setIndex((prev) => prev + 1)}
          title="Next error"
          icon={ArrowRightIcon}
        />
        <div className="mr-auto px-2 text-xs text-neutral-400 [font-variant-numeric:tabular-nums]">
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
          title="View source"
          icon={CodeIcon}
        />
        <IconButton
          onClick={() => setErrors([])}
          title="Dismiss errors"
          icon={Cross2Icon}
        />
      </div>
      <div className="mb-1 line-clamp-2 px-2 text-sm font-medium text-neutral-300">
        {error.message}
      </div>
      <StackTrace>{error.stack}</StackTrace>
    </div>
  );
}

function StackTrace({ children }: { children: string }) {
  return (
    <ScrollContainer className="rounded bg-white/5">
      <div className="max-h-20 px-2 pt-1.5 text-left font-mono text-xs text-neutral-400 after:block after:h-1.5">
        {children}
      </div>
    </ScrollContainer>
  );
}
