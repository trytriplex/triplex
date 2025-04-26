import { useWorld } from "koota/react";
import { useEffect, useRef } from "react";
import { type Object3D } from "three";
import { Focused, Mesh, Position, Velocity } from "../../shared/traits";
import { Controllable, Speed } from "./traits";

export function Controller({
  children,
  position = [0, 0, 0],
  speed = 1,
}: {
  children: React.ReactNode;
  position?: [x: number, y: number, z: number];
  speed?: number;
}) {
  const world = useWorld();
  const ref = useRef<Object3D>(null);
  const [x, y, z] = position;

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const entity = world.spawn(
      Controllable,
      Focused,
      Mesh(ref.current),
      Position({ x, y, z }),
      Speed({ value: speed }),
      Velocity,
    );

    return () => {
      entity.destroy();
    };
  }, [speed, world, x, y, z]);

  return <group ref={ref}>{children}</group>;
}
