import { distance, multiply, normalize, subtract } from "../../shared/math";
import { Position, Target, Velocity } from "../../shared/traits";
import { type ECSSystem } from "../../types";
import { Controllable, Speed } from "./traits";

/**
 * Sets the velocity of controllable entities towards the direction of the
 * target position. When the entity is close to the target, it slows down and
 * eventually stops.
 */
export const velocityTowardsTarget: ECSSystem = (world, delta) => {
  const entities = world.query(Controllable, Position, Velocity);
  const target = world.queryFirst(Position, Target);

  const targetPosition = target?.get(Position);
  if (!targetPosition) {
    return;
  }

  for (const entity of entities) {
    const position = entity.get(Position);
    const speed = entity.get(Speed)?.value || 1;

    if (position) {
      const distanceToTarget = distance(position, targetPosition);
      const stoppingDistance = delta * 3;

      // Calculate a speed factor that gradually approaches zero as we near the target
      const speedFactor = Math.max(
        0,
        Math.min(1, (distanceToTarget - stoppingDistance) / stoppingDistance),
      );

      // Apply the speed factor to smoothly transition to zero velocity
      const targetVelocity = multiply(
        normalize(subtract(targetPosition, position)),
        // Square for more natural deceleration
        speed * speedFactor * speedFactor,
      );

      entity.set(Velocity, targetVelocity);
    }
  }
};
