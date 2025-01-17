/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { type ReactNode } from "react";
import { cn } from "../util/cn";

export function GridContainer({
  children,
  className,
  size,
}: {
  children: ReactNode;
  className?: string;
  size: number;
}) {
  return (
    <div
      className={className}
      style={{
        "--grid": `${size}px`,
      }}
    >
      {children}
    </div>
  );
}

export function BgGrid({
  children,
  className,
  size,
  variant,
}: {
  children?: ReactNode;
  className?: string;
  size?: number;
  variant: "transparent" | "lines";
}) {
  return (
    <div
      className={cn([
        className,
        variant === "lines" &&
          "[background:repeating-linear-gradient(transparent,transparent_var(--grid),var(--bg-pressed)_var(--grid),var(--bg-pressed)_calc(var(--grid)+1px)),repeating-linear-gradient(to_right,transparent,transparent_var(--grid),var(--bg-pressed)_var(--grid),var(--bg-pressed)_calc(var(--grid)+1px))]",
        variant === "transparent" &&
          "[background:repeating-conic-gradient(var(--bg-hovered)_0%_25%,var(--bg-pressed)_0%_50%)_left_top/calc(var(--grid)*2+2px)_calc(var(--grid)*2+2px)]",
      ])}
      style={{ "--grid": size ? `${size}px` : "" }}
    >
      {children}
    </div>
  );
}
