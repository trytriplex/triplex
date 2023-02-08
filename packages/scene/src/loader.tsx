import { suspend } from "suspend-react";
import { useSearchParams } from "react-router-dom";
import { useLayoutEffect, useMemo, useState } from "react";
import { SceneMeta, SceneModule } from "./types";

export function SceneLoader({
  scenes,
}: {
  scenes: Record<string, () => Promise<SceneModule>>;
}) {
  const [updatedMeta, setUpdatedMeta] = useState<SceneMeta>();
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path");
  const stringifiedProps = searchParams.get("props");
  const sceneProps = useMemo<Record<string, unknown>>(() => {
    return stringifiedProps
      ? JSON.parse(decodeURIComponent(stringifiedProps))
      : {};
  }, [stringifiedProps]);

  const loadModule = Object.entries(scenes).find(([filename]) =>
    path ? filename.endsWith(path) : false
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
  }, [path]);

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
