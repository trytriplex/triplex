import { useThree } from "@react-three/fiber";
import { useCallback } from "react";
import { Mesh, Position } from "../../shared/traits.tsx";
import { type ECSSystemHook } from "../../types.tsx";
import { Cursor } from "../cursor/traits.tsx";
import { Land } from "./traits.tsx";

/**
 * Updates the cursor trait position based on where the React Three Fiber
 * pointer intersects land entities.
 */
export const useCursorPositionFromLand: ECSSystemHook = () => {
  const raycaster = useThree((state) => state.raycaster);
  const pointer = useThree((state) => state.pointer);

  return useCallback(
    (world) => {
      const lands = world.query(Land, Mesh);
      const cursor = world.queryFirst(Cursor, Position);

      if (!cursor || lands.length === 0) {
        return;
      }

      raycaster.setFromCamera(pointer, raycaster.camera);

      const objects = lands
        .map((land) => land.get(Mesh))
        .filter((mesh) => !!mesh);

      const intersects = raycaster.intersectObjects(objects).at(0);

      if (intersects) {
        cursor.set(Position, {
          x: intersects.point.x,
          y: intersects.point.y,
          z: intersects.point.z,
        });
      }
    },
    [raycaster, pointer],
  );
};
