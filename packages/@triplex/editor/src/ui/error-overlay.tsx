/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CodeIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { compose, listen } from "@triplex/bridge/host";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";
import { ScrollContainer } from "../ds/scroll-container";
import { getEditorLink } from "../util/ide";

interface TriplexError {
  col: number;
  line: number;
  message: string;
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
          icon={ArrowLeftIcon}
          isDisabled={index === 0}
          onClick={() => setIndex((prev) => prev - 1)}
          title="Previous error"
        />
        <IconButton
          icon={ArrowRightIcon}
          isDisabled={index === errors.length - 1}
          onClick={() => setIndex((prev) => prev + 1)}
          title="Next error"
        />
        <div className="mr-auto px-2 text-xs text-neutral-400 [font-variant-numeric:tabular-nums]">
          {index + 1} of {errors.length} errors in the scene
        </div>

        <IconButton
          icon={CodeIcon}
          onClick={() => {
            const context = window.open(
              getEditorLink({
                column: error.col,
                line: error.line,
                path: error.source,
              })
            );

            context?.close();
          }}
          title="View source"
        />
        <IconButton
          icon={Cross2Icon}
          onClick={() => setErrors([])}
          title="Dismiss errors"
        />
      </div>
      <div className="mb-2 line-clamp-2 px-2 text-sm font-medium text-neutral-300">
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
