import { useFrame } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { createWorld } from "koota";
import { WorldProvider } from "koota/react";
import { useState } from "react";
import {
  applyVelocity,
  syncTransformsToMesh,
} from "../src/entities/shared/systems";
import { XRLocomotion } from "../src/entities/xr-player/systems";
import "../src/styles.css";

const systems = [XRLocomotion, applyVelocity, syncTransformsToMesh];

type DebugECSSystems = {
  [P in (typeof systems)[number]["systemName"]]?: boolean;
};

export function CanvasProvider({
  children,
  ...debugECSSystems
}: { children: React.ReactNode } & DebugECSSystems) {
  const [store] = useState(() => createXRStore({ emulate: false }));
  const [world] = useState(() => createWorld());

  useFrame((state, delta) => {
    systems.forEach((system) => {
      if (!debugECSSystems[system.systemName]) {
        system(world, delta, state, store);
      }
    });
  });

  return (
    <WorldProvider world={world}>
      <XR store={store}>{children}</XR>
    </WorldProvider>
  );
}
