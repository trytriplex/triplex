/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
