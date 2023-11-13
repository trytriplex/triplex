/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { compose, listen, send } from "@triplex/bridge/client";
import type { JsxElementPositions } from "@triplex/server";
import { preloadSubscription, useSubscriptionEffect } from "@triplex/ws/react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box3,
  Object3D,
  PerspectiveCamera,
  Vector3,
  Vector3Tuple,
} from "three";
import { useCamera } from "./components/camera";
import { TransformControls } from "./components/transform-controls";
import { SceneObjectProps } from "./scene-object";
import { SceneObjectEventsContext } from "./stores/selection";
import useEvent from "./util/use-event";

export type EditorNodeData = SceneObjectProps["__meta"] & {
  parentPath: string;
  // Unaltered props currently set on the component.
  props: Record<string, unknown>;
  sceneObject: Object3D;
  space: "local" | "world";
};

function strip(num: number): number {
  return +Number.parseFloat(Number(num).toPrecision(15));
}

function encodeProps(selected: EditorNodeData): string {
  const props = { ...selected.props };

  for (const key in props) {
    const prop = props[key];
    if (prop && typeof prop === "object" && "$$typeof" in prop) {
      // We remove any jsx elements from props as they can't be serialized.
      delete props[key];
    }
  }

  if ("position" in props) {
    // If position exists we want to make sure we pass in the world position
    // So if any parent groups have their position set when we transition
    // It won't jump around unexpectedly.
    const worldPosition = selected.sceneObject.getWorldPosition(V1).toArray();

    return JSON.stringify({
      ...props,
      position: worldPosition,
    });
  }

  return JSON.stringify(props);
}

const findTransformedSceneObject = (
  sceneObject: Object3D,
  transform: "translate" | "scale" | "rotate"
): Object3D => {
  let foundExactSceneObject: Object3D | undefined = undefined;
  let foundTranslatedSceneObject: Object3D | undefined;

  sceneObject.traverse((child: Object3D) => {
    const meta: SceneObjectProps["__meta"] | undefined =
      child.userData.triplexSceneMeta;

    // We need to find out if one of the jsx elements between sceneObject
    // and the next triplex boundary has the transform prop applied - if it
    // does we've found the scene object we're interested in!
    // This data is set by the @triplex/client babel plugin.
    if (!foundExactSceneObject && meta && meta[transform]) {
      // The direct child will be the one we're interested in as it is a child
      // of the intermediately placed group in the SceneObject component.
      foundExactSceneObject = child.children[0];
    }

    // As a backup we mark a the first found translated scene object if present.
    // We use this if scale and rotate are not found when traversing children.
    // This means the transform gizmo stays on the scene object instead of moving to [0,0,0].
    if (!foundTranslatedSceneObject && meta && meta.translate) {
      // The direct child will be the one we're interested in as it is a child
      // of the intermediately placed group in the SceneObject component.
      foundTranslatedSceneObject = child.children[0];
    }
  });

  return foundExactSceneObject || foundTranslatedSceneObject || sceneObject;
};

function flatten(
  positions: JsxElementPositions[]
): Exclude<JsxElementPositions, "children">[] {
  const result: Exclude<JsxElementPositions, "children">[] = [];

  for (let i = 0; i < positions.length; i++) {
    const item = positions[i];
    if (item.children) {
      result.push(...flatten(item.children));
    }

    result.push(item);
  }

  return result;
}

function isInScene(
  path: string,
  node: EditorNodeData,
  positions: JsxElementPositions[]
): boolean {
  if (path === node.path) {
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      if (node.line === position.line && node.column === position.column) {
        return true;
      }
    }
  }

  return false;
}

const findEditorData = (
  path: string,
  object: Object3D,
  transform: "translate" | "scale" | "rotate",
  positions: JsxElementPositions[]
): EditorNodeData | null => {
  let parent: Object3D | null = object;
  let data: EditorNodeData | null = null;

  while (parent) {
    if (
      "triplexSceneMeta" in parent.userData &&
      !data &&
      isInScene(path, parent.userData.triplexSceneMeta, positions)
    ) {
      const isHostElement = !!/^[a-z]/.exec(
        parent.userData.triplexSceneMeta.name
      );

      // Keep traversing up the tree to find the top most wrapped scene object.
      data = {
        ...parent.userData.triplexSceneMeta,
        sceneObject: isHostElement
          ? parent.children[0]
          : findTransformedSceneObject(parent.children[0], transform),
        space: "world",
      } as EditorNodeData;
    }

    parent = parent.parent;

    if (
      data &&
      parent &&
      (parent.position.lengthSq() > 0 || parent.scale.lengthSq() > 0)
    ) {
      // There is a parent that has set position/scale so this must be local space.
      // This affects the resulting position calculated later on after a transform.
      data.space = "local";
    }
  }

  if (data) {
    return { ...data, parentPath: path };
  }

  return null;
};

const findSceneObject = (
  scene: Object3D,
  pos: { column: number; line: number; path: string }
): Object3D | null => {
  let sceneObject: Object3D | null = null;

  scene.traverse((obj) => {
    if ("triplexSceneMeta" in obj.userData) {
      const node: EditorNodeData = obj.userData.triplexSceneMeta;

      if (
        node.path === pos.path &&
        node.column === pos.column &&
        node.line === pos.line &&
        obj.children[0]
      ) {
        sceneObject = obj.children[0];
      }
    }
  });

  return sceneObject;
};

