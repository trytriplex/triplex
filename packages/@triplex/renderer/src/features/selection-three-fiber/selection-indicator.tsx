/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Vector2, type ShaderMaterial } from "three";
import { useFBO } from "triplex-drei";
import { hash } from "../../util/hash";
import {
  editorLayer,
  HOVER_LAYER_INDEX,
  SELECTION_LAYER_INDEX,
} from "../../util/layers";
import frag from "./selection-indicator.frag";
import vert from "./selection-indicator.vert";

export function SelectionIndicator() {
  const selectionFBO = useFBO();
  const hoveredFBO = useFBO();
  const material = useRef<ShaderMaterial>(null!);
  const [uViewportSize] = useState(
    () => new Vector2(selectionFBO.width, selectionFBO.height),
  );

  useFrame((state) => {
    uViewportSize.set(selectionFBO.height * 2, selectionFBO.width);

    const currentLayersMask = state.camera.layers.mask;
    const prevBg = state.scene.background;
    state.scene.background = null;

    state.gl.setRenderTarget(selectionFBO);
    state.camera.layers.set(SELECTION_LAYER_INDEX);
    state.gl.render(state.scene, state.camera);

    state.gl.setRenderTarget(hoveredFBO);
    state.camera.layers.set(HOVER_LAYER_INDEX);
    state.gl.render(state.scene, state.camera);

    state.gl.setRenderTarget(null);
    state.camera.layers.mask = currentLayersMask;
    state.scene.background = prevBg;
  });

  return (
    <mesh frustumCulled={false} layers={editorLayer} raycast={() => null}>
      <planeGeometry />
      <shaderMaterial
        depthTest={false}
        fragmentShader={frag}
        key={hash(frag + vert)}
        ref={material}
        transparent
        uniforms={{
          u_hoveredMask: { value: hoveredFBO.texture },
          u_lineColor: { value: [1.0, 1.0, 0.0] },
          u_lineWeight: { value: 2.0 },
          u_selectionMask: { value: selectionFBO.texture },
          u_viewportSize: { value: uViewportSize },
        }}
        vertexShader={vert}
      />
    </mesh>
  );
}
