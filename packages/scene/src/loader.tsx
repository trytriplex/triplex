import { Fragment } from "react";
import { suspend } from "suspend-react";
import { useScenes } from "./context";

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
