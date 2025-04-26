import { add, multiply } from "../shared/math";
import { type ECSSystem } from "../types";
import { Mesh, Position, Velocity } from "./traits";

/** Copies the position trait value to the Three.js mesh position. */
export const meshFromPosition: ECSSystem = (world) => {
  const entities = world.query(Position, Mesh);

  for (const entity of entities) {
    const mesh = entity.get(Mesh);
    const position = entity.get(Position);

    if (mesh && position) {
      mesh.position.set(position.x, position.y, position.z);
    }
  }
};

/** Updates the position trait value based on the velocity and delta time. */
export const positionFromVelocity: ECSSystem = (world, delta) => {
  const entities = world.query(Position, Velocity);

  for (const entity of entities) {
    const velocity = entity.get(Velocity);
    const position = entity.get(Position);

    if (velocity && position) {
      const displacement = multiply(velocity, delta);
      const nextPosition = add(position, displacement);
      entity.set(Position, nextPosition);
    }
  }
};
