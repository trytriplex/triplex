/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createContext, useContext } from "react";
import { cn } from "./cn";

const widths = ["w-2/4", "w-3/4", "w-3/5", "w-2/5", "w-1/4"];
const IndexContext = createContext<() => number>(() => 0);

export function SkeletonContainer({ children }: { children: React.ReactNode }) {
  let index = 0;

  return (
    <IndexContext.Provider
      value={() => {
        return index++;
      }}
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
            "mb-9 mt-1 h-5 w-2/4 rounded-lg bg-gradient-to-r from-neutral-700 to-neutral-800 last-of-type:mb-0",
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

export function PanelSkeleton({ debug }: { debug?: boolean }) {
  return (
    <div
      className={cn([
        "flex flex-col pl-3 pt-3",
        debug && "absolute inset-0 z-10 bg-neutral-900",
      ])}
    >
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
