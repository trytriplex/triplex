import { type ReactNode } from "react";
import { KootaSystems, RootProviders } from "../src/providers";

export function GlobalProvider({ children }: { children: ReactNode }) {
  return <RootProviders>{children}</RootProviders>;
}

export function CanvasProvider({
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
  return (
    <KootaSystems
      cameraFollowFocusedSystem={cameraFollowFocusedSystem}
      cursorPositionFromLandSystem={cursorPositionFromLandSystem}
      positionFromVelocitySystem={positionFromVelocitySystem}
      velocityTowardsTargetSystem={velocityTowardsTargetSystem}
    >
      {children}
    </KootaSystems>
  );
}
