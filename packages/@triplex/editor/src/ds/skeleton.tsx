/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createContext, useCallback, useContext, useRef } from "react";
import { cn } from "./cn";

const widths = ["w-2/4", "w-3/4", "w-3/5", "w-2/5", "w-1/4"];
const IndexContext = createContext<() => number>(() => 0);

export function SkeletonContainer({ children }: { children: React.ReactNode }) {
  const index = useRef(0);

  index.current = 0;

  return (
    <IndexContext.Provider
      value={useCallback(() => {
        return index.current++;
      }, [])}
    >
      {children}
    </IndexContext.Provider>
  );
}

export function SkeletonText({
  variant,
}: {
  variant: "body" | "ui" | "h1" | "h2";
}) {
  const index = useContext(IndexContext);
  const width = widths[index() % widths.length];

  switch (variant) {
    case "h1":
      return (
        <div
          className={cn([
            "mb-10 h-8  w-2/4 rounded-lg bg-gradient-to-r from-neutral-700 to-neutral-800 last-of-type:mb-0",
            width,
          ])}
        />
      );

    case "ui":
      return (
        <div
          className={cn([
            "mb-4 h-3 w-2/4 rounded bg-gradient-to-r from-neutral-700 to-neutral-800 last-of-type:mb-0",
            width,
          ])}
        />
      );
  }

  return null;
}

export function PanelSkeleton() {
  return (
    <div className="flex flex-col pl-3 pt-3">
      <SkeletonContainer>
        <SkeletonText variant="h1" />
        <SkeletonText variant="ui" />
        <SkeletonText variant="ui" />
        <SkeletonText variant="ui" />
        <SkeletonText variant="ui" />
        <SkeletonText variant="ui" />
      </SkeletonContainer>
    </div>
  );
}
