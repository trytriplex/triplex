/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createPortal, useFrame } from "@react-three/fiber";
import { useEvent } from "@triplex/lib";
import { Fragment, useLayoutEffect, useRef } from "react";
import { type Group, type Object3D, type Vector3Tuple } from "three";
import {
  TransformHandles,
  type TransformHandlesProperties,
} from "triplex-handle";
import { strip } from "../../util/three";
import { useSelectionStore } from "../selection-provider/store";

export type TransformMode = "rotate" | "scale" | "translate";

function resolveTransformValue(
  state: Parameters<NonNullable<TransformHandlesProperties["apply"]>>[0],
  mode: TransformMode,
): Vector3Tuple {
  if (mode === "translate") {
    const position = state.current.position.toArray();
    return position.map(strip) as Vector3Tuple;
  } else if (mode === "rotate") {
    const rotation = state.current.rotation.toArray();
    rotation.pop();
    return rotation as Vector3Tuple;
  } else if (mode === "scale") {
    const scale = state.current.scale.toArray();
    return scale.map(strip) as Vector3Tuple;
  } else {
    throw new Error("invariant");
  }
}

export interface TransformEvent {
  mode: TransformMode;
  value: Vector3Tuple;
}

export function WebXRTransformHandles({
  enabled,
  mode,
  object,
  onChange,
  onConfirm,
  onTransformEnd,
  onTransformStart,
  space,
}: {
  enabled?: boolean;
  mode: TransformMode;
  object: Object3D;
  onChange?: (e: TransformEvent) => void;
  onConfirm?: (e: TransformEvent) => void;
  onTransformEnd?: () => void;
  onTransformStart?: () => void;
  space?: "local" | "world";
}) {
  const ref = useRef<Group>(null);
  const setSelectionLock = useSelectionStore((store) => store.lock);
  const releaseSelectionLock = useSelectionStore((store) => store.release);

  const applyHandler = useEvent<
    NonNullable<TransformHandlesProperties["apply"]>
  >((state) => {
    if (state.first) {
      setSelectionLock();
      onTransformStart?.();
    }

    onChange?.({
      mode,
      value: resolveTransformValue(state, mode),
    });

    if (state.last) {
      onConfirm?.({
        mode,
        value: resolveTransformValue(state, mode),
      });

      onTransformEnd?.();

      requestAnimationFrame(() => {
        /**
         * This is an easy way to ensure that any changes to the selection state
         * are skipped until the transform has settled. This is because we're
         * not using the inbuilt XR event system resulting in our custom events
         * firing at the same time as we release the transform handles.
         */
        releaseSelectionLock();
      });
    }
  });

  useFrame(() => {
    if (!ref.current) {
      return;
    }

    ref.current.position.copy(object.position);
    ref.current.quaternion.copy(object.quaternion);
    ref.current.scale.copy(object.scale);
  });

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.position.copy(object.position);
    ref.current.quaternion.copy(object.quaternion);
    ref.current.scale.copy(object.scale);
  }, [object]);

  if (!object.parent) {
    return null;
  }

  return (
    <Fragment key={object.id}>
      {createPortal(
        <TransformHandles
          apply={applyHandler}
          enabled={enabled}
          mode={mode}
          ref={ref}
          size={0.5}
          space={space}
        >
          <group />
        </TransformHandles>,
        /**
         * It's important that the placeholder is rendered at the same scene
         * position as the object otherwise inherited transforms from parents
         * will end up being super whacky.
         */
        object.parent,
      )}
    </Fragment>
  );
}
