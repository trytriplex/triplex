import { useFrame } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { injectSystems } from "@triplex/api/koota/xr";
import { createWorld } from "koota";
import { WorldProvider } from "koota/react";
import { useState } from "react";
import {
  applyDamage,
  damageWhenMoved,
  ekkaStateChange,
  stepPlayerInvulnerability,
  stepStateChangeTimer,
} from "../src/entities/ekka/systems";
import { checkPlayerExit } from "../src/entities/exit/systems";
import {
  applyVelocity,
  syncTransformsToMesh,
} from "../src/entities/shared/systems";
import {
  locomotionXR,
  locomotionXRDevOnly,
} from "../src/entities/xr-player/systems";
import { serialize } from "../src/lib/koota-debug";
import "../src/styles.css";

const systems = [
  checkPlayerExit,
  stepPlayerInvulnerability,
  applyDamage,
  ekkaStateChange,
  locomotionXRDevOnly,
  locomotionXR,
  applyVelocity,
  syncTransformsToMesh,
  damageWhenMoved,
  stepStateChangeTimer,
];

export const CanvasProvider = injectSystems(
  ({ children }: { children: React.ReactNode }) => {
    const [store] = useState(() => createXRStore({ emulate: false }));
    const [world] = useState(() => createWorld());

    useFrame(() => {
      const serialized = serialize(world);

      window.triplex?.debug("ecs: players", serialized.players);
      window.triplex?.debug("ecs: ekkas", serialized.ekkas);
      window.triplex?.debug("ecs: ekka eyes", serialized.ekkaEyes);
    });

    return (
      <WorldProvider world={world}>
        <XR store={store}>{children}</XR>
      </WorldProvider>
    );
  },
  systems,
);
