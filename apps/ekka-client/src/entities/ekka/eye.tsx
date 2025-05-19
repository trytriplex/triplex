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
  const eyeColor = ekkaState
    ? ekkaState.value === "active"
      ? "red"
      : "green"
    : "white";

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
      <mesh position={[0, 0, 0.25]}>
        <boxGeometry args={[0.2, 0.2, 0.5]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>
    </group>
  );
}
