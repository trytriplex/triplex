import { useTexture } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import { Group, Vector3Tuple } from "three";
import { Component, Entity } from "../ecs/store";
import { empty, fromArray } from "../math/vectors";
import { KinematicBody } from "../ecs/components/kinematic-body";
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
  position,
  levels,
  level,
}: {
  /**
   * Current level the elevator is on.
   */
  level?: Range<0, TLevels["length"]>;
  /**
   * Position of the elevator.
   */
  position: Vector3Tuple;
  /**
   * Y height of each level.
   */
  levels: TLevels;
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
      <Component name="target" data={nextPosition} />
      <Component name="velocity" initialData={empty()} />
      <Component name="speed" data={1} />
      <Component name="state" data="idle" />

      <KinematicBody>
        <Component name="sceneObject">
          <group position={initialPosition} ref={ref}>
            <mesh
              layers={TERRAIN}
              castShadow
              receiveShadow
              position={[0, -2.8, 0]}
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
