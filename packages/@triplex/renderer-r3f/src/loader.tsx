/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { send } from "@triplex/bridge/client";
import { Fragment, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { suspend } from "suspend-react";
import { Tunnel } from "./components/tunnel";
import { useScenes } from "./context";
import { SceneRenderer } from "./scene-renderer";

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
    <ErrorBoundary
      fallbackRender={() => null}
      onError={(err) =>
        send("error", {
          message: err.message,
          source: path,
          stack: err.message,
          subtitle:
            "The scene could not be rendered because there was an error in a component. Resolve the errors and try again.",
          title: "Could not render scene",
        })
      }
      resetKeys={[SceneComponent]}
    >
      <LoadedNotifierForTesting exportName={exportName} />
      <SceneRenderer
        component={SceneComponent}
        exportName={exportName}
        path={path}
        props={sceneProps}
        triplexMeta={parsedTriplexMeta}
      />
    </ErrorBoundary>
  );
}
