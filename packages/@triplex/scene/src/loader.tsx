/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Fragment } from "react";
import { suspend } from "suspend-react";
import { useScenes } from "./context";
import { ManualEditableSceneObject } from "./manual-editable";

export function SceneLoader({
  exportName,
  path,
  sceneProps,
}: {
  exportName: "default" | string;
  path: string;
  sceneProps: Record<string, unknown>;
}) {
  const normalizedPath = path.replaceAll("\\", "/");
  const scenes = useScenes();
  const componentFilename = Object.keys(scenes).find((filename) =>
    normalizedPath ? normalizedPath.endsWith(filename) : false
  );

  if (!componentFilename || !exportName) {
    return null;
  }

  const { SceneComponent, triplexMeta } = suspend(async () => {
    const resolvedModule = await scenes[componentFilename]();

    return {
      SceneComponent: resolvedModule[exportName] || Fragment,
      triplexMeta: resolvedModule[exportName]?.triplexMeta,
    };
  }, [exportName, scenes, componentFilename]);

  return (
    <>
      <ManualEditableSceneObject
        component={SceneComponent}
        exportName={exportName}
        id={-1}
        path={path}
        staticSceneProps={sceneProps}
      />

      {triplexMeta?.lighting === "default" && (
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
