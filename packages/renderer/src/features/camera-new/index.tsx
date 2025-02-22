/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ReactNode } from "react";
import { CameraControls } from "./camera-controls";
import { Cameras } from "./cameras";
import { CameraDebugPanel } from "./debug";

export function Camera({ children }: { children?: ReactNode }) {
  return (
    <Cameras>
      <CameraControls>
        {children}
        {import.meta.env.VITE_TRIPLEX_ENV === "test" && <CameraDebugPanel />}
      </CameraControls>
    </Cameras>
  );
}
