import { PerspectiveCamera } from "@react-three/drei";
import { Layers } from "three";
import { Component, Entity } from "../ecs/store";
import { empty, fromArray } from "../math/vectors";
import { Vector3Tuple } from "../types";

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
  return (
    <Entity>
      <Component name="offset" data={offset ? fromArray(offset) : empty()} />
      <Component name="camera" data={true} />
      <Component name="sceneObject">
        <PerspectiveCamera
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
