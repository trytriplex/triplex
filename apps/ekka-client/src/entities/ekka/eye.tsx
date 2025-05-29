import { useQueryFirst, useTrait, useWorld } from "koota/react";
import { useEffect, useRef } from "react";
import { type Object3D, type Vector3Tuple } from "three";
import { Mesh, Position, Rotation, Scale } from "../shared/traits";
import { IsEkka, IsEkkaEye, State } from "./traits";

export function EkkaEyeEntity({
  position = [0, 0, 0],
}: {
  position?: Vector3Tuple;
}) {
  const world = useWorld();
  const ref = useRef<Object3D>(null);
  const ekkaEntity = useQueryFirst(IsEkka);
  const ekkaState = useTrait(ekkaEntity, State);
  const [x, y, z] = position;
  const isActive = ekkaState?.value === "active";
  const eyeColor = ekkaState ? (isActive ? "red" : "green") : "white";

  useEffect(() => {
    const entity = world.spawn(
      IsEkkaEye,
      Mesh(ref.current!),
      Position({ x, y, z }),
      Rotation,
      Scale,
    );

    return () => {
      entity.destroy();
    };
  }, [ekkaEntity, world, x, y, z]);

  return (
    <group ref={ref}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.025]} />
        <meshBasicMaterial
          color={eyeColor}
          opacity={isActive ? 1 : 0}
          transparent
        />
      </mesh>
    </group>
  );
}
