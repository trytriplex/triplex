import { useFrame } from "@react-three/fiber";
import { createWorld } from "koota";
import { useWorld, WorldProvider } from "koota/react";
import { createContext, use, useMemo, type ReactNode } from "react";
import { cameraFollowFocused } from "../src/entities/camera/systems";
import { velocityTowardsTarget } from "../src/entities/controller/systems";
import { useCursorPositionFromLand } from "../src/entities/land/systems";
import { meshFromPosition, positionFromVelocity } from "../src/shared/systems";

export function RootProviders({ children }: { children: ReactNode }) {
  const world = useMemo(() => createWorld(), []);

  return <WorldProvider world={world}>{children}</WorldProvider>;
}

const NestedCheck = createContext(false);

export function KootaSystems({
  cameraFollowFocusedSystem = true,
  children,
  cursorPositionFromLandSystem = true,
  positionFromVelocitySystem = true,
  velocityTowardsTargetSystem = true,
}: {
  cameraFollowFocusedSystem?: boolean;
  children: ReactNode;
  cursorPositionFromLandSystem?: boolean;
  positionFromVelocitySystem?: boolean;
  velocityTowardsTargetSystem?: boolean;
}) {
  const isNested = use(NestedCheck);
  const world = useWorld();
  const cursorPositionFromLand = useCursorPositionFromLand();

  useFrame((_, delta) => {
    if (isNested) {
      // This turns off the systems if they are already running in a parent component.
      // This can happen when running inside Triplex as the systems are running in the CanvasProvider.
      return;
    }

    if (cursorPositionFromLandSystem) {
      cursorPositionFromLand(world, delta);
    }

    if (velocityTowardsTargetSystem) {
      velocityTowardsTarget(world, delta);
    }

    if (positionFromVelocitySystem) {
      positionFromVelocity(world, delta);
    }

    meshFromPosition(world, delta);

    if (cameraFollowFocusedSystem) {
      cameraFollowFocused(world, delta);
    }
  });

  return <NestedCheck value>{children}</NestedCheck>;
}
