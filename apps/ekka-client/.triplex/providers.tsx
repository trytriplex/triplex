import { useFrame } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { createWorld } from "koota";
import { WorldProvider } from "koota/react";
import { useState } from "react";
import {
  applyDamage,
  damageWhenMoved,
  directEyeToPlayer,
  ekkaStateChange,
  stepPlayerInvulnerability,
  stepStateChangeTimer,
} from "../src/entities/ekka/systems";
import {
  applyVelocity,
  syncTransformsToMesh,
} from "../src/entities/shared/systems";
import {
  locomotionXR,
  locomotionXRDevOnly,
} from "../src/entities/xr-player/systems";
import { serialize } from "../src/lib/koota-debug";
import { capitalize } from "../src/lib/string";
import "../src/styles.css";

const systems = [
  stepPlayerInvulnerability,
  applyDamage,
  ekkaStateChange,
  directEyeToPlayer,
  locomotionXRDevOnly,
  locomotionXR,
  applyVelocity,
  syncTransformsToMesh,
  damageWhenMoved,
  stepStateChangeTimer,
];

type DebugECSSystems<T extends { dev?: boolean; systemName?: string }[]> = {
  [P in T[number] as P extends { dev?: infer D; systemName?: infer S }
    ? S extends string
      ? D extends true
        ? `run${Capitalize<S>}`
        : `pause${Capitalize<S>}`
      : never
    : never]?: boolean;
};

export function CanvasProvider({
  children,
  ...debugECSSystems
}: { children: React.ReactNode } & DebugECSSystems<typeof systems>) {
  const [store] = useState(() => createXRStore({ emulate: false }));
  const [world] = useState(() => createWorld());

  useFrame((state, delta) => {
    systems.forEach((system) => {
      const shouldRun = system.systemName
        ? system.dev
          ? debugECSSystems[`run${capitalize(system.systemName)}`]
          : !debugECSSystems[
              // The casting here is a bit of a hack to ge around the return types of systems not being well defined.
              `pause${capitalize(system.systemName)}` as keyof typeof debugECSSystems
            ]
        : true;

      if (shouldRun) {
        system(world, delta, state, store);
      }
    });

    const serialized = serialize(world);

    window.triplex?.api?.debug("ecs: players", serialized.players);
    window.triplex?.api?.debug("ecs: ekkas", serialized.ekkas);
    window.triplex?.api?.debug("ecs: ekka eyes", serialized.ekkaEyes);
  });

  return (
    <WorldProvider world={world}>
      <XR store={store}>{children}</XR>
    </WorldProvider>
  );
}
