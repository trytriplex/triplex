import { useSearchParams } from "react-router-dom";
import { send } from "@triplex/bridge/client";
import { Canvas } from "./canvas";
import { OrbitControls, PerspectiveCamera, Grid } from "triplex-drei";
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
import { AddSceneObject } from "./add-scene-object";
import { SceneErrorBoundary } from "./error-boundary";

const V1 = new Vector3();
const layers = new Layers();
layers.enableAll();

const defaultFocalPoint: { grid: Vector3Tuple; objectCenter: Vector3Tuple } = {
  grid: [0, 0, 0],
  objectCenter: [0, 0, 0],
};

export function SceneFrame() {
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
    if (!path || __TRIPLEX_TARGET__ === "electron") {
      // When in electron all shortcuts are handled by accelerators meaning
      // We don't need to set any hotkeys in app. We need to refactor this and
      // We need to clean up hotkey usage across the scene by instead of handling
      // events directly we forward the hotkey press to the editor and it can figure
      // it out.
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

  useEffect(() => {
    if (!path || __TRIPLEX_TARGET__ === "electron") {
      // When in electron all shortcuts are handled by accelerators meaning
      // We don't need to set any hotkeys in app. We need to refactor this and
      // We need to clean up hotkey usage across the scene by instead of handling
      // events directly we forward the hotkey press to the editor and it can figure
      // it out.
      return;
    }

    const callback = (e: KeyboardEvent) => {
      if (
        e.key === "z" &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.shiftKey
      ) {
        send("trplx:requestRedo", undefined);
      } else if (
        e.key === "z" &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
      ) {
        send("trplx:requestUndo", undefined);
      } else if (
        e.key === "Backspace" &&
        document.activeElement === document.body
      ) {
        send("trplx:requestDeleteSceneObject", undefined);
      }
    };

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [path]);

  const onJumpTo = useCallback((position: Vector3Tuple, box: Box3) => {
    setFocalPoint({
      // If the box is empty (as the object takes up no 3d space, like a light)
      // We instead use the position instead of the center position.
      objectCenter: box.isEmpty() ? position : box.getCenter(V1).toArray(),
      grid: [position[0], 0, position[2]],
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

      send("trplx:onSceneObjectNavigated", { ...selected, entered: true });
    },
    [setSearchParams]
  );

  const onFocus = useCallback((data: { column: number; line: number }) => {
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

      <SceneErrorBoundary>
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
            />

            <AddSceneObject
              // Blow this components state away when path changes
              key={path}
              path={path}
            />
          </Selection>
        </Suspense>
      </SceneErrorBoundary>

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
