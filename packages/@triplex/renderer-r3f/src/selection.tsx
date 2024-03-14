/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { compose, on, send } from "@triplex/bridge/client";
import { preloadSubscription, useSubscriptionEffect } from "@triplex/ws/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Box3, Vector3, type Object3D, type Vector3Tuple } from "three";
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
const box = new Box3();
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
  onJumpTo,
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
  onJumpTo: (v: Vector3Tuple, bb: Box3, obj: Object3D) => void;
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

  useEffect(() => {
    return on("control-triggered", (data) => {
      switch (data.id) {
        case "translate":
        case "scale":
        case "rotate": {
          setTransform(data.id);
          break;
        }

        case "local-transform": {
          setSpace("local");
          return { handled: true };
        }

        case "world-transform": {
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

        box.setFromObject(targetSceneObject);

        onJumpTo(
          targetSceneObject.getWorldPosition(V1).toArray(),
          box,
          targetSceneObject
        );
      }),
      on("request-focus-element", (data) => {
        setSelected(data);
        onFocus(data);
      }),
    ]);
  }, [
    onBlur,
    onFocus,
    onJumpTo,
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

  const onClick = useEvent(async (e: ThreeEvent<MouseEvent>) => {
    if (
      e.delta > 1 ||
      // Any scene objects that have this in their name will be excluded
      // Currently that's just the helpers inside ./components/helper.tsx
      e.object.name.includes("triplex_ignore")
    ) {
      return;
    }

    if (selected && e.object === selectedObject?.sceneObject) {
      // Ignore this event we're already selected.
      return;
    }

    // TODO: If clicking on a scene object when a selection is already
    // made this will fire A LOT OF TIMES. Need to investigate why.
    const data = resolveObject3DMeta(e.object, {
      elements: sceneElements,
      path: filter.path,
    });

    if (data) {
      e.stopPropagation();

      const target = {
        column: data.column,
        line: data.line,
        parentPath: filter.path,
        path: data.path,
      };

      setSelected(target);
      onFocus(target);
    }
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
      }
    }
  );

  const selectSceneObject = useEvent((object: Object3D) => {
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
    }
  });

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

  return (
    <SceneObjectContext.Provider value={true}>
      <group name="selection-group" onClick={onClick}>
        <SceneObjectEventsContext.Provider value={sceneObjectMountHandler}>
          <SelectionContext.Provider value={selectSceneObject}>
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
      </group>
    </SceneObjectContext.Provider>
  );
}
