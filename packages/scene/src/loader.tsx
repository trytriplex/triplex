import { suspend } from "suspend-react";
import { useDeferredValue, useLayoutEffect, useState } from "react";
import { SceneMeta, SceneModule } from "./types";

export function SceneLoader({
  path,
  scenes,
  sceneProps,
}: {
  path: string;
  scenes: Record<string, () => Promise<SceneModule>>;
  sceneProps: Record<string, unknown>;
}) {
  const [updatedMeta, setUpdatedMeta] = useState<SceneMeta>();
  // Defer path so the loading in scene doesn't flash in and out.
  const deferredPath = useDeferredValue(path);
  const loadModule = Object.entries(scenes).find(([filename]) =>
    deferredPath ? filename.endsWith(deferredPath) : false
  );

  useLayoutEffect(() => {
    async function load() {
      if (!loadModule) {
        return;
      }

      const module = await loadModule[1]();
      setUpdatedMeta(module.triplexMeta);
    }

    load();
  }, [loadModule]);

  if (!loadModule || !path) {
    return null;
  }

  const { SceneComponent, initialMeta } = suspend(async () => {
    const resolvedModule = await loadModule[1]();

    if (typeof resolvedModule.default !== "function") {
      throw new Error("invariant: module should export a default component");
    }

    return {
      SceneComponent: resolvedModule.default,
      initialMeta: resolvedModule.triplexMeta,
    };
  }, [deferredPath]);

  const reconciledMeta = updatedMeta || initialMeta;

  return (
    <>
      <SceneComponent {...sceneProps} />

      {!reconciledMeta.customLighting && (
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
