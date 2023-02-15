import { TransformControls } from "@react-three/drei";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { listen, send } from "@triplex/bridge/client";
import { useSubscriptionEffect } from "@triplex/ws-client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Box3, Object3D, Vector3, Vector3Tuple } from "three";
import { TransformControls as TransformControlsImpl } from "three-stdlib";

export interface EditorNodeData {
  path: string;
  name: string;
  line: number;
  column: number;
  props: Record<string, unknown>;
  rotate: boolean;
  scale: boolean;
  sceneObject: Object3D;
  translate: boolean;
  space: "local" | "world";
}

export interface SelectedNode {
  column: number;
  line: number;
  name: string;
  path: string;
  props: Record<string, unknown>;
}

interface Prop {
  column: number;
  line: number;
  name: string;
  value: unknown;
  type: "static" | "unhandled";
}

interface SceneObjectData {
  name: string;
  props: Prop[];
  propTypes: Record<
    string,
    {
      name: string;
      required: boolean;
      type: unknown;
    }
  >;
}

type WithR3FData<TObject extends Object3D> = {
  __r3f: {
    memoizedProps: Record<string, unknown>;
  };

  traverse(callback: (object: WithR3FData<Object3D>) => unknown): void;

  parent: WithR3FData<Object3D> | null;
} & Omit<TObject, "traverse" | "parent">;

const findTransformedSceneObject = (
  sceneObject: WithR3FData<Object3D>,
  transform: "translate" | "scale" | "rotate"
): Object3D => {
  const propertyName = {
    translate: "position",
    scale: "scale",
    rotate: "rotation",
  }[transform];
  let transformedSceneObject: Object3D | undefined = undefined;
  let translatedSceneObject: Object3D | undefined = undefined;

  sceneObject.traverse((child: WithR3FData<Object3D>) => {
    if (
      !transformedSceneObject &&
      child.__r3f &&
      propertyName in child.__r3f.memoizedProps
    ) {
      // This scene object be transformed via props.
      transformedSceneObject = child;
    }

    if (
      !translatedSceneObject &&
      child.__r3f &&
      "position" in child.__r3f.memoizedProps
    ) {
      // This scene object has translated via props.
      // This is used as a backup just in case the
      // transformedSceneObject wasn't found.
      translatedSceneObject = child;
    }
  });

  return transformedSceneObject || translatedSceneObject || sceneObject;
};

const findEditorData = (
  object: Object3D,
  transform: "translate" | "scale" | "rotate"
): EditorNodeData | null => {
  let parent: WithR3FData<Object3D> | null = object as WithR3FData<Object3D>;
  let data: EditorNodeData | null = null;

  while (parent) {
    if ("__r3fEditor" in parent.userData) {
      if (!data) {
        data = {
          ...parent.userData.__r3fEditor,
          sceneObject: findTransformedSceneObject(parent, transform),
          space: "world",
        } as EditorNodeData;
      }
    }

    if (data && parent.__r3f.memoizedProps.position) {
      // There is a parent that has set position so this must be local space.
      data.space = "local";
    }

    parent = parent.parent;
  }

  return data;
};

const findSceneObjectFromSource = (
  scene: WithR3FData<Object3D>,
  line: number,
  column: number,
  path: string,
  transform: "translate" | "scale" | "rotate"
): EditorNodeData | null => {
  let nodeData: EditorNodeData | null = null;

  scene.traverse((obj) => {
    if ("__r3fEditor" in obj.userData) {
      if (obj.userData) {
        const node: EditorNodeData = obj.userData.__r3fEditor;
        if (
          node.column === column &&
          node.line === line &&
          node.path === path
        ) {
          // We've found our scene object!
          nodeData = findEditorData(obj, transform);
        }
      }
    }
  });

  return nodeData;
};

const V1 = new Vector3();
const box = new Box3();

