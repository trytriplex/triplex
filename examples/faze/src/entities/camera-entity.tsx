/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import { Layers } from "three";
import { Component, Entity } from "../ecs/store";
import { empty, fromArray } from "../math/vectors";
import { type Vector3Tuple } from "../types";

const layer = new Layers();
layer.enable(2);

export function CameraEntity({
  disabled = false,
  offset,
  rotation,
}: {
  disabled?: boolean;
  offset?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  const ref = useRef<any>(null);

  return (
    <Entity>
      <Component data={offset ? fromArray(offset) : empty()} name="offset" />
      <Component data={true} name="camera" />
      <Component data={ref as any} name="sceneObject">
        <PerspectiveCamera
          far={2000}
          fov={60}
          layers={layer}
          makeDefault={!disabled}
          near={0.1}
          ref={ref}
          rotation={rotation}
        />
      </Component>
    </Entity>
  );
}
