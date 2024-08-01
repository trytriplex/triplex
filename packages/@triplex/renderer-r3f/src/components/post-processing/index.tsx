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
import { editorLayer, SELECTION_LAYER_INDEX } from "../../util/layers";
import frag from "./frag.glsl";
import vert from "./vert.glsl";

function hash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  // Convert to 32bit unsigned integer in base 36 and pad with "0" to ensure length is 7.
  return (hash >>> 0).toString(36).padStart(7, "0");
}

export function PostProcessing({ debug = false }: { debug?: boolean }) {
  const renderTarget = useFBO();
  const material = useRef<ShaderMaterial>(null!);
  const [uViewportSize] = useState(
    () => new Vector2(renderTarget.width, renderTarget.height),
  );

  useFrame((state) => {
    const prevBg = state.scene.background;
    state.scene.background = null;
    state.gl.setRenderTarget(renderTarget);
    state.camera.layers.set(SELECTION_LAYER_INDEX);
    uViewportSize.set(renderTarget.height * 2, renderTarget.width);

    state.gl.render(state.scene, state.camera);

    state.gl.setRenderTarget(null);
    state.camera.layers.enableAll();
    state.scene.background = prevBg;
  });

  return (
    <>
      <mesh frustumCulled={false} layers={editorLayer} raycast={() => null}>
        <planeGeometry />
        <shaderMaterial
          depthTest={false}
          fragmentShader={frag}
          key={hash(frag + vert)}
          ref={material}
          transparent
          uniforms={{
            u_maskTexture: { value: renderTarget.texture },
            u_viewportSize: { value: uViewportSize },
          }}
          vertexShader={vert}
        />
      </mesh>
      {debug && (
        <mesh layers={editorLayer} position={[-1, 0, 0]} raycast={() => null}>
          <planeGeometry args={[5, 5]} />
          <meshBasicMaterial map={renderTarget.texture} />
        </mesh>
      )}
    </>
  );
}
