/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import {
  Raycaster,
  Vector3,
  type Group,
  type Intersection,
  type Mesh,
  type Object3D,
  type Object3DEventMap,
  type Vector2,
  type Vector3Tuple,
} from "three";

const facingDownVector = new Vector3(0, -1, 0);

export function DeformableMeshControl({
  meshRef,
  onIntersect,
  position,
  radius = 0.1,
  raycastYOffset = 2,
}: {
  meshRef: React.RefObject<Mesh>;
  onIntersect?: (
    ...args:
      | [undefined]
      | [uv: Vector2, radius: number, coverage: number, depth: number]
  ) => void;
  position?: Vector3Tuple;
  radius?: number;
  raycastYOffset?: number;
}) {
  const ref = useRef<Group>(null);
  const [rayPos] = useState(() => new Vector3());
  const [raycaster] = useState(() => new Raycaster());
  const intersections = useRef<Intersection<Object3D<Object3DEventMap>>[]>([]);
  const [prevPos] = useState(() => new Vector3());

  useFrame(() => {
    if (
      !ref.current ||
      !meshRef.current ||
      prevPos.equals(ref.current.position)
    ) {
      // Bail out if refs aren't set or the position hasn't changed.
      return;
    }

    // Update the raycaster position to match the mesh size & position.
    raycaster.far = radius * 2 + raycastYOffset;
    rayPos.copy(ref.current.position);
    rayPos.y += radius + raycastYOffset;
    raycaster.set(rayPos, facingDownVector);

    // Trigger the intersection check.
    intersections.current.length = 0;
    raycaster.intersectObject(meshRef.current, false, intersections.current);
    prevPos.copy(ref.current.position);

    const intersection = intersections.current.at(0);

    if (onIntersect) {
      if (intersection && intersection.uv) {
        const distance = intersection.distance - raycastYOffset;
        const diameter = radius * 2;
        const percent = Math.abs(Math.round((distance / diameter) * 100) - 100);
        const remappedPercent = percent < 50 ? percent * 2 : 100;
        const coverage = (remappedPercent / 100) * (radius / 2);
        const depth = raycaster.far - intersection.distance;

        onIntersect(intersection.uv, radius, coverage, depth);
      } else {
        onIntersect(undefined);
      }
    }
  });

  return (
    <group position={position} ref={ref}>
      <Line
        points={[
          [0, radius, 0],
          [0, -radius, 0],
        ]}
      />
      <mesh castShadow={true} receiveShadow={true}>
        <sphereGeometry args={[radius]} />
        <meshBasicMaterial color="yellow" opacity={0.5} transparent />
      </mesh>
    </group>
  );
}
