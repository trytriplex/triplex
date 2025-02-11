/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { send, type SceneComponent } from "@triplex/bridge/client";
import { useEffect } from "react";
import { ErrorBoundaryForScene } from "../../components/error-boundary";
import { ErrorFallback } from "../../components/error-fallback";
import { Tunnel } from "../../components/tunnel";
import { SceneElement } from "../scene-element";

/** This is used for e2e testing both the dev and prod smoke test build. */
function LoadedNotifierForTesting({ exportName }: { exportName: string }) {
  useEffect(() => {
    send("component-rendered", undefined);
  }, []);

  return (
    <Tunnel.In>
      <span
        data-testid="scene-loaded-meta"
        style={{
          height: 1,
          left: 0,
          opacity: 0,
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          width: 1,
        }}
      >
        {exportName}
      </span>
    </Tunnel.In>
  );
}

export function SceneRenderer({
  component: SceneComponent,
  exportName,
  path,
  props,
}: {
  component: SceneComponent;
  exportName: string;
  path: string;
  props: Record<string, unknown>;
}) {
  return (
    <ErrorBoundaryForScene
      fallbackRender={() => <ErrorFallback />}
      onError={(err) =>
        send("error", {
          message: err.message,
          source: path,
          stack: err.message,
          subtitle:
            "An error was thrown when rendering the scene which could be from missing props, context, or a bug.",
          title: "Render Error",
        })
      }
      resetKeys={[SceneComponent]}
    >
      <SceneElement
        __component={SceneComponent}
        __meta={{
          column: -1,
          exportName: "(ignore)",
          line: -1,
          name: exportName,
          path,
        }}
        forceInsideSceneObjectContext
        {...props}
      />
      <LoadedNotifierForTesting exportName={exportName} />
    </ErrorBoundaryForScene>
  );
}
