/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useRef } from "react";
import { type Group, type Vector3Tuple } from "three";
import { Component, Entity, useCurrentEntity } from "../ecs/store";

interface PointerProps {
  onClick?: (cells: Vector3Tuple) => void;
}

export function PointerEntity({ onClick: _ }: PointerProps) {
  const group = useRef<Group>(null);
  const parent = useCurrentEntity();

  return (
    <Entity>
      <Component data={parent} name="parent" />
      <Component data={true} name="pointer" />
      <Component name="sceneObject">
        <group ref={group} />
      </Component>
    </Entity>
  );
}
