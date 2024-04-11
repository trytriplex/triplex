/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { compose, on, send } from "@triplex/bridge/client";
import { preloadSubscription, useSubscriptionEffect } from "@triplex/ws/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Box3, Raycaster, Vector2, Vector3, type Object3D } from "three";
import { useCamera } from "./components/camera";
import { TransformControls } from "./components/transform-controls";
import { SceneObjectContext } from "./scene-object";
import { SceneObjectEventsContext } from "./stores/selection";
import { flatten } from "./util/array";
import { encodeProps } from "./util/props";
import {
  findObject3D,
  resolveObject3D,
  resolveObject3DMeta,
  type EditorNodeData,
} from "./util/scene";
import useEvent from "./util/use-event";

function strip(num: number): number {
  return +Number.parseFloat(Number(num).toPrecision(15));
}

const V1 = new Vector3();
// We use this as a default raycaster so it is fired on the default layer (0) instead
// Of the editor layer (31).
const raycaster = new Raycaster();
const SelectionContext = createContext<(select: Object3D) => void>(() => {
  throw new Error("invariant");
});

export const useSelectSceneObject = () => {
  const select = useContext(SelectionContext);
  return select;
};

export function Selection({
  children,
  filter,
  onBlur,
  onFocus,
  onNavigate,
}: {
  children?: ReactNode;
  filter: { exportName: string; path: string };
  onBlur: () => void;
  onFocus: (node: {
    column: number;
    line: number;
    parentPath: string;
    path: string;
  }) => void;
  onNavigate: (node: {
    exportName: string;
    path: string;
    props: Record<string, unknown>;
  }) => void;
}) {
  const [space, setSpace] = useState<"world" | "local">("world");
  const [selected, setSelected] = useState<{
    column: number;
    line: number;
    parentPath: string;
    path: string;
  }>();
  const [transform, setTransform] = useState<"translate" | "rotate" | "scale">(
    "translate"
  );
  const scene = useThree((store) => store.scene);
  const gl = useThree((store) => store.gl);
  const camera = useThree((store) => store.camera);
  const canvasSize = useThree((store) => store.size);
  const [isDragging, setIsDragging] = useState(false);
  const selectedSceneObject = useSubscriptionEffect(
    "/scene/:path/object/:line/:column",
    {
      column: selected?.column,
      disabled: !selected || (selected?.line === -1 && selected?.column === -1),
      line: selected?.line,
      path: selected?.parentPath,
    }
  );
  const sceneData = useSubscriptionEffect("/scene/:path/:exportName", {
    disabled: !filter.exportName || !filter.path,
    exportName: filter.exportName,
    path: filter.path,
  });
  const sceneElements = useMemo(
    () => flatten(sceneData?.sceneObjects || []),
    [sceneData]
  );
  const [selectedObject, setSelectedObject] = useState<EditorNodeData | null>(
    null
  );
  const disableSelection = useRef(false);
  const { controls } = useCamera();

  useEffect(() => {
    return on("request-state-change", ({ state }) => {
      if (state === "play") {
        setSelected(undefined);
        onBlur();
        disableSelection.current = true;
      } else {
        disableSelection.current = false;
      }
    });
  }, [onBlur]);

  useEffect(() => {
    return on("control-triggered", (data) => {
      switch (data.id) {
        case "translate":
        case "scale":
        case "rotate": {
          setTransform(data.id);
          break;
        }

        case "transformlocal": {
          setSpace("local");
          return { handled: true };
        }

        case "transformworld": {
          setSpace("world");
          return { handled: true };
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!selected) {
      setSelectedObject(null);
      return;
    }

    const result = resolveObject3D(scene, {
      column: selected.column,
      line: selected.line,
      path: selected.parentPath,
      transform,
    });

    setSelectedObject(result);
  }, [scene, selected, transform]);

  useEffect(() => {
    send("ready", undefined);
  }, []);

  useEffect(() => {
    return compose([
      on("request-open-component", (sceneObject) => {
        if (!sceneObject && (!selectedObject || !selectedSceneObject)) {
          return;
        }

        if (sceneObject) {
          onNavigate({
            exportName: sceneObject.exportName,
            path: sceneObject.path,
            props: sceneObject.encodedProps
              ? JSON.parse(sceneObject.encodedProps)
              : {},
          });
          setSelected(undefined);
          onBlur();
        } else if (
          selectedObject &&
          selectedSceneObject &&
          selectedSceneObject.type === "custom" &&
          selectedSceneObject.path &&
          selectedSceneObject.exportName
        ) {
          onNavigate({
            exportName: selectedSceneObject.exportName,
            path: selectedSceneObject.path,
            props: encodeProps(selectedObject),
          });
          setSelected(undefined);
          onBlur();
        }
      }),
      on("request-blur-element", () => {
        setSelected(undefined);
        onBlur();
      }),
      on("request-jump-to-element", (sceneObject) => {
        const targetSceneObject = sceneObject
          ? findObject3D(scene, sceneObject)
          : selectedObject?.sceneObject;

        if (!targetSceneObject) {
          return;
        }

        const box = new Box3().setFromObject(targetSceneObject);
        if (box.min.x === Number.POSITIVE_INFINITY) {
          box.setFromCenterAndSize(
            targetSceneObject.position,
            new Vector3(0.5, 0.5, 0.5)
          );
        }

        controls.current?.fitToBox(box, false, {
          paddingBottom: 0.5,
          paddingLeft: 0.5,
          paddingRight: 0.5,
          paddingTop: 0.5,
        });
      }),
      on("request-focus-element", (data) => {
        setSelected(data);
        onFocus(data);
      }),
    ]);
  }, [
    controls,
    onBlur,
    onFocus,
    onNavigate,
    scene,
    selectedObject,
    selectedSceneObject,
  ]);

  useEffect(() => {
    if (!selectedSceneObject || selectedSceneObject.type === "host") {
      return;
    }

    preloadSubscription("/scene/:path/:exportName", {
      exportName: selectedSceneObject.exportName,
      path: selectedSceneObject.path,
    });
  }, [selectedSceneObject]);

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (isDragging && e.key === "Escape") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", callback);

    return () => document.removeEventListener("keydown", callback);
  }, [isDragging]);

  useFrame(() => {
    if (selectedObject && selectedObject.sceneObject.parent === null) {
      // If the scene object gets removed from the scene unselect it.
      setSelected(undefined);
    }
  });

  const trySelectObject = useEvent((object: Object3D) => {
    if (disableSelection.current) {
      return;
    }

    const data = resolveObject3DMeta(object, {
      elements: sceneElements,
      path: filter.path,
    });

    if (data) {
      const target = {
        column: data.column,
        line: data.line,
        parentPath: filter.path,
        path: data.path,
      };

      setSelected(target);
      onFocus(target);
      send("track", { actionId: "element_focus" });

      return true;
    }

    return false;
  });

  const onMouseDownHandler = useEvent(() => {
    setIsDragging(true);
  });

  const onMouseUpHandler = useEvent(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      setIsDragging(false);

      if (!e || !selectedObject || !selectedSceneObject) {
        return;
      }

      if (e.mode === "translate") {
        const position =
          selectedObject.space === "world"
            ? selectedObject.sceneObject.getWorldPosition(V1).toArray()
            : selectedObject.sceneObject.position.toArray();

        send("element-set-prop", {
          column: selectedObject.column,
          line: selectedObject.line,
          path: selectedObject.path,
          propName: "position",
          propValue: position.map(strip),
        });
        send("track", { actionId: "element_transform_translate" });
      }

      if (e.mode === "rotate") {
        const rotation = selectedObject.sceneObject.rotation.toArray();
        rotation.pop();

        send("element-set-prop", {
          column: selectedObject.column,
          line: selectedObject.line,
          path: selectedObject.path,
          propName: "rotation",
          propValue: rotation,
        });
        send("track", { actionId: "element_transform_rotate" });
      }

      if (e.mode === "scale") {
        const scale = selectedObject.sceneObject.scale.toArray();

        send("element-set-prop", {
          column: selectedObject.column,
          line: selectedObject.line,
          path: selectedObject.path,
          propName: "scale",
          propValue: scale.map(strip),
        });
        send("track", { actionId: "element_transform_scale" });
      }
    }
  );

  const sceneObjectMountHandler = useEvent(
    (path: string, line: number, column: number) => {
      if (
        selected &&
        !selectedObject &&
        selected.path === path &&
        selected.line === line &&
        selected.column === column
      ) {
        const result = resolveObject3D(scene, {
          column: selected.column,
          line: selected.line,
          path: selected.parentPath,
          transform,
        });

        setSelectedObject(result);
      }
    }
  );

  useEffect(() => {
    let origin = [-1, -1];

    const mouseDownHandler = (e: MouseEvent) => {
      origin = [e.offsetX, e.offsetY];
    };

    const mouseUpHandler = (e: MouseEvent) => {
      const delta =
        Math.abs(e.offsetX - origin[0]) + Math.abs(e.offsetY - origin[1]);

      if (delta > 1) {
        return;
      }

      const x = (e.offsetX / canvasSize.width) * 2 - 1;
      const y = -(e.offsetY / canvasSize.height) * 2 + 1;

      raycaster.setFromCamera(new Vector2(x, y), camera);

      const result = raycaster
        .intersectObject(scene)
        .filter((found) => "isMesh" in found.object);

      for (const found of result) {
        if (trySelectObject(found.object)) {
          return;
        }
      }
    };

    gl.domElement.addEventListener("mousedown", mouseDownHandler);
    gl.domElement.addEventListener("mouseup", mouseUpHandler);

    return () => {
      gl.domElement.removeEventListener("mousedown", mouseDownHandler);
      gl.domElement.removeEventListener("mouseup", mouseUpHandler);
    };
  }, [
    camera,
    canvasSize.height,
    canvasSize.width,
    gl.domElement,
    scene,
    trySelectObject,
  ]);

  return (
    <SceneObjectContext.Provider value={true}>
      <SceneObjectEventsContext.Provider value={sceneObjectMountHandler}>
        <SelectionContext.Provider value={trySelectObject}>
          {children}
        </SelectionContext.Provider>
      </SceneObjectEventsContext.Provider>

      {selectedObject && (
        <TransformControls
          enabled={
            !!selectedSceneObject && selectedSceneObject.transforms[transform]
          }
          mode={transform}
          object={selectedObject.sceneObject}
          onMouseDown={onMouseDownHandler}
          onMouseUp={onMouseUpHandler}
          rotationSnap={Math.PI / 180}
          scaleSnap={0.02}
          space={space}
          translationSnap={0.02}
        />
      )}
    </SceneObjectContext.Provider>
  );
}
