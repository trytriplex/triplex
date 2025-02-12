/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type Vector3Tuple } from "three";

function Box({
  position,
  rotation,
  scale,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  const ok = {};
  return (
    <group scale={scale} visible>
      <mesh
        {...ok}
        onClick={() => {}}
        position={position}
        rotation={rotation}
        userData={{ hello: true }}
        visible={true}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>
    </group>
  );
}

export default Box;

export function UseBox() {
  return <Box />;
}
