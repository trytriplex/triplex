import { TransformControls } from "@react-three/drei";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { listen, send } from "@triplex/bridge/client";
import { preloadSubscription, useSubscriptionEffect } from "@triplex/ws-client";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Box3, Object3D, Vector3, Vector3Tuple } from "three";
import { TransformControls as TransformControlsImpl } from "three-stdlib";
import { GetSceneObject, GetSceneObjectTypes } from "./api-types";
import { SceneObjectProps } from "./scene-object";

export type EditorNodeData = SceneObjectProps["__meta"] & {
  sceneObject: Object3D;
  space: "local" | "world";
  // Unaltered props currently set on the component.
  props: Record<string, unknown>;
};

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
  let foundSceneObject: Object3D | undefined = undefined;

  sceneObject.traverse((child: Object3D) => {
    const meta: SceneObjectProps["__meta"] | undefined =
      child.userData.triplexSceneMeta;

    // We need to find out if one of the jsx elements between sceneObject
    // and the next triplex boundary has the transform prop applied - if it
    // does we've found the scene object we're interested in!
    // This data is set by the @triplex/client babel plugin.
    if (meta && meta[transform]) {
      // The direct child will be the one we're interested in as it is a child
      // of the intermediately placed group in the SceneObject component.
      foundSceneObject = child.children[0];
    }
  });

  return foundSceneObject || sceneObject;
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
      // Keep traversing up the tree to find the top most wrapped scene object.
      data = {
        ...parent.userData.triplexSceneMeta,
        sceneObject: findTransformedSceneObject(parent.children[0], transform),
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

  return data;
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

interface JsxElementPositions {
  column: number;
  line: number;
  name: string;
  children: JsxElementPositions[];
  type: "host" | "custom";
}

const V1 = new Vector3();
const box = new Box3();

export function Selection({
  children,
  onBlur,
  onFocus,
  onJumpTo,
  onNavigate,
  path,
  exportName,
}: {
  children?: ReactNode;
  onBlur: () => void;
  onFocus: (node: { column: number; line: number }) => void;
  onJumpTo: (v: Vector3Tuple, bb: Box3, obj: Object3D) => void;
  onNavigate: (node: {
    path: string;
    exportName: string;
    encodedProps: string;
  }) => void;
  path: string;
  exportName: string;
}) {
  const [selected, setSelected] = useState<EditorNodeData>();
  const [transform, setTransform] = useState<"translate" | "rotate" | "scale">(
    "translate"
  );
  const transformControls = useRef<TransformControlsImpl>(null);
  const dragging = useRef(false);
  const scene = useThree((store) => store.scene);
  const sceneData = useSubscriptionEffect<{
    sceneObjects: JsxElementPositions[];
  }>(
    path && exportName ? `/scene/${encodeURIComponent(path)}/${exportName}` : ""
  );
  const sceneObjects = useMemo(
    () => flatten(sceneData?.sceneObjects || []),
    [sceneData]
  );
  const selectedSceneObjectMeta = useSubscriptionEffect<GetSceneObject | null>(
    selected
      ? `/scene/${encodeURIComponent(path)}/object/${selected.line}/${
          selected.column
        }`
      : ""
  );
  const selectedSceneObjectTypes =
    useSubscriptionEffect<GetSceneObjectTypes | null>(
      selected
        ? `/scene/${encodeURIComponent(path)}/object/${selected.line}/${
            selected.column
          }/types`
        : ""
    );

  useEffect(() => {
    send("trplx:onTransformChange", { mode: transform });
  }, [transform]);

  useEffect(() => {
    return listen("trplx:requestTransformChange", ({ mode }) => {
      setTransform(mode);
    });
  }, []);

  useEffect(() => {
    return listen("trplx:requestNavigateToScene", (sceneObject) => {
      if (!sceneObject && (!selected || !selectedSceneObjectMeta)) {
        return;
      }

      if (sceneObject && sceneObject.path) {
        onNavigate(sceneObject);
        setSelected(undefined);
        onBlur();
      } else if (
        selected &&
        selectedSceneObjectMeta &&
        selectedSceneObjectMeta.type === "custom"
      ) {
        onNavigate({
          path: selectedSceneObjectMeta.path,
          exportName: selectedSceneObjectMeta.exportName,
          encodedProps: encodeProps(selected),
        });
        setSelected(undefined);
        onBlur();
      }
    });
  }, [onBlur, onNavigate, selected, selectedSceneObjectMeta]);

  useEffect(() => {
    return listen("trplx:requestBlurSceneObject", () => {
      setSelected(undefined);
      send("trplx:onSceneObjectBlur", undefined);
    });
  }, []);

  useEffect(() => {
    if (!selected) {
      return;
    }

    return listen("trplx:requestJumpToSceneObject", () => {
      box.setFromObject(selected.sceneObject);
      onJumpTo(
        selected.sceneObject.getWorldPosition(V1).toArray(),
        box,
        selected.sceneObject
      );
    });
  }, [onJumpTo, selected]);

  useEffect(() => {
    if (!selectedSceneObjectMeta || selectedSceneObjectMeta.type === "host") {
      return;
    }

    preloadSubscription(
      `/scene/${encodeURIComponent(selectedSceneObjectMeta.path)}/${
        selectedSceneObjectMeta.exportName
      }`
    );
  }, [selectedSceneObjectMeta]);

  useEffect(() => {
    return listen("trplx:requestFocusSceneObject", (data) => {
      const sceneObject = findSceneObjectFromSource(
        data.ownerPath,
        scene,
        data.line,
        data.column,
        transform,
        sceneObjects
      );

      if (sceneObject) {
        setSelected(sceneObject);
      } else {
        setSelected(undefined);
      }

      send("trplx:onSceneObjectFocus", {
        column: data.column,
        line: data.line,
      });
    });
  }, [scene, transform, sceneObjects]);

  const onClick = async (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 1) {
      return;
    }

    if (selected && e.object === selected?.sceneObject) {
      // Ignore this event we're already selected.
      return;
    }

    // TODO: If clicking on a scene object when a selection is already
    // made this will fire A LOT OF TIMES. Need to investigate why.
    const data = findEditorData(path, e.object, transform, sceneObjects);
    if (data) {
      e.stopPropagation();
      setSelected(data);
      onFocus(data);
    }
  };

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (dragging.current) {
          transformControls.current?.reset();
        } else if (selected) {
          setSelected(undefined);
        }

        onBlur();
      }

      if (selected) {
        // These commands are only available when there is a selected scene object.
        if (e.key === "f") {
          onJumpTo(
            selected.sceneObject.getWorldPosition(V1).toArray(),
            box.setFromObject(selected.sceneObject),
            selected.sceneObject
          );
        }

        if (
          e.key === "F" &&
          e.shiftKey &&
          selected &&
          selectedSceneObjectMeta &&
          selectedSceneObjectMeta.type === "custom"
        ) {
          // Only navigate if there is a path to navigate to.
          setSelected(undefined);
          onBlur();
          onNavigate({
            path: selectedSceneObjectMeta.path,
            exportName: selectedSceneObjectMeta.exportName,
            encodedProps: encodeProps(selected),
          });
        }
      }

      if (e.key === "r") {
        setTransform("rotate");

        if (selected) {
          // If there is a selected scene object re-calculate it as it might
          // need to select a different scene object as the transform target.
          const data = findEditorData(
            path,
            selected.sceneObject,
            "rotate",
            sceneObjects
          );
          if (data) {
            setSelected(data);
          }
        }
      }

      if (e.key === "t") {
        setTransform("translate");

        if (selected) {
          // If there is a selected scene object re-calculate it as it might
          // need to select a different scene object as the transform target.
          const data = findEditorData(
            path,
            selected.sceneObject,
            "translate",
            sceneObjects
          );
          if (data) {
            setSelected(data);
          }
        }
      }

      if (e.key === "s" && !e.metaKey && !e.ctrlKey) {
        setTransform("scale");

        if (selected) {
          // If there is a selected scene object re-calculate it as it might
          // need to select a different scene object as the transform target.
          const data = findEditorData(
            path,
            selected.sceneObject,
            "scale",
            sceneObjects
          );
          if (data) {
            setSelected(data);
          }
        }
      }
    };

    document.addEventListener("keyup", callback);

    return () => document.removeEventListener("keyup", callback);
  }, [
    onBlur,
    onJumpTo,
    onNavigate,
    selected,
    sceneObjects,
    path,
    selectedSceneObjectMeta,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMouseUp = (e: any) => {
    dragging.current = false;

    if (!e || !selected || !selectedSceneObjectMeta) {
      return;
    }

    if (e.mode === "translate") {
      const position =
        selected.space === "world"
          ? selected.sceneObject.getWorldPosition(V1).toArray()
          : selected.sceneObject.position.toArray();

      send("trplx:onConfirmSceneObjectProp", {
        column: selected.column,
        line: selected.line,
        path,
        propName: "position",
        propValue: position,
      });
    }

    if (e.mode === "rotate") {
      const rotation = selected.sceneObject.rotation.toArray();
      rotation.pop();

      send("trplx:onConfirmSceneObjectProp", {
        column: selected.column,
        line: selected.line,
        path,
        propName: "rotation",
        propValue: rotation,
      });
    }

    if (e.mode === "scale") {
      const scale = selected.sceneObject.scale.toArray();

      send("trplx:onConfirmSceneObjectProp", {
        column: selected.column,
        line: selected.line,
        path,
        propName: "scale",
        propValue: scale,
      });
    }
  };

  useFrame(() => {
    if (selected && selected.sceneObject.parent === null) {
      // If the scene object gets removed from the scene unselect it.
      setSelected(undefined);
    }
  });

  return (
    <group onClick={onClick}>
      {children}
      {selected && (
        <TransformControls
          enabled={
            !!selectedSceneObjectTypes &&
            selectedSceneObjectTypes.transforms[transform]
          }
          mode={transform}
          object={selected.sceneObject}
          onMouseDown={() => (dragging.current = true)}
          onMouseUp={onMouseUp}
          ref={transformControls}
        />
      )}
    </group>
  );
}
