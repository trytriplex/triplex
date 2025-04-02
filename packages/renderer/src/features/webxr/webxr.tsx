/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type Modules, type ProviderModule } from "@triplex/bridge/client";
import { LoadingLogo } from "@triplex/lib/loader";
import { Suspense } from "react";
import { ErrorBoundaryForScene } from "../../components/error-boundary";
import { ErrorFallback } from "../../components/error-fallback";
import { WebXRSceneLoader } from "../scene-loader/webxr-scene-loader";
import { WebXRContext } from "./context";

export function WebXRApp({
  exportName,
  files,
  path,
  providerPath,
  providers,
}: {
  exportName: string;
  files: Modules;
  path: string;
  providerPath: string;
  providers: ProviderModule;
}) {
  return (
    <WebXRContext.Provider value>
      <ErrorBoundaryForScene fallbackRender={() => <ErrorFallback />}>
        <Suspense
          fallback={
            <LoadingLogo color="black" position="splash" variant="fill" />
          }
        >
          <WebXRSceneLoader
            exportName={exportName}
            modules={files}
            path={path}
            providerPath={providerPath}
            providers={providers}
          />
        </Suspense>
      </ErrorBoundaryForScene>
    </WebXRContext.Provider>
  );
}
