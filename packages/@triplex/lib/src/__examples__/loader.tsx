/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { LoadingLogo } from "../loader";

export function SplashLogo({
  variant = "idle",
}: {
  variant: "idle" | "stroke" | "fill";
}) {
  return (
    <div style={{ color: "hotpink" }}>
      <LoadingLogo position="splash" variant={variant} />
    </div>
  );
}

export function HintLogo({
  variant = "idle",
}: {
  variant: "idle" | "stroke" | "fill";
}) {
  return (
    <div style={{ color: "currentColor" }}>
      <LoadingLogo position="hint" variant={variant} />
    </div>
  );
}
