import { useSearchParams } from "react-router-dom";
import { listen, send } from "@triplex/bridge/client";
import { Canvas } from "./canvas";
import type { EditorNodeData } from "./selection";
import { OrbitControls, PerspectiveCamera, Grid } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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

  const onNavigate = (selected: EditorNodeData) => {
    send("trplx:onSceneObjectNavigated", {
      path: selected.path,
      props: selected.props,
    });
  };

  useEffect(() => {
    return listen("trplx:requestNavigateToSceneObject", (data) => {
      setSearchParams(
        {
          path: data.path,
          props: encodeURIComponent(JSON.stringify(data.props)),
        },
        { replace: true }
      );
    });
  }, []);

  const [focalPoint, setFocalPoint] = useState(defaultFocalPoint);
  const { target, position } = useMemo(() => {
    const actualCameraPosition: Vector3Tuple = [...focalPoint.objectCenter];
    actualCameraPosition[1] += 2;
    actualCameraPosition[2] += 7;
    return { target: focalPoint.objectCenter, position: actualCameraPosition };
  }, [focalPoint]);
  const camera = useRef<PC>(null);

  const onJumpTo = (point: Vector3Tuple, box: Box3) => {
    const center = box.getCenter(V1);
    setFocalPoint({
      objectCenter: center.toArray(),
      grid: [point[0], 0, point[2]],
    });
  };

  const onFocus = (data: EditorNodeData) => {
    send("trplx:onSceneObjectFocus", {
      path: data.path,
      column: data.column,
      line: data.line,
    });
  };

  const onBlurObject = () => {
    send("trplx:onSceneObjectBlur", {});
  };

  useEffect(() => {
    if (!path) {
      return;
    }

    const callback = (e: KeyboardEvent) => {
      if (
        e.keyCode === 83 &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
      ) {
        send("trplx:requestSave", {});
        e.preventDefault();
        fetch(`http://localhost:8000/scene/save?path=${path}`, {});
      }
    };

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [path]);

  return (
    <Canvas>
      <PerspectiveCamera
        ref={camera}
        makeDefault
        layers={layers}
        position={position}
      />
      <OrbitControls makeDefault target={target} />
      <Selection
        path={path}
        onFocus={onFocus}
        onBlur={onBlurObject}
        onNavigate={onNavigate}
        onJumpTo={onJumpTo}
      >
        <ErrorBoundary resetKeys={[path]} fallbackRender={() => null}>
          <Suspense fallback={null}>
            <SceneLoader scenes={scenes} />
          </Suspense>
        </ErrorBoundary>
      </Selection>

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
