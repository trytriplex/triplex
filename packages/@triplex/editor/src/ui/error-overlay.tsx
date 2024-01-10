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
import { compose, on, type ClientSendEventData } from "@triplex/bridge/host";
import { useEffect, useState } from "react";
import { IconButton } from "../ds/button";
import { ScrollContainer } from "../ds/scroll-container";

export function ErrorOverlay() {
  const [errors, setErrors] = useState<ClientSendEventData["error"][]>([]);
  const [index, setIndex] = useState(0);
  const error = errors[index];

  useEffect(() => {
    return compose([
      on("error", (e) => {
        setErrors((prevErrors) => {
          for (let i = 0; i < prevErrors.length; i++) {
            const err = prevErrors[i];
            if (err.message === e.message) {
              // Skip adding a new error as it already exists.
              setIndex(i);
              return prevErrors;
            }
          }

          setIndex(0);

          return [e].concat(prevErrors);
        });
      }),
    ]);
  }, []);

  if (!error) {
    return null;
  }

  return (
    <div
      className="highlight-danger fixed bottom-6 left-6 z-50 flex w-96 flex-col gap-2 rounded-md border border-neutral-600 bg-neutral-800 p-2"
      data-testid="ErrorOverlay"
      key={error.message}
    >
      <div className="flex items-center">
        <IconButton
          actionId="previous_error"
          icon={ArrowLeftIcon}
          isDisabled={index === 0}
          label="Previous Error"
          onClick={() => setIndex((prev) => prev - 1)}
        />
        <IconButton
          actionId="next_error"
          icon={ArrowRightIcon}
          isDisabled={index === errors.length - 1}
          label="Next Error"
          onClick={() => setIndex((prev) => prev + 1)}
        />
        <div className="mr-auto px-2 text-xs text-neutral-400 [font-variant-numeric:tabular-nums]">
          {index + 1} of {errors.length} errors in the scene
        </div>

        {error.source && (
          <IconButton
            actionId="view_error_source"
            icon={CodeIcon}
            label="View Source"
            onClick={() => {
              if (error.source) {
                const pos =
                  typeof error.col === "number" &&
                  typeof error.line === "number"
                    ? {
                        column: error.col,
                        line: error.line,
                      }
                    : undefined;

                window.triplex.openIDE(error.source, pos);
              }
            }}
          />
        )}
        <IconButton
          actionId="dismiss_errors"
          icon={Cross2Icon}
          label="Dismiss Errors"
          onClick={() => setErrors([])}
        />
      </div>
      <div className="-mt-1 px-2 text-sm font-medium text-neutral-300">
        {error.title}
      </div>
      <div className="-mt-1 px-2 text-xs text-neutral-300">
        {error.subtitle}
      </div>
      <ErrorMessage>{error.message}</ErrorMessage>
    </div>
  );
}

function ErrorMessage({ children }: { children: string }) {
  return (
    <ScrollContainer className="rounded bg-white/5">
      <div className="mt-0.5 max-h-14 px-2 pt-1 text-left text-xs text-neutral-400 after:block after:h-1.5">
        {children}
      </div>
    </ScrollContainer>
  );
}
