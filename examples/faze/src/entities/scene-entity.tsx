/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef } from "react";
import { type Vector3Tuple } from "three";
import { RigidBody } from "../ecs/components/rigid-body";
import { Component, Entity } from "../ecs/store";
import { empty, fromArray } from "../math/vectors";

export const SceneEntity = ({
  children,
  components,
  position,
  speed = 1,
}: {
  children?: JSX.Element;
  components?: JSX.Element | JSX.Element[];
  position: Vector3Tuple;
  speed?: number;
}) => {
  const nextPosition = useMemo(() => fromArray(position), [position]);
  const ref = useRef<any>(null);

  return (
    <Entity>
      <Component data={nextPosition} name="target" />
      <Component initialData={empty()} name="velocity" />
      <Component data={speed} name="speed" />
      <Component data="idle" name="state" />

      <RigidBody>
        <Component data={ref as any} name="sceneObject">
          <group name="camera-target" position={position} ref={ref}>
            {children}
          </group>
        </Component>
      </RigidBody>
      {components}
    </Entity>
  );
};
