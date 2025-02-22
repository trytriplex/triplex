/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type default as CameraControlsInstance } from "camera-controls";
import { useContext, useState, type ReactNode } from "react";
import { CameraControls as CameraControlsComponent } from "triplex-drei";
import { ActiveCameraContext, CameraControlsContext } from "./context";

export function CameraControls({ children }: { children: ReactNode }) {
  const camera = useContext(ActiveCameraContext);
  const [ref, setRef] = useState<CameraControlsInstance | null>(null);

  return (
    <CameraControlsContext.Provider value={ref}>
      {children}
      {camera?.type === "editor" && (
        <CameraControlsComponent
          // We don't want user land cameras to be able to be affected by these controls
          // So we explicitly set the camera instead of relying on "default camera" behaviour.
          camera={camera.camera}
          ref={setRef}
        />
      )}
    </CameraControlsContext.Provider>
  );
}