export function Selection({
  children,
  onBlur,
  onFocus,
  onJumpTo,
  onNavigate,
  path,
}: {
  children?: ReactNode;
  onBlur: () => void;
  onFocus: (node: SelectedNode) => void;
  onJumpTo: (v: Vector3Tuple, bb: Box3, obj: Object3D) => void;
  onNavigate: (node: { path: string; encodedProps: string }) => void;
  path: string;
}) {
  const [selected, setSelected] = useState<EditorNodeData>();
  const [transform, setTransform] = useState<"translate" | "rotate" | "scale">(
    "translate"
  );
  const transformControls = useRef<TransformControlsImpl>(null);
  const dragging = useRef(false);
  const scene = useThree((store) => store.scene);
  const objectData = useSubscriptionEffect<SceneObjectData | null>(
    selected
      ? `/scene/${encodeURIComponent(path)}/object/${selected.line}/${
          selected.column
        }`
      : ""
  );

  useEffect(() => {
    return listen("trplx:requestNavigateToScene", (sceneObject) => {
      if (!sceneObject && !selected) {
        throw new Error("invariant: no scene object to navigate to");
      }

      setSelected(undefined);
      onBlur();

      if (sceneObject) {
        onNavigate(sceneObject);
      } else if (selected) {
        onNavigate({
          path: selected.path,
          encodedProps: JSON.stringify(selected.props),
        });
      }
    });
  }, [onBlur, onNavigate, selected]);

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
    return listen("trplx:requestFocusSceneObject", (data) => {
      const sceneObject = findSceneObjectFromSource(
        scene as unknown as WithR3FData<Object3D>,
        data.line,
        data.column,
        data.path,
        transform
      );

      if (sceneObject) {
        setSelected(sceneObject);
        send("trplx:onSceneObjectFocus", {
          column: sceneObject.column,
          line: sceneObject.line,
          name: sceneObject.name,
          path: sceneObject.path,
        });
      }
    });
  }, [scene, transform]);

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
    const data = findEditorData(e.object, transform);
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

      if (!selected) {
        return;
      }

      if (e.key === "f") {
        box.setFromObject(selected.sceneObject);
        onJumpTo(
          selected.sceneObject.getWorldPosition(V1).toArray(),
          box,
          selected.sceneObject
        );
      }

      if (e.key === "F" && e.shiftKey && selected.path) {
        // Only navigate if there is a path to navigate to.
        setSelected(undefined);
        onBlur();
        onNavigate({
          path: selected.path,
          encodedProps: JSON.stringify(selected.props),
        });
      }

      if (e.key === "r") {
        setTransform("rotate");
        const data = findEditorData(selected.sceneObject, "rotate");
        if (data) {
          setSelected(data);
        }
      }

      if (e.key === "t") {
        setTransform("translate");
        const data = findEditorData(selected.sceneObject, "translate");
        if (data) {
          setSelected(data);
        }
      }

      if (e.key === "s" && !e.metaKey && !e.ctrlKey) {
        setTransform("scale");
        const data = findEditorData(selected.sceneObject, "scale");
        if (data) {
          setSelected(data);
        }
      }
    };

    document.addEventListener("keyup", callback);

    return () => document.removeEventListener("keyup", callback);
  }, [onBlur, onJumpTo, onNavigate, selected]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMouseUp = (e: any) => {
    dragging.current = false;

    if (!e || !selected || !objectData) {
      return;
    }

    if (e.mode === "translate") {
      const position =
        selected.space === "world"
          ? selected.sceneObject.getWorldPosition(V1).toArray()
          : selected.sceneObject.position.toArray();

      fetch(
        `http://localhost:8000/scene/object/${selected.line}/${
          selected.column
        }/prop?value=${JSON.stringify(position)}&path=${path}&name=position`
      );
    }

    if (e.mode === "rotate") {
      const rotation = selected.sceneObject.rotation.toArray();
      rotation.pop();

      fetch(
        `http://localhost:8000/scene/object/${selected.line}/${
          selected.column
        }/prop?value=${JSON.stringify(rotation)}&path=${path}&name=rotation`
      );
    }

    if (e.mode === "scale") {
      const scale = selected.sceneObject.scale.toArray();

      fetch(
        `http://localhost:8000/scene/object/${selected.line}/${
          selected.column
        }/prop?value=${JSON.stringify(scale)}&path=${path}&name=scale`
      );
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
          enabled={selected[transform] && !!objectData}
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
