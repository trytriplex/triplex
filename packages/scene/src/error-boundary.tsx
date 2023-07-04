/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ErrorBoundary } from "react-error-boundary";
import { useSearchParams } from "react-router-dom";

export function SceneErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path") || "";
  const exportName = searchParams.get("exportName") || "";

  return (
    <ErrorBoundary resetKeys={[path, exportName]} fallbackRender={() => null}>
      {children}
    </ErrorBoundary>
  );
}
