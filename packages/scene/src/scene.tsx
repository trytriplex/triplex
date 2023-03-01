import { useSearchParams } from "react-router-dom";
import { send } from "@triplex/bridge/client";
import { Canvas } from "./canvas";
import type { SelectedNode } from "./selection";
import { OrbitControls, PerspectiveCamera, Grid } from "@react-three/drei";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box3,
  Layers,
  PerspectiveCamera as PC,
  Vector3,
  Vector3Tuple,
} from "three";
import { Selection } from "./selection";
import { SceneLoader } from "./loader";
import { ErrorBoundary } from "react-error-boundary";
import { SceneModule } from "./types";

const V1 = new Vector3();
const layers = new Layers();
layers.enableAll();

const defaultFocalPoint: { grid: Vector3Tuple; objectCenter: Vector3Tuple } = {
  grid: [0, 0, 0],
  objectCenter: [0, 0, 0],
};

export function SceneFrame({
  scenes,
}: {
  scenes: Record<string, () => Promise<SceneModule>>;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get("path") || "";
  const props = searchParams.get("props") || "";
  const exportName = searchParams.get("exportName") || "";
  const sceneProps = useMemo<Record<string, unknown>>(
    () => (props ? JSON.parse(decodeURIComponent(props)) : {}),
    [props]
  );
  const [focalPoint, setFocalPoint] = useState(defaultFocalPoint);
  const { target, position } = useMemo(() => {
    const actualCameraPosition: Vector3Tuple = [...focalPoint.objectCenter];
    actualCameraPosition[1] += 2;
    actualCameraPosition[2] += 7;
    return { target: focalPoint.objectCenter, position: actualCameraPosition };
  }, [focalPoint]);
  const camera = useRef<PC>(null);

  if (path && !exportName) {
    throw new Error("invariant: exportName is undefined");
  }

  useEffect(() => {
    if (!path) {
      return;
    }

    const callback = (e: KeyboardEvent) => {
      if (
        e.keyCode === 83 &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
      ) {
        send("trplx:requestSave", undefined);
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [path]);

  const onJumpTo = useCallback((point: Vector3Tuple, box: Box3) => {
    const center = box.getCenter(V1);
    setFocalPoint({
      objectCenter: center.toArray(),
      grid: [point[0], 0, point[2]],
    });
  }, []);

  const onNavigate = useCallback(
    (selected: { path: string; exportName: string; encodedProps: string }) => {
      setSearchParams(
        {
          path: selected.path,
          exportName: selected.exportName,
          props: selected.encodedProps,
        },
        { replace: true }
      );

      send("trplx:onSceneObjectNavigated", selected);
    },
    [setSearchParams]
  );

  const onFocus = useCallback((data: SelectedNode) => {
    send("trplx:onSceneObjectFocus", {
      column: data.column,
      line: data.line,
    });
  }, []);

  const onBlurObject = useCallback(() => {
    send("trplx:onSceneObjectBlur", undefined);
  }, []);

  return (
    <Canvas>
      <PerspectiveCamera
        ref={camera}
        makeDefault
        layers={layers}
        position={position}
      />
      <OrbitControls makeDefault target={target} />

      <ErrorBoundary resetKeys={[path, exportName]} fallbackRender={() => null}>
        <Suspense fallback={null}>
          <Selection
            path={path}
            onBlur={onBlurObject}
            onFocus={onFocus}
            onJumpTo={onJumpTo}
            onNavigate={onNavigate}
            exportName={exportName}
          >
            <SceneLoader
              path={path}
              exportName={exportName}
              sceneProps={sceneProps}
              scenes={scenes}
            />
          </Selection>
        </Suspense>
      </ErrorBoundary>

      <Grid
        sectionColor="#9d4b4b"
        cellColor="#6f6f6f"
        cellThickness={1.0}
        infiniteGrid
        fadeDistance={30}
        cellSize={1}
        sectionSize={3}
        fadeStrength={1.5}
        position={focalPoint.grid}
      />
    </Canvas>
  );
}
