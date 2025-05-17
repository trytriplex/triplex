import { useWorld } from "koota/react";
import { useEffect, useRef } from "react";
import { type Object3D } from "three";
import { Mesh, Position } from "../shared/traits";
import { Ekka } from "./traits";

export function EkkaEntity({
  position = [0, 0, 0],
}: {
  position?: [number, number, number];
}) {
  const world = useWorld();
  const ref = useRef<Object3D>(null);
  const [x, y, z] = position;

  useEffect(() => {
    const entity = world.spawn(Mesh(ref.current!), Ekka, Position({ x, y, z }));

    return () => {
      entity.destroy();
    };
  }, [world, x, y, z]);

  return (
    <group ref={ref}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.24, 3]} />
      </mesh>
    </group>
  );
}
