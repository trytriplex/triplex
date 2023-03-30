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
  const loadModule = Object.entries(scenes).find(([filename]) =>
    path ? path.endsWith(filename) : false
  );

  if (!loadModule || !path || !exportName) {
    return null;
  }

  const { SceneComponent, triplexMeta } = suspend(async () => {
    const resolvedModule = await loadModule[1]();

    return {
      SceneComponent: resolvedModule[exportName],
      triplexMeta: resolvedModule[exportName].triplexMeta,
    };
  }, [path, exportName]);

  return (
    <>
      <SceneComponent {...sceneProps} />

      {triplexMeta.lighting === "default" && (
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
