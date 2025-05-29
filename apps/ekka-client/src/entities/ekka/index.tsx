import { useWorld } from "koota/react";
import { useEffect, useRef } from "react";
import { type Object3D, type Vector3Tuple } from "three";
import { Kasa } from "../../components/characters/kasa";
import { Mesh, Position } from "../shared/traits";
import { XRPlayerEntity } from "../xr-player";
import { EkkaEyeEntity } from "./eye";
import {
  DamageModifier,
  IsEkka,
  State,
  TimeSinceLastStateChange,
} from "./traits";

export function EkkaEntity({
  position = [0, 0, 0],
  scale,
}: {
  position?: Vector3Tuple;
  scale?: number;
}) {
  const world = useWorld();
  const ref = useRef<Object3D>(null);
  const [x, y, z] = position;

  useEffect(() => {
    const entity = world.spawn(
      DamageModifier,
      IsEkka,
      Mesh(ref.current!),
      Position({ x, y, z }),
      State,
      TimeSinceLastStateChange,
    );

    return () => {
      entity.destroy();
    };
  }, [world, x, y, z]);

  return (
    <group castShadow ref={ref} scale={scale}>
      <Kasa>
        <EkkaEyeEntity position={[-0.036, 0.34, 0.05]} />
        <EkkaEyeEntity position={[0.05, 0.34, 0.04]} />
      </Kasa>
    </group>
  );
}

export function Example() {
  return (
    <>
      <EkkaEntity />
      <XRPlayerEntity position={[0, 0, 1.49]} />
    </>
  );
}
