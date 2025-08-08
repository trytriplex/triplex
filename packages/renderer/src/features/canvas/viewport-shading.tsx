/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useThree } from "@react-three/fiber";
import { on } from "@triplex/bridge/client";
import { useEffect, useRef } from "react";
import { MeshBasicMaterial } from "three";

type ViewportShadingMode = "wireframe" | "solid" | "material_preview";

/**
 * **ViewportShading**
 *
 * Component that listens for viewport shading events and applies material overrides
 * to render the scene in different view modes (wireframe, solid, material preview).
 */
export function ViewportShading() {
  const scene = useThree((store) => store.scene);
  const userMaterialOverrideRef = useRef(null);

  useEffect(() => {
    return on("extension-point-triggered", ({ id, scope }) => {
      if (scope !== "scene") {
        return;
      }

      let mode: ViewportShadingMode | null = null;

      if (id === "viewport_shading_wireframe") {
        mode = "wireframe";
      } else if (id === "viewport_shading_solid") {
        mode = "solid";
      } else if (id === "viewport_shading_material_preview") {
        mode = "material_preview";
      }

      if (!mode) {
        return;
      }

      // Capture the current override material at the time the event is called
      if (mode !== "material_preview") {
        userMaterialOverrideRef.current = scene.overrideMaterial;
      }

      switch (mode) {
        case "wireframe": {
          const wireframeMaterial = new MeshBasicMaterial({
            color: 0xff_ff_ff,
            wireframe: true,
          });
          // eslint-disable-next-line react-compiler/react-compiler
          scene.overrideMaterial = wireframeMaterial;
          break;
        }
        case "solid": {
          const solidMaterial = new MeshBasicMaterial({
            color: 0xcc_cc_cc,
            wireframe: false,
          });
          // eslint-disable-next-line react-compiler/react-compiler
          scene.overrideMaterial = solidMaterial;
          break;
        }
        case "material_preview": {
          // eslint-disable-next-line react-compiler/react-compiler
          scene.overrideMaterial = userMaterialOverrideRef.current;
          break;
        }
      }
    });
  }, [scene]);

  return null;
}
