import { Fragment } from "react";
import { suspend } from "suspend-react";
import { SceneModule } from "./types";

export function SceneLoader({
  path,
  scenes,
  exportName,
  sceneProps,
}: {
  path: string;
  scenes: Record<string, () => Promise<SceneModule>>;
  sceneProps: Record<string, unknown>;
  exportName: "default" | string;
}) {
  const componentFilename = Object.keys(scenes).find((filename) =>
    path ? path.endsWith(filename) : false
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
      <SceneComponent {...sceneProps} />

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
