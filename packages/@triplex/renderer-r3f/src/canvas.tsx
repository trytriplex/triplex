/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Canvas as RCanvas } from "@react-three/fiber";
import { usePlayState } from "./stores/state";
import { defaultLayer, editorLayer } from "./util/layers";

export function Canvas({ children }: { children: React.ReactNode }) {
  const playState = usePlayState();

  return (
    <RCanvas
      gl={{
        ...(typeof window.triplex.renderer.attributes.gl === "object"
          ? window.triplex.renderer.attributes.gl
          : undefined),
        antialias: false,
      }}
      raycaster={{
        layers:
          playState === "play"
            ? defaultLayer
            : // This forces the default r3f raycaster to be fired on a different layer (31)
              // than the default layer (0) that object3d's are set to default.
              editorLayer,
      }}
      shadows
      style={{ inset: 0, position: "absolute" }}
    >
      {children}
    </RCanvas>
  );
}
