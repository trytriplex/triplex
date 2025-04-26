import { damp } from "../../shared/math";
import { Focused, Position } from "../../shared/traits";
import { type ECSSystem, type Vector3 } from "../../types";
import { Camera } from "./traits";

/**
 * Updates the camera entities position trait based on the focused entity
 * position. If there is no focused entity or camera entity no changes are
 * made.
 */
export const cameraFollowFocused: ECSSystem = (world, delta) => {
  const focused = world.queryFirst(Focused, Position);
  const camera = world.queryFirst(Camera, Position);

  const focusedPosition = focused?.get(Position);
  const cameraPosition = camera?.get(Position);

  if (!camera || !cameraPosition || !focusedPosition) {
    return;
  }

  const lambda = 5;
  const offset = 2;
  const target: Vector3 = {
    x: focusedPosition.x - offset,
    y: cameraPosition.y,
    z: focusedPosition.z + offset,
  };

  if (cameraPosition.x === 0 && cameraPosition.z === 0) {
    // If we're setting the camera for the first time we skip damping to the target position.
    camera.set(Position, target);
  } else {
    camera.set(Position, damp(cameraPosition, target, lambda, delta));
  }
};
