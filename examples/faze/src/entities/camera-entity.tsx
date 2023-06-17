/* eslint-disable @typescript-eslint/no-explicit-any */
import { PerspectiveCamera } from "@react-three/drei";
import { Layers } from "three";
import { Component, Entity } from "../ecs/store";
import { empty, fromArray } from "../math/vectors";
import { Vector3Tuple } from "../types";
import { useRef } from "react";

const layer = new Layers();
layer.enable(2);

export function CameraEntity({
  offset,
  rotation,
  disabled = false,
}: {
  offset?: Vector3Tuple;
  rotation?: Vector3Tuple;
  disabled?: boolean;
}) {
  const ref = useRef<any>(null);

  return (
    <Entity>
      <Component name="offset" data={offset ? fromArray(offset) : empty()} />
      <Component name="camera" data={true} />
      <Component name="sceneObject" data={ref as any}>
        <PerspectiveCamera
          ref={ref}
          makeDefault={!disabled}
          far={2000}
          fov={60}
          near={0.1}
          rotation={rotation}
          layers={layer}
        />
      </Component>
    </Entity>
  );
}
