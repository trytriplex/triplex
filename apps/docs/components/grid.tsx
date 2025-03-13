/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type ReactNode, type RefObject } from "react";
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
  ref,
  size,
  variant,
}: {
  children?: ReactNode;
  className?: string;
  ref?: RefObject<HTMLDivElement | null>;
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
      ref={ref}
      style={size ? { "--grid": `${size}px` } : undefined}
    >
      {children}
    </div>
  );
}
