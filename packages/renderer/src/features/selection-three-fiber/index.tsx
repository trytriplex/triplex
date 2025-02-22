/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useThree } from "@react-three/fiber";
import { compose, on, send } from "@triplex/bridge/client";
import { useEvent } from "@triplex/lib";
import { fg } from "@triplex/lib/fg";
import { useContext, useEffect, useState, type ReactNode } from "react";
import { Box3, Camera, Vector3 } from "three";
import { HOVER_LAYER_INDEX, SELECTION_LAYER_INDEX } from "../../util/layers";
import { resolveElementMeta } from "../../util/meta";
import { encodeProps } from "../../util/three";
import { SwitchToComponentContext } from "../app/context";
import {
  ActiveCameraContext,
  CameraControlsContext,
} from "../camera-new/context";
import { CameraPreview } from "../camera-preview";
import { SceneObjectContext } from "../scene-element/context";
import { SceneObjectEventsContext } from "../scene-element/use-scene-element-events";
import { useSelectionMarshal } from "../selection-provider/use-selection-marhsal";
import {
  findObject3D,
  resolveObject3D,
  resolveObjectsFromPoint,
  type ResolvedObject3D,
} from "./resolver";
import { SelectionIndicator } from "./selection-indicator";
import { TransformControls } from "./transform-controls";
import { type Space, type TransformControlMode } from "./types";

function strip(num: number): number {
  return +Number.parseFloat(Number(num).toPrecision(15));
}

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
  const camera = useContext(ActiveCameraContext);
  const canvasSize = useThree((store) => store.size);
  const [transforms, setTransforms] = useState({
    rotate: false,
    scale: false,
    translate: false,
  });
  const [resolvedObjects, , selectionActions] =
    useSelectionMarshal<ResolvedObject3D>({
      listener: (e) => {
        const x = (e.offsetX / canvasSize.width) * 2 - 1;
        const y = -(e.offsetY / canvasSize.height) * 2 + 1;

        return resolveObjectsFromPoint(
          { x, y },
          { camera: camera?.camera, scene },
        )
          .map((found) => {
            const meta = resolveElementMeta(found.object, filter);

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
      priority: 0,
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
  const controls = useContext(CameraControlsContext);
  const resolvedObject = resolvedObjects.at(0);

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
      on("element-focused-props", ({ props }) => {
        // When an element is selected the host will send all available prop names for it.
        // We use this list to determine which transform controls are available.
        setTransforms({
          rotate: props.includes("rotation"),
          scale: props.includes("scale"),
          translate: props.includes("position"),
        });
      }),
      on("request-open-component", (sceneObject) => {
        if (!sceneObject && !resolvedObject) {
          return;
        }

        if (
          !sceneObject &&
          resolvedObject &&
          resolvedObject.meta.originExportName &&
          resolvedObject.meta.originPath
        ) {
          switchToComponent({
            exportName: resolvedObject.meta.originExportName,
            path: resolvedObject.meta.originPath,
            props: encodeProps(resolvedObject),
          });

          send("element-blurred", undefined);
        }
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
  }, [controls, resolvedObject, resolvedObjects, scene, switchToComponent]);

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

      {!!resolvedObject && transform !== "none" && (
        <TransformControls
          enabled={
            /^[a-z]/.test(resolvedObject.meta.name)
              ? true
              : transforms[transform]
          }
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
