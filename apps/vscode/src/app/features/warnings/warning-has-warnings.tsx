/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
