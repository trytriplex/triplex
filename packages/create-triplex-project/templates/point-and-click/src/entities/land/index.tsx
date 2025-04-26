import { useWorld } from "koota/react";
import { useEffect, useRef, type ReactNode } from "react";
import { type Object3D } from "three";
import { Mesh } from "../../shared/traits";
import { Land as LandTrait } from "./traits";

export function Land({ children }: { children: ReactNode }) {
  const world = useWorld();
  const ref = useRef<Object3D>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const entity = world.spawn(Mesh(ref.current), LandTrait);

    return () => {
      entity.destroy();
    };
  }, [world]);

  return <group ref={ref}>{children}</group>;
}
