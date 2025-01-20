/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { Cloud } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import { BoxGeometry, type BatchedMesh } from "three";

export function InstancedMeshScene() {
  return <Cloud />;
}

export function BatchedMeshScene() {
  const ref = useRef<BatchedMesh>(null);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const mesh = ref.current;
    const box = new BoxGeometry(1, 1, 1);
    const geometryId = mesh.addGeometry(box);
    const instanceId = mesh.addInstance(geometryId);

    return () => {
      mesh.deleteInstance(instanceId);
    };
  }, []);

  return (
    <batchedMesh args={[10, 5000, 10_000]} ref={ref}>
      <meshBasicMaterial color="lime" />
    </batchedMesh>
  );
}
