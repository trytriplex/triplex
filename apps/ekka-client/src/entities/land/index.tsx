import { useWorld } from "koota/react";
import { useEffect, useRef, type ReactNode } from "react";
import { type Object3D } from "three";
import { Mesh } from "../shared/traits";
import { Land } from "./traits";

export function LandEntity({ children }: { children: ReactNode }) {
  const world = useWorld();
  const ref = useRef<Object3D>(null);

  useEffect(() => {
    const entity = world.spawn(Mesh(ref.current!), Land);

    return () => {
      entity.destroy();
    };
  }, [world]);

  return <group ref={ref}>{children}</group>;
}
