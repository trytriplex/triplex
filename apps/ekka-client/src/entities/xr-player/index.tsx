import { XROrigin } from "@react-three/xr";
import { type Entity } from "koota";
import { useWorld } from "koota/react";
import { useEffect, useRef } from "react";
import { type Group, type Vector3Tuple } from "three";
import { Mesh, Position, Rotation, Velocity } from "../shared/traits";
import { Health, IsXRPlayer } from "./traits";

export function XRPlayerEntity({
  position = [0, 0, 0],
}: {
  position?: Vector3Tuple;
}) {
  const [x, y, z] = position;
  const world = useWorld();
  const ref = useRef<Group>(null);
  const entity = useRef<Entity>(null);

  useEffect(() => {
    const spawned = world.spawn(
      Health,
      IsXRPlayer,
      Mesh(ref.current!),
      Position({ x, y, z }),
      Rotation,
      Velocity,
    );

    entity.current = spawned;

    return () => {
      spawned.destroy();
      entity.current = null;
    };
  }, [world, x, y, z]);

  return <XROrigin ref={ref} />;
}
