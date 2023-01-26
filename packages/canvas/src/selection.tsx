import { TransformControls } from "@react-three/drei";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box3, Object3D, Vector3, Vector3Tuple } from "three";
import { TransformControls as TransformControlsImpl } from "three-stdlib";

interface EditorNodeData {
  path: string;
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
  let parent: WithR3FData<Object3D> | null = object.parent;
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

const V1 = new Vector3();
const box = new Box3();

export function Selection({
  children,
  onFocus,
}: {
  children?: ReactNode;
  onFocus: (v: Vector3Tuple, bb: Box3, obj: Object3D) => void;
}) {
  const [selected, setSelected] = useState<EditorNodeData>();
  const [objectData, setObjectData] = useState<SceneObjectData | undefined>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<"translate" | "rotate" | "scale">(
    "translate"
  );
  const path = searchParams.get("path");
  const transformControls = useRef<TransformControlsImpl>(null);
  const dragging = useRef(false);

  useEffect(() => {
    return () => {
      setSelected(undefined);
      setObjectData(undefined);
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

      if (data.path) {
        fetch(`http://localhost:8000/scene/open?path=${data.path}`);
      }

      // Begin fetching data for this.
      const res = await fetch(
        `http://localhost:8000/scene/object/${data.line}/${data.column}?path=${path}`
      );
      const json = await res.json();
      setObjectData(json);
    }
  };

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (!selected) {
        return;
      }

      if (e.key === "Escape") {
        if (dragging.current) {
          transformControls.current?.reset();
        } else {
          setSelected(undefined);
          setObjectData(undefined);
        }
      }

      if (e.key === "f") {
        box.setFromObject(selected.sceneObject);
        onFocus(
          selected.sceneObject.getWorldPosition(V1).toArray(),
          box,
          selected.sceneObject
        );
      }

      if (e.key === "F") {
        setSearchParams({
          path: selected.path,
          props: encodeURIComponent(JSON.stringify(selected.props)),
        });
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
  }, [onFocus, selected, setSearchParams]);

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
