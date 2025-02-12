/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
