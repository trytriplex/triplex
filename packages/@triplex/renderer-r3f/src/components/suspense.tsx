/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Suspense, useEffect, useState, type SuspenseProps } from "react";

export function SubsequentSuspense({ children, fallback }: SuspenseProps) {
  const [useSuspense, setUseSuspense] = useState(false);

  useEffect(() => {
    setUseSuspense(true);
  }, []);

  return useSuspense ? (
    <Suspense fallback={fallback}>{children}</Suspense>
  ) : (
    (children as JSX.Element)
  );
}
