/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { createContext, useContext } from "react";

const IndexContext = createContext<() => number>(() => 0);

export function SkeletonList({ children }: { children: React.ReactNode }) {
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
  const widths = ["50%", "75%", "40%", "25%", "60%"];
  const index = useContext(IndexContext);
  const width = widths[index() % widths.length];

  switch (variant) {
    case "ui":
      return (
        <div
          className="mb-3 h-2.5 rounded-md bg-[currentColor] opacity-10"
          style={{ width }}
        />
      );
  }

  return null;
}
