/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
