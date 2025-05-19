import { useFrame } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { createWorld } from "koota";
import { WorldProvider } from "koota/react";
import { useState } from "react";
import {
  applyDamageToPlayers,
  collectDamageIfPlayersMoved,
  focusEkkaEyeTowardsPlayer,
  incrementStateChangeTimer,
  tryChangeEkkaState,
  tryRemovePlayerInvulnerability,
} from "../src/entities/ekka/systems";
import {
  applyVelocity,
  syncTransformsToMesh,
} from "../src/entities/shared/systems";
import { locomotionXR } from "../src/entities/xr-player/systems";
import { capitalize } from "../src/lib/string";
import "../src/styles.css";

const systems = [
  applyDamageToPlayers,
  incrementStateChangeTimer,
  tryChangeEkkaState,
  focusEkkaEyeTowardsPlayer,
  locomotionXR,
  applyVelocity,
  syncTransformsToMesh,
  collectDamageIfPlayersMoved,
  tryRemovePlayerInvulnerability,
];

type DebugECSSystems = {
  [P in (typeof systems)[number]["systemName"] as P extends string
    ? `pause${Capitalize<P>}`
    : never]?: boolean;
};

export function CanvasProvider({
  children,
  ...debugECSSystems
}: { children: React.ReactNode } & DebugECSSystems) {
  const [store] = useState(() => createXRStore({ emulate: false }));
  const [world] = useState(() => createWorld());

  useFrame((state, delta) => {
    systems.forEach((system) => {
      const propName = system.systemName
        ? (`pause${capitalize(system.systemName)}` as const)
        : undefined;
      if (!propName || !debugECSSystems[propName]) {
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
