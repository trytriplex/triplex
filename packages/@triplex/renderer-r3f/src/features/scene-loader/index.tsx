/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { send } from "@triplex/bridge/client";
import { Fragment, useEffect } from "react";
import { suspend } from "suspend-react";
import { ErrorBoundaryForScene } from "../../components/error-boundary";
import { ErrorFallback } from "../../components/error-fallback";
import { Tunnel } from "../../components/tunnel";
import { useScenes } from "../app/context";
import { FitCameraToScene } from "../camera/camera-fit-scene";
import { SceneRenderer } from "../scene-renderer";

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

export function SceneLoader({
  exportName,
  path,
  sceneProps,
}: {
  exportName: string;
  path: string;
  sceneProps: Record<string, unknown>;
}) {
  const scenes = useScenes();
  const relativePathToPickComponent = Object.keys(scenes).find((filename) =>
    path ? path.endsWith(filename) : false,
  );

  if (!relativePathToPickComponent || !exportName) {
    return null;
  }

  const { SceneComponent, triplexMeta } = suspend(async () => {
    const resolvedModule = await scenes[relativePathToPickComponent]();
    const moduleExport = resolvedModule[exportName];

    return {
      SceneComponent: moduleExport || Fragment,
      triplexMeta:
        moduleExport && "triplexMeta" in moduleExport
          ? moduleExport.triplexMeta
          : undefined,
    };
  }, [exportName, scenes, relativePathToPickComponent]);

  const parsedTriplexMeta: Record<string, unknown> = (
    triplexMeta && typeof triplexMeta === "object" ? triplexMeta : {}
  ) as Record<string, unknown>;

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
      <LoadedNotifierForTesting exportName={exportName} />
      <FitCameraToScene resetKeys={[path, exportName]}>
        <SceneRenderer
          component={SceneComponent}
          exportName={exportName}
          path={path}
          props={sceneProps}
          triplexMeta={parsedTriplexMeta}
        />
      </FitCameraToScene>
    </ErrorBoundaryForScene>
  );
}
