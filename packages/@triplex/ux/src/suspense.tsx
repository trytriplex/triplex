/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { fg } from "@triplex/lib/fg";
import { Fragment, Suspense, useEffect, useState, type ReactNode } from "react";

export function SubsequentSuspense({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [shouldShowSuspense, setShouldShowSuspense] = useState(false);

  useEffect(() => {
    setShouldShowSuspense(true);
  }, []);

  if (!fg("vsce_remove_suspense") || shouldShowSuspense) {
    return <Suspense fallback={fallback}>{children}</Suspense>;
  }

  return <Fragment>{children}</Fragment>;
}
