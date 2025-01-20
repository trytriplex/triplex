/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function GLSLErrorAll() {
  return (
    <mesh>
      <boxGeometry />
      <shaderMaterial fragmentShader="{invalid(" vertexShader="(invalid{" />
    </mesh>
  );
}

export function GLSLErrorVertex() {
  return (
    <mesh>
      <boxGeometry />
      <shaderMaterial vertexShader="(invalid{" />
    </mesh>
  );
}

export function GLSLErrorFragment() {
  return (
    <mesh>
      <boxGeometry />
      <shaderMaterial fragmentShader="{invalid(" />
    </mesh>
  );
}
