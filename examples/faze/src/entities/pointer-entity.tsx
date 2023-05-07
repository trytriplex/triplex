import { useRef } from "react";
import { Group, Vector3Tuple } from "three";
import { Component, Entity, useCurrentEntity } from "../ecs/store";

interface PointerProps {
  onClick?: (cells: Vector3Tuple) => void;
}

export function PointerEntity({ onClick: _ }: PointerProps) {
  const group = useRef<Group>(null);
  const parent = useCurrentEntity();

  return (
    <Entity>
      <Component name="parent" data={parent} />
      <Component name="pointer" data={true} />
      <Component name="sceneObject">
        <group ref={group} />
      </Component>
    </Entity>
  );
}
