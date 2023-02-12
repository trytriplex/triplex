import { TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { listen } from "@triplex/bridge/client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Box3, Object3D, Vector3, Vector3Tuple } from "three";
import { TransformControls as TransformControlsImpl } from "three-stdlib";

export interface EditorNodeData {
  path: string;
  name: string;
  line: number;
  column: number;
  props: Record<string, any>;
  rotate: boolean;
  scale: boolean;
  sceneObject: Object3D;
  translate: boolean;
  space: "local" | "world";
}

interface SceneObjectData {
  name: string;
  props?: {
    column: number;
    line: number;
    name: string;
    value: any;
  }[];
}

type WithR3FData<TObject extends Object3D> = {
  __r3f: {
    memoizedProps: Record<string, any>;
  };

  traverse(callback: (object: WithR3FData<Object3D>) => any): void;

  parent: WithR3FData<Object3D> | null;
} & Omit<TObject, "traverse" | "parent">;

const findPositionedObject = (object: WithR3FData<Object3D>): Object3D => {
  let found: Object3D | undefined = undefined;

  object.traverse((child: WithR3FData<Object3D>) => {
    if (!found && child.__r3f && child.__r3f.memoizedProps.position) {
      // This scene object has been assigned a position.
      found = child;
    }
  });

  return found || object;
};

const findEditorData = (
  object: WithR3FData<Object3D>
): EditorNodeData | null => {
  let parent: WithR3FData<Object3D> | null = object;
  let data: EditorNodeData | null = null;

  while (parent) {
    if ("__r3fEditor" in parent.userData) {
      if (!data) {
        data = {
          ...parent.userData.__r3fEditor,
          sceneObject: findPositionedObject(parent),
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

const findSceneObjectWithLineColumn = (
  scene: WithR3FData<Object3D>,
  line: number,
  column: number,
  path: string
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
          nodeData = findEditorData(obj);
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
  onFocus: (data: EditorNodeData) => void;
  onJumpTo: (v: Vector3Tuple, bb: Box3, obj: Object3D) => void;
  onNavigate: (node: EditorNodeData) => void;
  path: string;
}) {
  const [selected, setSelected] = useState<EditorNodeData>();
  const [objectData, setObjectData] = useState<SceneObjectData>();
  const [mode, setMode] = useState<"translate" | "rotate" | "scale">(
    "translate"
  );
  const transformControls = useRef<TransformControlsImpl>(null);
  const dragging = useRef(false);
  const scene = useThree((store) => store.scene);

  useEffect(() => {
    return listen("trplx:requestBlurSceneObject", () => {
      setSelected(undefined);
      setObjectData(undefined);
    });
  }, []);

  useEffect(() => {
    return listen("trplx:requestFocusSceneObject", (data) => {
      const sceneObject = findSceneObjectWithLineColumn(
        scene as unknown as WithR3FData<Object3D>,
        data.line,
        data.column,
        data.path
      );

      if (sceneObject) {
        setSelected(sceneObject);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      setObjectData(undefined);
      onBlur();
    };
  }, [path]);

  const onClick = async (e: any) => {
    if (e.delta > 1) {
      return;
    }

    if (selected && e.object === selected?.sceneObject) {
      // Ignore this event we're already selected.
      return;
    }

    const data = findEditorData(e.object as WithR3FData<Object3D>);
    if (data) {
      e.stopPropagation();
      setSelected(data);
      onFocus(data);
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!selected) {
        return;
      }

      // Begin fetching data for this.
      const res = await fetch(
        `http://localhost:8000/scene/object/${selected.line}/${selected.column}?path=${path}`
      );
      const json = await res.json();
      setObjectData(json);
    }

    loadData();
  }, [selected]);

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (dragging.current) {
          transformControls.current?.reset();
        } else if (selected) {
          setSelected(undefined);
          setObjectData(undefined);
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
        onNavigate(selected);
      }

      if (e.key === "r") {
        setMode("rotate");
      }

      if (e.key === "t") {
        setMode("translate");
      }

      if (e.key === "s" && !e.metaKey && !e.ctrlKey) {
        setMode("scale");
      }
    };

    document.addEventListener("keyup", callback);

    return () => document.removeEventListener("keyup", callback);
  }, [onJumpTo, selected]);

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

  return (
    <group onClick={onClick}>
      {children}
      {selected && (
        <TransformControls
          ref={transformControls}
          mode={mode}
          enabled={selected[mode] && !!objectData}
          onMouseUp={onMouseUp}
          onMouseDown={() => (dragging.current = true)}
          object={selected.sceneObject}
        />
      )}
    </group>
  );
}
