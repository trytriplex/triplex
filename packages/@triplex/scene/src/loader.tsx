/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { send } from "@triplex/bridge/client";
import { Fragment, useEffect } from "react";
import { suspend } from "suspend-react";
import { useScenes } from "./context";
import { ManualEditableSceneObject } from "./manual-editable";

function Loaded() {
  useEffect(() => {
    send("trplx:onSceneLoaded", undefined);
  }, []);

  return null;
}

export function SceneLoader({
  exportName,
  path,
  sceneProps,
}: {
  exportName: "default" | string;
  path: string;
  sceneProps: Record<string, unknown>;
}) {
  const scenes = useScenes();
  const componentFilename = Object.keys(scenes).find((filename) =>
    path ? path.endsWith(filename) : false
  );

  if (!componentFilename || !exportName) {
    return null;
  }

  const { SceneComponent, triplexMeta } = suspend(async () => {
    const resolvedModule = await scenes[componentFilename]();
    const moduleExport = resolvedModule[exportName];

    return {
      SceneComponent: moduleExport || Fragment,
      triplexMeta:
        moduleExport && "triplexMeta" in moduleExport
          ? moduleExport.triplexMeta
          : undefined,
    };
  }, [exportName, scenes, componentFilename]);

  return (
    <>
      <Loaded />

      <ManualEditableSceneObject
        component={SceneComponent}
        exportName={exportName}
        id={-1}
        path={path}
        staticSceneProps={sceneProps}
      />

      {triplexMeta &&
        typeof triplexMeta === "object" &&
        "lighting" in triplexMeta &&
        triplexMeta.lighting === "default" && (
          <>
            <hemisphereLight
              color="#87CEEB"
              groundColor="#362907"
              intensity={0.3}
            />
            <ambientLight intensity={0.3} />
            <directionalLight intensity={0.5} position={[2.5, 8, 5]} />
            <pointLight
              color="#eef4aa"
              intensity={0.5}
              position={[-10, 0, -20]}
            />
          </>
        )}
    </>
  );
}
