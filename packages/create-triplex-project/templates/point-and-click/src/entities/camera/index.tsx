import { OrthographicCamera } from "@react-three/drei";
import { useWorld } from "koota/react";
import { useEffect, useRef } from "react";
import { type OrthographicCamera as OrthographicCameraImpl } from "three";
import { Mesh, Position } from "../../shared/traits";
import { Camera as CameraTrait } from "./traits";

export function Camera({
  position = [0, 0, 0],
  rotation,
}: {
  position?: [x: number, y: number, z: number];
  rotation?: [x: number, y: number, z: number];
}) {
  const world = useWorld();
  const ref = useRef<OrthographicCameraImpl>(null);
  const [x, y, z] = position;

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const entity = world.spawn(
      CameraTrait,
      Position({ x, y, z }),
      Mesh(ref.current),
    );

    return () => {
      entity.destroy();
    };
  }, [world, x, y, z]);

  return (
    <OrthographicCamera makeDefault ref={ref} rotation={rotation} zoom={100} />
  );
}
