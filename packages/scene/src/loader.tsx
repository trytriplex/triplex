/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { listen } from "@triplex/bridge/client";
import { ComponentType, Fragment, useEffect, useState } from "react";
import { suspend } from "suspend-react";
import { useScenes } from "./context";
import { SceneObject } from "./scene-object";

function RenderSceneObject({
  path,
  exportName,
  staticSceneProps,
  component: SceneComponent,
}: {
  path: string;
  exportName: string;
  staticSceneProps: Record<string, unknown>;
  component: ComponentType<unknown>;
}) {
  const [overriddenProps, setProps] = useState<Record<string, unknown>>({});

  useEffect(() => {
    return listen("trplx:requestSetSceneObjectProp", (data) => {
      if (data.column === -1 && data.line === -1 && data.path === path) {
        setProps((prev) => ({ ...prev, [data.propName]: data.propValue }));
      }
    });
  });

  return (
    <SceneObject
      __meta={{
        column: -1,
        line: -1,
        name: exportName,
        path: path,
        rotate: true,
        scale: true,
        translate: true,
      }}
      __component={SceneComponent}
      {...staticSceneProps}
      {...overriddenProps}
    />
  );
}

export function SceneLoader({
  path,
  exportName,
  sceneProps,
}: {
  path: string;
  sceneProps: Record<string, unknown>;
  exportName: "default" | string;
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
      <RenderSceneObject
        path={path}
        exportName={exportName}
        component={SceneComponent}
        staticSceneProps={sceneProps}
      />

      {triplexMeta?.lighting === "default" && (
        <>
          <hemisphereLight
            color="#87CEEB"
            intensity={0.3}
            groundColor="#362907"
          />
          <ambientLight intensity={0.3} />
          <directionalLight position={[2.5, 8, 5]} intensity={0.5} />
          <pointLight
            position={[-10, 0, -20]}
            color="#eef4aa"
            intensity={0.5}
          />
        </>
      )}
    </>
  );
}
