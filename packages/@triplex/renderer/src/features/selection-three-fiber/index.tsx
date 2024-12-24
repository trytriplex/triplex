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
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Box3, Camera, Raycaster, Vector2, Vector3 } from "three";
import { useSceneStore } from "../../stores/use-scene-store";
import { flatten } from "../../util/array";
import { SELECTION_LAYER_INDEX } from "../../util/layers";
import { resolveElementMeta } from "../../util/meta";
import { encodeProps, isObjectVisible } from "../../util/three";
import { CameraPreview } from "../camera-preview";
import { useCamera } from "../camera/context";
import { SceneObjectContext } from "../scene-element/context";
import { SceneObjectEventsContext } from "../scene-element/use-scene-element-events";
import { useSelectionMarshal } from "../selection-provider/use-selection-marhsal";
import {
  findObject3D,
  resolveObject3D,
  type ResolvedObject3D,
} from "./resolver";
import { TransformControls } from "./transform-controls";
import { type Space, type TransformControlMode } from "./types";

function strip(num: number): number {
  return +Number.parseFloat(Number(num).toPrecision(15));
}

const V1 = new Vector3();
// We use this as a default raycaster so it is fired on the default layer (0) instead
// Of the editor layer (31).
const raycaster = new Raycaster();

export function ThreeFiberSelection({
  children,
  filter,
}: {
  children?: ReactNode;
  filter: { exportName: string; path: string };
}) {
  const switchToComponent = useSceneStore((store) => store.switchToComponent);
  const [space, setSpace] = useState<Space>("world");
  const [transform, setTransform] = useState<TransformControlMode>("none");
  const scene = useThree((store) => store.scene);
  const camera = useThree((store) => store.camera);
  const canvasSize = useThree((store) => store.size);
  const sceneData = useSubscriptionEffect("/scene/:path/:exportName", {
    disabled: !filter.exportName || !filter.path,
    exportName: filter.exportName,
    path: filter.path,
  });
  const elements = useMemo(
    () => flatten(sceneData?.sceneObjects || []),
    [sceneData],
  );
  const [resolvedObjects, selectionActions] =
    useSelectionMarshal<ResolvedObject3D>({
      listener: (e) => {
        const x = (e.offsetX / canvasSize.width) * 2 - 1;
        const y = -(e.offsetY / canvasSize.height) * 2 + 1;

        raycaster.setFromCamera(new Vector2(x, y), camera);

        return raycaster
          .intersectObject(scene)
          .filter((found) => {
            return (
              isObjectVisible(found.object) &&
              found.object.type !== "TransformControlsPlane"
            );
          })
          .map((found) => {
            const meta = resolveElementMeta(found.object, {
              elements,
              path: filter.path,
            });

            if (meta) {
              return {
                column: meta.column,
                line: meta.line,
                parentPath: filter.path,
                path: meta.path,
              };
            }

            return undefined;
          })
          .filter((found) => !!found);
      },
      onDeselect: (selection) => {
        selection.object.traverse((child) =>
          child.layers.disable(SELECTION_LAYER_INDEX),
        );
      },
      onSelect: (selection) => {
        selection.object.traverse((child) =>
          child.layers.enable(SELECTION_LAYER_INDEX),
        );
      },
      resolve: (selections) => {
        return selections
          .map((selection) => {
            return resolveObject3D(scene, {
              column: selection.column,
              line: selection.line,
              path: selection.parentPath,
              transform,
            });
          })
          .filter((selection) => !!selection);
      },
    });
  const { controls } = useCamera();
  const lastSelectedObject = resolvedObjects.at(-1);
  const lastSelectedObjectProps = useSubscriptionEffect(
    "/scene/:path/object/:line/:column",
    {
      column: lastSelectedObject?.meta.column,
      disabled:
        !lastSelectedObject ||
        (lastSelectedObject?.meta.line === -1 &&
          lastSelectedObject?.meta.column === -1),
      line: lastSelectedObject?.meta.line,
      path: lastSelectedObject?.meta.path,
    },
  );

  useEffect(() => {
    return on("request-state-change", ({ state }) => {
      if (state === "play") {
        selectionActions.clear();
        send("element-blurred", undefined);
      }
    });
  }, [selectionActions]);

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
    return compose([
      on("request-open-component", (sceneObject) => {
        const lastSelectedObject = resolvedObjects.at(-1);
        if (!sceneObject && !lastSelectedObject) {
          return;
        }

        if (
          !sceneObject &&
          lastSelectedObject &&
          lastSelectedObject &&
          lastSelectedObjectProps &&
          lastSelectedObjectProps.type === "custom" &&
          lastSelectedObjectProps.path &&
          lastSelectedObjectProps.exportName
        ) {
          switchToComponent({
            exportName: lastSelectedObjectProps.exportName,
            path: lastSelectedObjectProps.path,
            props: encodeProps(lastSelectedObject),
          });
        }

        send("element-blurred", undefined);
      }),
      on("request-jump-to-element", (sceneObject) => {
        const targetSceneObject = sceneObject
          ? findObject3D(scene, sceneObject)
          : resolvedObjects.at(-1)?.object;

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

        controls?.fitToBox(box, false, {
          paddingBottom: 0.5,
          paddingLeft: 0.5,
          paddingRight: 0.5,
          paddingTop: 0.5,
        });
      }),
    ]);
  }, [
    controls,
    lastSelectedObjectProps,
    resolvedObjects,
    scene,
    switchToComponent,
  ]);

  const onCompleteTransformHandler = useEvent(() => {
    for (const selection of resolvedObjects) {
      if (transform === "translate") {
        const position =
          selection.space === "world"
            ? selection.object.getWorldPosition(V1).toArray()
            : selection.object.position.toArray();

        send("element-set-prop", {
          column: selection.meta.column,
          line: selection.meta.line,
          path: selection.meta.path,
          propName: "position",
          propValue: position.map(strip),
        });
        send("track", { actionId: "element_transform_translate" });
      }

      if (transform === "rotate") {
        const rotation = selection.object.rotation.toArray();
        rotation.pop();

        send("element-set-prop", {
          column: selection.meta.column,
          line: selection.meta.line,
          path: selection.meta.path,
          propName: "rotation",
          propValue: rotation,
        });
        send("track", { actionId: "element_transform_rotate" });
      }

      if (transform === "scale") {
        const scale = selection.object.scale.toArray();

        send("element-set-prop", {
          column: selection.meta.column,
          line: selection.meta.line,
          path: selection.meta.path,
          propName: "scale",
          propValue: scale.map(strip),
        });
        send("track", { actionId: "element_transform_scale" });
      }
    }
  });

  return (
    <SceneObjectContext.Provider value={true}>
      <SceneObjectEventsContext.Provider
        value={selectionActions.resolveIfMissing}
      >
        {children}
      </SceneObjectEventsContext.Provider>

      {!!resolvedObjects.length && transform !== "none" && (
        <TransformControls
          enabled={
            resolvedObjects.length === 1 &&
            lastSelectedObjectProps?.transforms[transform]
          }
          mode={transform}
          object={lastSelectedObject?.object}
          onCompleteTransform={onCompleteTransformHandler}
          space={space}
        />
      )}

      {resolvedObjects.length === 1 &&
        resolvedObjects[0].object instanceof Camera && (
          <CameraPreview camera={resolvedObjects[0].object} />
        )}
    </SceneObjectContext.Provider>
  );
}
