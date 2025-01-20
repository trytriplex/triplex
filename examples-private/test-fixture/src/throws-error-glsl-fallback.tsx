/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function GLSLErrorFallback() {
  return (
    <mesh>
      <boxGeometry />
      <shaderMaterial
        fragmentShader={`
varying vec2 v_uv;

void main() {
gl_FragColor = vec4(v_uv, 0.0, 0.0);
}
        `}
      />
    </mesh>
  );
}