const findSceneObjectFromSource = (
  path: string,
  scene: Object3D,
  line: number,
  column: number,
  transform: "translate" | "scale" | "rotate",
  positions: JsxElementPositions[]
): EditorNodeData | null => {
  let nodeData: EditorNodeData | null = null;

  scene.traverse((obj) => {
    if ("triplexSceneMeta" in obj.userData) {
      const node: EditorNodeData = obj.userData.triplexSceneMeta;

      if (
        node.path === path &&
        node.column === column &&
        node.line === line &&
        obj.children[0]
      ) {
        // We've found our scene object that _also_ has a direct child in the
        // Three.js scene.
        nodeData = findEditorData(path, obj, transform, positions);
      }
    }
  });

  return nodeData;
};

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
  exportName,
  onBlur,
  onFocus,
  onJumpTo,
  onNavigate,
  path: rootPath,
}: {
  children?: ReactNode;
  exportName: string;
  onBlur: () => void;
  onFocus: (node: {
    column: number;
    line: number;
    parentPath: string;
    path: string;
  }) => void;
  onJumpTo: (v: Vector3Tuple, bb: Box3, obj: Object3D) => void;
  onNavigate: (node: {
    encodedProps: string;
    exportName: string;
    path: string;
  }) => void;
  path: string;
}) {
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
  const { setCamera } = useCamera();
  const sceneData = useSubscriptionEffect("/scene/:path/:exportName", {
    disabled: !rootPath || !exportName,
    exportName,
    path: rootPath,
  });
  const [isDragging, setIsDragging] = useState(false);
  const sceneObjects = useMemo(
    () => flatten(sceneData?.sceneObjects || []),
    [sceneData]
  );
  const selectedSceneObject = useSubscriptionEffect(
    "/scene/:path/object/:line/:column",
    {
      column: selected?.column,
      disabled: !selected || (selected?.line === -1 && selected?.column === -1),
      line: selected?.line,
      path: selected?.parentPath,
    }
  );
  const [selectedObject, setSelectedObject] = useState<EditorNodeData | null>(
    null
  );

  useEffect(() => {
    if (!selected) {
      setSelectedObject(null);
      return;
    }

    const result = findSceneObjectFromSource(
      selected.parentPath,
      scene,
      selected.line,
      selected.column,
      transform,
      sceneObjects
    );

    setSelectedObject(result);
  }, [
    scene,
    sceneObjects,
    selected,
    selected?.column,
    selected?.line,
    selected?.parentPath,
    transform,
  ]);

  useEffect(() => {
    send("trplx:onTransformChange", { mode: transform });
  }, [transform]);

  useEffect(() => {
    return compose([
      listen("trplx:requestTransformChange", ({ mode }) => {
        setTransform(mode);
      }),
      listen("trplx:requestNavigateToScene", (sceneObject) => {
        if (!sceneObject && (!selectedObject || !selectedSceneObject)) {
          return;
        }

        if (sceneObject) {
          onNavigate(sceneObject);
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
            encodedProps: encodeProps(selectedObject),
            exportName: selectedSceneObject.exportName,
            path: selectedSceneObject.path,
          });
          setSelected(undefined);
          onBlur();
        }
      }),
      listen("trplx:requestBlurSceneObject", () => {
        setSelected(undefined);
        send("trplx:onSceneObjectBlur", undefined);
      }),
      listen("trplx:requestJumpToSceneObject", (sceneObject) => {
        const targetSceneObject = sceneObject
          ? findSceneObject(scene, sceneObject)
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
      listen("trplx:requestAction", (e) => {
        if (e.action === "enterCamera") {
          if (e.data) {
            const sceneObject = findSceneObject(scene, e.data);
            if (sceneObject && "isCamera" in sceneObject) {
              setCamera(sceneObject as PerspectiveCamera, {
                column: e.data.column,
                line: e.data.line,
                path: e.data.path,
              });
            }
          } else if (
            selectedObject &&
            "isCamera" in selectedObject.sceneObject
          ) {
            setCamera(selectedObject.sceneObject as PerspectiveCamera, {
              column: selectedObject.column,
              line: selectedObject.line,
              path: selectedObject.path,
            });
          }
        }
      }),
      listen("trplx:requestFocusSceneObject", (data) => {
        setSelected(data);
        send("trplx:onSceneObjectFocus", data);
      }),
    ]);
  }, [
    onBlur,
    onJumpTo,
    onNavigate,
    scene,
    selectedObject,
    selectedSceneObject,
    setCamera,
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
    const data = findEditorData(rootPath, e.object, transform, sceneObjects);
    if (data) {
      e.stopPropagation();

      const target = {
        column: data.column,
        line: data.line,
        parentPath: data.parentPath,
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

        send("trplx:onConfirmSceneObjectProp", {
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

        send("trplx:onConfirmSceneObjectProp", {
          column: selectedObject.column,
          line: selectedObject.line,
          path: selectedObject.path,
          propName: "rotation",
          propValue: rotation,
        });
      }

      if (e.mode === "scale") {
        const scale = selectedObject.sceneObject.scale.toArray();

        send("trplx:onConfirmSceneObjectProp", {
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
    const data = findEditorData(rootPath, object, transform, sceneObjects);
    if (data) {
      const target = {
        column: data.column,
        line: data.line,
        parentPath: data.parentPath,
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
        const result = findSceneObjectFromSource(
          selected.parentPath,
          scene,
          selected.line,
          selected.column,
          transform,
          sceneObjects
        );

        setSelectedObject(result);
      }
    }
  );

  return (
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
          translationSnap={0.02}
        />
      )}
    </group>
  );
}
