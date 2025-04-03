/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { createXRStore } from "@react-three/xr";
import { type Modules, type ProviderModule } from "@triplex/bridge/client";
import { LoadingLogo } from "@triplex/lib/loader";
import { Suspense, useState } from "react";
import { ErrorBoundaryForScene } from "../../components/error-boundary";
import { ErrorFallback } from "../../components/error-fallback";
import { WebXRSceneLoader } from "./webxr-scene-loader";

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
  const [store] = useState(() => createXRStore());

  return (
    <ErrorBoundaryForScene fallbackRender={() => <ErrorFallback />}>
      <Suspense
        fallback={
          <LoadingLogo color="black" position="splash" variant="fill" />
        }
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: "8px",
            inset: 0,
            justifyContent: "center",
            position: "fixed",
            zIndex: 3,
          }}
        >
          <button onClick={() => store.enterAR()} style={{ padding: 20 }}>
            Enter AR
          </button>
          <button onClick={() => store.enterVR()} style={{ padding: 20 }}>
            Enter VR
          </button>
        </div>
        <WebXRSceneLoader
          exportName={exportName}
          modules={files}
          path={path}
          providerPath={providerPath}
          providers={providers}
          store={store}
        />
      </Suspense>
    </ErrorBoundaryForScene>
  );
}
