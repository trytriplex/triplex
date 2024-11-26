/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useState } from "react";
import { type Camera, type PerspectiveCamera as PCT } from "three";
import { PerspectiveCamera, useFBO } from "triplex-drei";
import { hash } from "../../util/hash";
import { HIDDEN_LAYER_INDEX } from "../../util/layers";
import frag from "./frag.glsl";
import vert from "./vert.glsl";

export function CameraPreview({ camera }: { camera: Camera }) {
  const renderTarget = useFBO();
  const scene = useThree((state) => state.scene);

  useFrame((state) => {
    state.gl.setRenderTarget(renderTarget);
    state.gl.render(state.scene, camera);
    state.gl.setRenderTarget(null);
  });

  return createPortal(
    <mesh frustumCulled={false} layers={HIDDEN_LAYER_INDEX}>
      <planeGeometry />
      <shaderMaterial
        fragmentShader={frag}
        key={hash(frag + vert)}
        uniforms={{
          u_texture: { value: renderTarget.texture },
        }}
        vertexShader={vert}
      />
    </mesh>,
    scene,
  );
}

export function DebugCameraPreview() {
  const [camera, setCamera] = useState<PCT | null>(null);

  return (
    <>
      <pointLight intensity={50} position={[0, 1.26, 0.08]} />
      <mesh
        position={[0, 0, -1.92]}
        rotation={[
          0.805_805_810_130_845_3, 0.075_686_512_441_604_86,
          -0.318_914_675_145_116_84,
        ]}
        scale={[0.52, 0.52, 0.52]}
      >
        <boxGeometry />
        <meshStandardMaterial color="blue" />
      </mesh>
      <PerspectiveCamera ref={(val) => setCamera(val)} />
      {camera && <CameraPreview camera={camera} />}
    </>
  );
}
