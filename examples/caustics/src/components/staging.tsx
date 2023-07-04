/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Environment, Lightformer } from "@react-three/drei";

export function Staging({ color = "red" }: { color?: string }) {
  return (
    <group>
      <Environment
        frames={Infinity}
        preset="city"
        resolution={256}
        background
        blur={0.8}
      >
        <Lightformer
          intensity={4}
          rotation-x={Math.PI / 2}
          position={[0, 5, -9]}
          scale={[10, 10, 1]}
        />
        <Lightformer
          intensity={4}
          rotation-x={Math.PI / 2}
          position={[0, 5, -9]}
          scale={[10, 10, 1]}
        />
        <group rotation={[Math.PI / 2, 1, 0]}>
          {[2, -2, 2, -4, 2, -5, 2, -9].map((x, i) => (
            <Lightformer
              key={i}
              intensity={1}
              rotation={[Math.PI / 4, 0, 0]}
              position={[x, 4, i * 4]}
              scale={[4, 1, 1]}
            />
          ))}
          <Lightformer
            intensity={0.5}
            rotation-y={Math.PI / 2}
            position={[-5, 1, -1]}
            scale={[50, 2, 1]}
          />
          <Lightformer
            intensity={0.5}
            rotation-y={Math.PI / 2}
            position={[-5, -1, -1]}
            scale={[50, 2, 1]}
          />
          <Lightformer
            intensity={0.5}
            rotation-y={-Math.PI / 2}
            position={[10, 1, 0]}
            scale={[50, 2, 1]}
          />
        </group>
        <group>
          <Lightformer
            intensity={5}
            form="ring"
            color={color}
            rotation-y={Math.PI / 2}
            position={[-5, 2, -1]}
            scale={[10, 10, 1]}
          />
        </group>
      </Environment>
    </group>
  );
}
