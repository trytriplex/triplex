import { XROrigin } from "@react-three/xr";
import { type Entity } from "koota";
import { useWorld } from "koota/react";
import { useEffect, useRef } from "react";
import { type Group } from "three";
import { Mesh, Position, Rotation, Velocity } from "../shared/traits";
import { XRPlayer } from "./traits";

export function XRPlayerEntity({
  position = [0, 0, 0],
}: {
  position?: [number, number, number];
}) {
  const [x, y, z] = position;
  const world = useWorld();
  const ref = useRef<Group>(null);
  const entity = useRef<Entity>(null);

  useEffect(() => {
    const spawned = world.spawn(
      Mesh(ref.current!),
      Position({ x, y, z }),
      Rotation,
      XRPlayer,
      Velocity,
    );

    entity.current = spawned;

    return () => {
      spawned.destroy();
      entity.current = null;
    };
  }, [world, x, y, z]);

  return (
    <XROrigin ref={ref}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
      </mesh>
    </XROrigin>
  );
}
