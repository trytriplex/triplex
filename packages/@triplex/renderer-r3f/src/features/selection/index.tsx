/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { compose, on, send } from "@triplex/bridge/client";
import { useEvent } from "@triplex/lib";
import { preloadSubscription, useSubscriptionEffect } from "@triplex/ws/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Box3,
  Camera,
  Raycaster,
  Vector2,
  Vector3,
  type Object3D,
} from "three";
import { flatten } from "../../util/array";
import { encodeProps } from "../../util/props";
import {
  findObject3D,
  isMatchingTriplexMeta,
  isObjectVisible as isMeshVisible,
  resolveObject3D,
  resolveObject3DMeta,
} from "../../util/scene";
import { CameraPreview } from "../camera-preview";
import { useCamera } from "../camera/context";
import { SceneObjectContext } from "../scene-element/context";
import { SceneObjectEventsContext } from "../scene-element/use-scene-element-events";
import { TransformControls } from "./transform-controls";
import { useSelectedObject } from "./use-selected-object";

function strip(num: number): number {
  return +Number.parseFloat(Number(num).toPrecision(15));
}

const V1 = new Vector3();
// We use this as a default raycaster so it is fired on the default layer (0) instead
// Of the editor layer (31).
const raycaster = new Raycaster();

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
  const [transform, setTransform] = useState<
    "none" | "translate" | "rotate" | "scale"
  >("none");
  const scene = useThree((store) => store.scene);
  const gl = useThree((store) => store.gl);
  const camera = useThree((store) => store.camera);
  const canvasSize = useThree((store) => store.size);
  const selectedSceneObject = useSubscriptionEffect(
    "/scene/:path/object/:line/:column",
    {
      column: selected?.column,
      disabled: !selected || (selected?.line === -1 && selected?.column === -1),
      line: selected?.line,
      path: selected?.parentPath,
    },
  );
  const sceneData = useSubscriptionEffect("/scene/:path/:exportName", {
    disabled: !filter.exportName || !filter.path,
    exportName: filter.exportName,
    path: filter.path,
  });
  const sceneElements = useMemo(
    () => flatten(sceneData?.sceneObjects || []),
    [sceneData],
  );
  const [selectedObject, setSelectedObject] = useSelectedObject();
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
    return on("extension-point-triggered", (data) => {
      if (data.scope !== "scene") {
        return;
      }

      switch (data.id) {
        case "translate":
        case "scale":
        case "rotate":
        case "none": {
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
  }, [scene, selected, setSelectedObject, transform]);

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
        setSelected((prevSelected) => {
          if (prevSelected) {
            send("track", { actionId: "element_blur" });
          }

          return undefined;
        });

        onBlur();
      }),
      on("request-jump-to-element", (sceneObject) => {
        const targetSceneObject = sceneObject
          ? findObject3D(scene, sceneObject)
          : selectedObject?.sceneObject;

        if (!targetSceneObject) {
          return;
        }

        send("track", { actionId: "element_jumpto" });

        const box = new Box3().setFromObject(targetSceneObject);
        if (box.min.x === Number.POSITIVE_INFINITY) {
          box.setFromCenterAndSize(
            targetSceneObject.position,
            new Vector3(0.5, 0.5, 0.5),
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
        send("track", { actionId: "element_focus" });
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

  useFrame(() => {
    if (selectedObject && selectedObject.sceneObject.parent === null) {
      // The scene object has been removed from the scene. Remove our reference to it.
      setSelectedObject(null);
      // Forcibly change the selected reference so we re-fetch the selected scene object.
      setSelected((selected) => (selected ? { ...selected } : undefined));
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

      return true;
    }

    return false;
  });

  const onCompleteTransformHandler = useEvent(() => {
    if (!selectedObject || !selectedSceneObject) {
      return;
    }

    if (transform === "translate") {
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

    if (transform === "rotate") {
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

    if (transform === "scale") {
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
  });

  const onSceneObjectCommitted = useEvent(
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

        if (result && selectedObject !== result?.sceneObject) {
          // We've found a scene object to select.
          setSelectedObject(result);
        }
      }
    },
  );

  useEffect(() => {
    let origin = [-1, -1];

    const mouseDownHandler = (e: MouseEvent) => {
      origin = [e.offsetX, e.offsetY];
    };

    const mouseUpHandler = (e: MouseEvent) => {
      const selectionMode: "cycle" | "default" =
        // If there have been 2 or more consecutive clicks we change the selection mode to cycle.
        e.detail >= 2 ? "cycle" : "default";

      const delta =
        Math.abs(e.offsetX - origin[0]) + Math.abs(e.offsetY - origin[1]);

      if (delta > 1) {
        return;
      }

      const x = (e.offsetX / canvasSize.width) * 2 - 1;
      const y = -(e.offsetY / canvasSize.height) * 2 + 1;

      raycaster.setFromCamera(new Vector2(x, y), camera);

      const result = raycaster.intersectObject(scene).filter((found) => {
        return (
          isMeshVisible(found.object) &&
          found.object.type !== "TransformControlsPlane"
        );
      });

      if (selectionMode === "default") {
        for (const found of result) {
          if (trySelectObject(found.object)) {
            send("track", { actionId: "element_focus" });
            return;
          }
        }

        // Nothing was selected so we blur the current selection.
        // This only happens for the default selection mode.
        setSelected((previouslySelected) => {
          if (previouslySelected) {
            send("track", { actionId: "element_blur" });
          }

          return undefined;
        });

        onBlur();
      } else if (selectionMode === "cycle") {
        const currentIndex = result.findIndex((found) => {
          if (
            found.object === selectedObject?.sceneObject ||
            isMatchingTriplexMeta(found.object, selectedObject?.sceneObject)
          ) {
            // We found a direct match!
            return true;
          }

          // We need to check the scene objects parents to find a match.
          let parent = found.object.parent;
          while (parent) {
            if (parent === selectedObject?.sceneObject) {
              return true;
            }
            parent = parent.parent;
          }

          return false;
        });

        const nextIndex = (currentIndex + 1) % result.length;
        const nextObject = result.at(nextIndex)?.object;

        if (nextObject && trySelectObject(nextObject)) {
          send("track", { actionId: "element_focus" });
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
    onBlur,
    scene,
    selectedObject,
    trySelectObject,
  ]);

  return (
    <SceneObjectContext.Provider value={true}>
      <SceneObjectEventsContext.Provider value={onSceneObjectCommitted}>
        {children}
      </SceneObjectEventsContext.Provider>

      {selectedObject && transform !== "none" && (
        <TransformControls
          enabled={
            !!selectedSceneObject && selectedSceneObject.transforms[transform]
          }
          mode={transform}
          object={selectedObject.sceneObject}
          onCompleteTransform={onCompleteTransformHandler}
          space={space}
        />
      )}

      {selectedObject && selectedObject.sceneObject instanceof Camera && (
        <CameraPreview camera={selectedObject.sceneObject} />
      )}
    </SceneObjectContext.Provider>
  );
}
