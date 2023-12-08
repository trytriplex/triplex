/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useTexture } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import { type Group, type Vector3Tuple } from "three";
import { KinematicBody } from "../ecs/components/kinematic-body";
import { Component, Entity } from "../ecs/store";
import { empty, fromArray } from "../math/vectors";
import { TERRAIN } from "../utils/layers";

type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

type Range<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

export function ElevatorEntity<TLevels extends [number, ...number[]]>({
  level,
  levels,
  position,
}: {
  /**
   * Current level the elevator is on.
   */
  level?: Range<0, TLevels["length"]>;
  /**
   * Y height of each level.
   */
  levels: TLevels;
  /**
   * Position of the elevator.
   */
  position: Vector3Tuple;
}) {
  const map = useTexture("/textures/light/texture_08.png");
  const ref = useRef<Group>(null!);
  const currentLevel: number = level || 0;
  const levelYValue = levels[currentLevel];
  const [initialPosition] = useState(() => {
    return [position[0], levelYValue, position[2]] as Vector3Tuple;
  });
  const nextPosition = useMemo(() => {
    const v = fromArray(position);
    v.y = levelYValue;
    return v;
  }, [levelYValue, position]);

  return (
    <Entity>
      <Component data={nextPosition} name="target" />
      <Component initialData={empty()} name="velocity" />
      <Component data={1} name="speed" />
      <Component data="idle" name="state" />

      <KinematicBody>
        <Component name="sceneObject">
          <group position={initialPosition} ref={ref}>
            <mesh
              castShadow
              layers={TERRAIN}
              position={[0, -2.8, 0]}
              receiveShadow
            >
              <boxGeometry args={[5, 5, 5]} />
              <meshStandardMaterial map={map} />
            </mesh>
          </group>
        </Component>
      </KinematicBody>
    </Entity>
  );
}
