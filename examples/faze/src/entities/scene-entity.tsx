/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef } from "react";
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
  const nextPosition = useMemo(() => fromArray(position), [position]);
  const ref = useRef<any>(null);

  return (
    <Entity>
      <Component name="target" data={nextPosition} />
      <Component name="velocity" initialData={empty()} />
      <Component name="speed" data={speed} />
      <Component name="state" data="idle" />

      <RigidBody>
        <Component name="sceneObject" data={ref as any}>
          <group position={position} ref={ref} name="camera-target">
            {children}
          </group>
        </Component>
      </RigidBody>
      {components}
    </Entity>
  );
};
