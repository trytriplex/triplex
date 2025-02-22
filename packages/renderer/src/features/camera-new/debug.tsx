/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useContext, useEffect, useState } from "react";
import { Vector3 } from "three";
import { Tunnel } from "../../components/tunnel";
import { ActiveCameraContext, CameraControlsContext } from "./context";

export function CameraDebugPanel() {
  const camera = useContext(ActiveCameraContext);
  const controls = useContext(CameraControlsContext);
  const [pos, setPos] = useState<string | number>("");

  useEffect(() => {
    const id = setInterval(() => {
      setPos(
        controls
          ?.getTarget(new Vector3())
          .toArray()
          .map((p) => Math.round(p * 100) / 100)
          .join(",") || "(empty)",
      );
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [controls]);

  return (
    <Tunnel.In>
      <pre
        data-testid="camera-panel"
        style={{
          backgroundColor: "white",
          bottom: 4,
          left: 4,
          margin: 0,
          opacity: 0.5,
          padding: 4,
          pointerEvents: "none",
          position: "absolute",
        }}
      >
        {`name: ${camera?.camera.name || camera?.type}
pos: ${pos}`}
      </pre>
    </Tunnel.In>
  );
}
