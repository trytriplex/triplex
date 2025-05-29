import { useWorld } from "koota/react";
import { useEffect, useRef } from "react";
import { type Object3D, type Vector3Tuple } from "three";
import { Mesh, Position } from "../shared/traits";
import { IsExit } from "./traits";

export function ExitEntity({
  position = [0, 0, 0],
}: {
  position?: Vector3Tuple;
}) {
  const world = useWorld();
  const ref = useRef<Object3D>(null);
  const [x, y, z] = position;

  useEffect(() => {
    const entity = world.spawn(
      IsExit,
      Mesh(ref.current!),
      Position({ x, y, z }),
    );

    return () => {
      entity.destroy();
    };
  }, [world, x, y, z]);

  return (
    <group ref={ref}>
      <mesh position={[0, 1, -9.1]}>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}
