/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useUIWarnings } from "./store";
import { WarningDot } from "./warning";

export function HasWarningsDot() {
  const hasWarnings = useUIWarnings((store) => store.count > 0);
  const predicate = hasWarnings
    ? "Your project has warnings to resolve."
    : false;
  return predicate ? <WarningDot label={predicate} /> : null;
}
