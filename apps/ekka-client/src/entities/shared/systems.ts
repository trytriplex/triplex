import { createSystem } from "@triplex/api/koota";
import { add, equal, multiply } from "../../lib/math";
import {
  Mesh,
  Position,
  PositionChanged,
  Rotation,
  Scale,
  Velocity,
} from "./traits";

/** Copies the transform trait values to the mesh trait value. */
export const syncTransformsToMesh = createSystem((world) => {
  const positioned = world.query(Position, Mesh);
  const scaled = world.query(Scale, Mesh);
  const rotated = world.query(Rotation, Mesh);

  for (const entity of positioned) {
    const mesh = entity.get(Mesh);
    const position = entity.get(Position);

    if (mesh && position) {
      mesh.position.set(position.x, position.y, position.z);
    }
  }

  for (const entity of scaled) {
    const mesh = entity.get(Mesh);
    const scale = entity.get(Scale);

    if (mesh && scale) {
      mesh.scale.set(scale.x, scale.y, scale.z);
    }
  }

  for (const entity of rotated) {
    const mesh = entity.get(Mesh);
    const rotation = entity.get(Rotation);

    if (mesh && rotation) {
      mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    }
  }
});

/** Updates the position trait value based on the velocity and delta time. */
export const applyVelocity = createSystem((world, delta) => {
  const entities = world.query(Position, Velocity);

  for (const entity of entities) {
    const velocity = entity.get(Velocity);
    const position = entity.get(Position);

    if (velocity && position) {
      const displacement = multiply(velocity, delta);
      const nextPosition = add(position, displacement);

      if (!equal(position, nextPosition)) {
        entity.add(PositionChanged);
        entity.set(Position, nextPosition);
        entity.set(Velocity, { x: 0, y: 0, z: 0 });
      }
    }
  }
}, "applyVelocity");
