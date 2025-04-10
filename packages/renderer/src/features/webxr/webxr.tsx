/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { createXRStore } from "@react-three/xr";
import { type Modules, type ProviderModule } from "@triplex/bridge/client";
import { LoadingLogo } from "@triplex/lib/loader";
import { Suspense, useState } from "react";
import { ErrorBoundaryForScene } from "../../components/error-boundary";
import { ErrorFallback } from "../../components/error-fallback";
import { WebXRSceneLoader } from "./webxr-scene-loader";

const containerStyles = css({
  alignItems: "center",
  backgroundColor: "rgb(from var(--x-bg-surface) r g b / 0.5)",
  display: "flex",
  inset: 0,
  justifyContent: "space-around",
  position: "fixed",
  zIndex: 3,
});

const enterXRStyles = css({
  ":hover": {
    transform: "scale(1.1)",
  },
  backgroundColor: "var(--x-bg-surface)",
  borderColor: "var(--x-border)",
  borderRadius: 9999,
  borderStyle: "solid",
  borderWidth: "2px",
  color: "var(--x-text)",
  fontSize: "2rem",
  fontWeight: "500",
  paddingBlock: "2rem",
  paddingInline: "3rem",
  transition: "transform 100ms",
});

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
          <LoadingLogo color="currentColor" position="splash" variant="fill" />
        }
      >
        <div css={containerStyles}>
          <button css={enterXRStyles} onClick={() => store.enterAR()}>
            Enter AR
          </button>
          <button css={enterXRStyles} onClick={() => store.enterVR()}>
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
