/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export default function Sphere({ position, rotation, scale }) {
  return (
    <mesh
      castShadow={true}
      position={position}
      receiveShadow={true}
      rotation={rotation}
      scale={scale}
    >
      <sphereGeometry />
      <meshStandardMaterial color={"#84f4ea"} />
    </mesh>
  );
}
