/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useFrame } from "@react-three/fiber";
import { bindAll } from "bind-event-listener";
import { useEffect, useRef, useState } from "react";
import { MathUtils, Vector2, type Object3D } from "three";

function remap(
  value: number,
  low1: number,
  high1: number,
  low2: number,
  high2: number,
): number {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

export function Avatar() {
  const ref = useRef<Object3D>(null!);
  const ghostRef = useRef<Object3D>(null!);
  const [pointer] = useState(new Vector2());

  useEffect(() => {
    return bindAll(document, [
      {
        listener: (event) => {
          pointer.set(event.clientX, event.clientY);
        },
        type: "mousemove",
      },
      {
        listener: () => {
          pointer.set(window.innerWidth / 2, window.innerHeight / 2);
        },
        type: "mouseout",
      },
    ]);
  }, [pointer]);

  useFrame((_, delta) => {
    // Convert the pointer position to a normalized coordinate system
    const x = (pointer.x / window.innerWidth) * 2 - 1;
    const y = -(pointer.y / window.innerHeight) * 2 + 1;

    // Remap the pointer so the avatar moves less across the directions it's closer to the viewport edge.
    const remappedX = remap(x, -1, 1, -0.5, 0.1);
    const remappedY = remap(y, -1, 1, -0.5, 0.1);

    // Lerp towards the remapped position
    ghostRef.current.position.set(
      MathUtils.damp(ghostRef.current.position.x, remappedX, 0.8, delta),
      MathUtils.damp(ghostRef.current.position.y, remappedY, 0.8, delta),
      1,
    );

    // Make the avatar look at the ghost mesh
    ref.current.lookAt(ghostRef.current.position);
  });

  return (
    <>
      <mesh ref={ghostRef}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh ref={ref}>
        <boxGeometry />
      </mesh>
    </>
  );
}
