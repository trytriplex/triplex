/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
