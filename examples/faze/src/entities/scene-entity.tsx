import { useMemo, useState } from "react";
import { Vector3Tuple } from "three";
import { Component, Entity } from "../ecs/store";
import { fromArray, empty } from "../math/vectors";
import { RigidBody } from "../ecs/components/rigid-body";

export const SceneEntity = ({
  speed = 1,
  position,
  children,
  components,
}: {
  children?: JSX.Element;
  components?: JSX.Element | JSX.Element[];
  speed?: number;
  position: Vector3Tuple;
}) => {
  const [initialPosition] = useState(() => position);
  const nextPosition = useMemo(() => fromArray(position), [position]);

  return (
    <Entity>
      <Component name="target" data={nextPosition} />
      <Component name="velocity" initialData={empty()} />
      <Component name="speed" data={speed} />
      <Component name="state" data="idle" />

      <RigidBody>
        <Component name="sceneObject">
          <group position={initialPosition} name="camera-target">
            {children}
          </group>
        </Component>
      </RigidBody>
      {components}
    </Entity>
  );
};
