import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForceVisible } from "./scene-utils";

const sceneModules = import.meta.glob("../.tmp/**/*.tsx");

interface SceneMeta {
  customLighting: boolean;
}

export function SceneLoader() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path") || "";
  const [resolvedModule, setResolvedModule] = useState<
    Record<string, any> | undefined
  >();
  const [props, setProps] = useState({});

  useForceVisible();

  useEffect(() => {
    const sceneModule: any = Object.entries(sceneModules).find(([modPath]) =>
      modPath.includes(path)
    );
    if (!sceneModule) {
      return;
    }

    const serializedProps = searchParams.has("props")
      ? JSON.parse(decodeURIComponent(searchParams.get("props") || ""))
      : {};

    sceneModule[1]().then((resolved: any) => {
      setResolvedModule(resolved);
      setProps(serializedProps);
    });
  }, [path, searchParams]);

  const meta: SceneMeta = resolvedModule?.__r3fEditorMeta || {};
  const SceneComponent = Object.values(resolvedModule || {})[0] as Function;

  if (!SceneComponent) {
    return null;
  }

  return (
    <>
      <SceneComponent {...props} />

      {!meta.customLighting && (
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
