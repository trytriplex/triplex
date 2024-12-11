/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useThree } from "@react-three/fiber";
import { compose, on, send } from "@triplex/bridge/client";
import { useEvent } from "@triplex/lib";
import { useSubscriptionEffect } from "@triplex/ws/react";
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
  resolveObject3DMeta,
} from "../../util/scene";
import { CameraPreview } from "../camera-preview";
import { useCamera } from "../camera/context";
import { SceneObjectContext } from "../scene-element/context";
import { SceneObjectEventsContext } from "../scene-element/use-scene-element-events";
import { TransformControls } from "./transform-controls";
import { type Space, type TransformControlMode } from "./types";
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
  const [space, setSpace] = useState<Space>("world");
  const [transform, setTransform] = useState<TransformControlMode>("none");
  const scene = useThree((store) => store.scene);
  const gl = useThree((store) => store.gl);
  const camera = useThree((store) => store.camera);
  const canvasSize = useThree((store) => store.size);
  const sceneData = useSubscriptionEffect("/scene/:path/:exportName", {
    disabled: !filter.exportName || !filter.path,
    exportName: filter.exportName,
    path: filter.path,
  });
  const sceneElements = useMemo(
    () => flatten(sceneData?.sceneObjects || []),
    [sceneData],
  );
  const [resolvedObjects, selectionActions] = useSelectedObject({ transform });
  const disableSelection = useRef(false);
  const { controls } = useCamera();
  const lastSelectedObject = resolvedObjects.at(-1);
  const lastSelectedObjectProps = useSubscriptionEffect(
    "/scene/:path/object/:line/:column",
    {
      column: lastSelectedObject?.column,
      disabled:
        !lastSelectedObject ||
        (lastSelectedObject?.line === -1 && lastSelectedObject?.column === -1),
      line: lastSelectedObject?.line,
      path: lastSelectedObject?.path,
    },
  );

  useEffect(() => {
    return on("request-state-change", ({ state }) => {
      if (state === "play") {
        selectionActions.clear();
        onBlur();
        disableSelection.current = true;
      } else {
        disableSelection.current = false;
      }
    });
  }, [onBlur, selectionActions]);

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
    send("ready", undefined);
  }, []);

  useEffect(() => {
    return compose([
      on("request-open-component", (sceneObject) => {
        const lastSelectedObject = resolvedObjects.at(-1);
        if (!sceneObject && !lastSelectedObject) {
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
          selectionActions.clear();
          onBlur();
        } else if (
          lastSelectedObject &&
          lastSelectedObjectProps &&
          lastSelectedObjectProps.type === "custom" &&
          lastSelectedObjectProps.path &&
          lastSelectedObjectProps.exportName
        ) {
          onNavigate({
            exportName: lastSelectedObjectProps.exportName,
            path: lastSelectedObjectProps.path,
            props: encodeProps(lastSelectedObject),
          });
          selectionActions.clear();
          onBlur();
        }
      }),
      on("request-blur-element", () => {
        selectionActions.clear();
        send("track", { actionId: "element_blur" });
        onBlur();
      }),
      on("request-jump-to-element", (sceneObject) => {
        const targetSceneObject = sceneObject
          ? findObject3D(scene, sceneObject)
          : resolvedObjects.at(-1)?.sceneObject;

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
        selectionActions.select(data, "replace");
        onFocus(data);
        send("track", { actionId: "element_focus" });
      }),
    ]);
  }, [
    controls,
    lastSelectedObjectProps,
    onBlur,
    onFocus,
    onNavigate,
    resolvedObjects,
    scene,
    selectionActions,
  ]);

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

      selectionActions.select(target, "replace");
      onFocus(target);

      return true;
    }

    return false;
  });

  const onCompleteTransformHandler = useEvent(() => {
    for (const object of resolvedObjects) {
      if (transform === "translate") {
        const position =
          object.space === "world"
            ? object.sceneObject.getWorldPosition(V1).toArray()
            : object.sceneObject.position.toArray();

        send("element-set-prop", {
          column: object.column,
          line: object.line,
          path: object.path,
          propName: "position",
          propValue: position.map(strip),
        });
        send("track", { actionId: "element_transform_translate" });
      }

      if (transform === "rotate") {
        const rotation = object.sceneObject.rotation.toArray();
        rotation.pop();

        send("element-set-prop", {
          column: object.column,
          line: object.line,
          path: object.path,
          propName: "rotation",
          propValue: rotation,
        });
        send("track", { actionId: "element_transform_rotate" });
      }

      if (transform === "scale") {
        const scale = object.sceneObject.scale.toArray();

        send("element-set-prop", {
          column: object.column,
          line: object.line,
          path: object.path,
          propName: "scale",
          propValue: scale.map(strip),
        });
        send("track", { actionId: "element_transform_scale" });
      }
    }
  });

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
        selectionActions.clear();
        send("track", { actionId: "element_blur" });
        onBlur();
      } else if (selectionMode === "cycle") {
        const lastObject = resolvedObjects.at(-1);
        const currentIndex = result.findIndex((found) => {
          if (
            found.object === lastObject?.sceneObject ||
            isMatchingTriplexMeta(found.object, lastObject?.sceneObject)
          ) {
            // We found a direct match!
            return true;
          }

          // We need to check the scene objects parents to find a match.
          let parent = found.object.parent;
          while (parent) {
            if (parent === lastObject?.sceneObject) {
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
    resolvedObjects,
    scene,
    selectionActions,
    trySelectObject,
  ]);

  return (
    <SceneObjectContext.Provider value={true}>
      <SceneObjectEventsContext.Provider
        value={selectionActions.resolveObjectsIfMissing}
      >
        {children}
      </SceneObjectEventsContext.Provider>

      {resolvedObjects.length && transform !== "none" && (
        <TransformControls
          enabled={
            resolvedObjects.length === 1 &&
            lastSelectedObjectProps?.transforms[transform]
          }
          mode={transform}
          object={lastSelectedObject?.sceneObject}
          onCompleteTransform={onCompleteTransformHandler}
          space={space}
        />
      )}

      {resolvedObjects.length === 1 &&
        resolvedObjects[0].sceneObject instanceof Camera && (
          <CameraPreview camera={resolvedObjects[0].sceneObject} />
        )}
    </SceneObjectContext.Provider>
  );
}
