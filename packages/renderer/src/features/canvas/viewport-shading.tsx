/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useThree } from "@react-three/fiber";
import { on } from "@triplex/bridge/client";
import { useEffect, useRef } from "react";
import { MeshBasicMaterial, type Material } from "three";

type ViewportShadingMode = "wireframe" | "solid" | "material_preview";

/**
 * **ViewportShading**
 *
 * Component that listens for viewport shading events and applies material overrides
 * to render the scene in different view modes (wireframe, solid, material preview).
 */
export function ViewportShading() {
  const scene = useThree((store) => store.scene);
  const currentModeRef = useRef<ViewportShadingMode | null>(null);
  const userMaterialOverrideRef = useRef<Material | null>(null);

  useEffect(() => {
    // Store the original override material when component mounts
    // This captures any user-set material override that existed before this component
    userMaterialOverrideRef.current = scene.overrideMaterial;

    return on("extension-point-triggered", ({ id, scope }) => {
      if (scope !== "scene") {
        return;
      }

      let mode: ViewportShadingMode | null = null;

      // Determine the mode based on the event id
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

      // Store current mode
      currentModeRef.current = mode;

      switch (mode) {
        case "wireframe": {
          // Create wireframe material
          const wireframeMaterial = new MeshBasicMaterial({
            color: 0xff_ff_ff,
            wireframe: true,
          });
          // eslint-disable-next-line react-compiler/react-compiler
          scene.overrideMaterial = wireframeMaterial;
          break;
        }
        case "solid": {
          // Create solid material with flat shading for hard edges
          const solidMaterial = new MeshBasicMaterial({
            color: 0xcc_cc_cc,
            wireframe: false,
          });
          // eslint-disable-next-line react-compiler/react-compiler
          scene.overrideMaterial = solidMaterial;
          break;
        }
        case "material_preview": {
          // Restore to user material override or undefined for normal materials
          // eslint-disable-next-line react-compiler/react-compiler
          scene.overrideMaterial = userMaterialOverrideRef.current;
          break;
        }
      }
    });
  }, [scene]);

  // This component doesn't render anything visual
  return null;
}
