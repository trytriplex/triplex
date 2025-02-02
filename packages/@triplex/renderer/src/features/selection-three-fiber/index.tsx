/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useThree } from "@react-three/fiber";
import { compose, on, send } from "@triplex/bridge/client";
import { useEvent } from "@triplex/lib";
import { fg } from "@triplex/lib/fg";
import {
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Box3, Camera, Raycaster, Vector2, Vector3 } from "three";
import { flatten } from "../../util/array";
import { HOVER_LAYER_INDEX, SELECTION_LAYER_INDEX } from "../../util/layers";
import { resolveElementMeta } from "../../util/meta";
import { encodeProps, isObjectVisible } from "../../util/three";
import { useSubscriptionEffect } from "../../util/ws";
import { SwitchToComponentContext } from "../app/context";
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
import { SelectionIndicator } from "./selection-indicator";
import { TransformControls } from "./transform-controls";
import { type Space, type TransformControlMode } from "./types";

function strip(num: number): number {
  return +Number.parseFloat(Number(num).toPrecision(15));
}

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
  const switchToComponent = useContext(SwitchToComponentContext);
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
  const [resolvedObjects, , selectionActions] =
    useSelectionMarshal<ResolvedObject3D>({
      listener: (e) => {
        const x = (e.offsetX / canvasSize.width) * 2 - 1;
        const y = -(e.offsetY / canvasSize.height) * 2 + 1;

        raycaster.setFromCamera(new Vector2(x, y), camera);

        const results = raycaster.intersectObject(scene);

        return results
          .filter(
            (found) =>
              isObjectVisible(found.object) &&
              found.object.type !== "TransformControlsPlane",
          )
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
      onHovered: (selection) => {
        selection.object.traverse((child) =>
          child.layers.enable(HOVER_LAYER_INDEX),
        );
      },
      onSelect: (selection) => {
        selection.object.traverse((child) =>
          child.layers.enable(SELECTION_LAYER_INDEX),
        );
      },
      onSettled: (selection) => {
        selection.object.traverse((child) =>
          child.layers.disable(HOVER_LAYER_INDEX),
        );
      },
      resolve: (selections) => {
        return selections.flatMap((selection) => {
          return resolveObject3D(scene, {
            column: selection.column,
            line: selection.line,
            path: selection.parentPath,
            transform,
          });
        });
      },
    });
  const { controls } = useCamera();
  const resolvedObject = resolvedObjects.at(0);
  const resolvedObjectProps = useSubscriptionEffect(
    "/scene/:path/object/:line/:column",
    {
      column: resolvedObject?.meta.column,
      disabled:
        !resolvedObject ||
        (resolvedObject?.meta.line === -1 &&
          resolvedObject?.meta.column === -1),
      line: resolvedObject?.meta.line,
      path: resolvedObject?.meta.path,
    },
  );

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
        if (!sceneObject && !resolvedObject) {
          return;
        }

        if (
          !sceneObject &&
          resolvedObject &&
          resolvedObject &&
          resolvedObjectProps &&
          resolvedObjectProps.type === "custom" &&
          resolvedObjectProps.path &&
          resolvedObjectProps.exportName
        ) {
          switchToComponent({
            exportName: resolvedObjectProps.exportName,
            path: resolvedObjectProps.path,
            props: encodeProps(resolvedObject),
          });
        }

        send("element-blurred", undefined);
      }),
      on("request-jump-to-element", (sceneObject) => {
        const objects = sceneObject
          ? findObject3D(scene, sceneObject).map((resolved) => resolved[0])
          : resolvedObjects.map((resolved) => resolved.object);

        if (objects.length === 0) {
          return;
        }

        send("track", { actionId: "element_jumpto" });

        const box = new Box3();

        objects.forEach((object) => box.expandByObject(object));

        if (box.min.x === Number.POSITIVE_INFINITY) {
          box.setFromCenterAndSize(
            objects[0].position,
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
    resolvedObject,
    resolvedObjectProps,
    resolvedObjects,
    scene,
    switchToComponent,
  ]);

  const onCompleteTransformHandler = useEvent(() => {
    if (!resolvedObject) {
      return;
    }

    if (transform === "translate") {
      const position = resolvedObject.object.position.toArray();

      send("element-set-prop", {
        column: resolvedObject.meta.column,
        line: resolvedObject.meta.line,
        path: resolvedObject.meta.path,
        propName: "position",
        propValue: position.map(strip),
      });

      send("track", { actionId: "element_transform_translate" });
    } else if (transform === "rotate") {
      const rotation = resolvedObject.object.rotation.toArray();
      rotation.pop();

      send("element-set-prop", {
        column: resolvedObject.meta.column,
        line: resolvedObject.meta.line,
        path: resolvedObject.meta.path,
        propName: "rotation",
        propValue: rotation,
      });

      send("track", { actionId: "element_transform_rotate" });
    } else if (transform === "scale") {
      const scale = resolvedObject.object.scale.toArray();

      send("element-set-prop", {
        column: resolvedObject.meta.column,
        line: resolvedObject.meta.line,
        path: resolvedObject.meta.path,
        propName: "scale",
        propValue: scale.map(strip),
      });

      send("track", { actionId: "element_transform_scale" });
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
          enabled={resolvedObjectProps?.transforms[transform]}
          mode={transform}
          object={resolvedObject?.object}
          onCompleteTransform={onCompleteTransformHandler}
          space={space}
        />
      )}

      {resolvedObject?.object instanceof Camera && (
        <CameraPreview camera={resolvedObject?.object} />
      )}

      {fg("selection_postprocessing") && <SelectionIndicator />}
    </SceneObjectContext.Provider>
  );
}
