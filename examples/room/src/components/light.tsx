/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export function Light() {
  return (
    <group>
      <directionalLight
        castShadow
        intensity={5}
        position={[5, 5, -8]}
        shadow-bias={-0.001}
        shadow-mapSize={2048}
      >
        <orthographicCamera
          args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]}
          attach="shadow-camera"
        />
      </directionalLight>
    </group>
  );
}
