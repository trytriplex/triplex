/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { SceneObject } from "../../scene-object";

export function CustomBoxGroup({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <SceneObject
      __component="group"
      __meta={{
        column: 0,
        line: 1,
        name: "group",
        path: "custom-box.tsx",
        rotate: false,
        scale: false,
        // Position is statically defined therefore this is true.
        translate: true,
      }}
      name="custom-box-group"
      position={position}
    >
      <SceneObject
        __component="mesh"
        __meta={{
          column: 0,
          line: 2,
          name: "mesh",
          path: "custom-box.tsx",
          rotate: false,
          scale: false,
          translate: true,
        }}
        name="custom-box-mesh"
        position={[1, 1, 1]}
      >
        <boxGeometry />
      </SceneObject>
    </SceneObject>
  );
}
