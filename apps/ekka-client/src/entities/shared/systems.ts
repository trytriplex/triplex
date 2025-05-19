import { add, multiply } from "../../lib/math";
import { Mesh, Position, Rotation, Scale, Velocity } from "./traits";
import { type ECSSystem } from "./types";

export function createSystem<TName extends string = never>(
  ...args: [system: ECSSystem, name: TName] | [system: ECSSystem]
): ECSSystem & { systemName?: TName } {
  if (args.length === 1) {
    return args[0];
  }

  const system = args[0] as ECSSystem & { systemName: TName };
  system.systemName = args[1];
  return system;
}

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
      entity.set(Position, nextPosition);
      entity.set(Velocity, { x: 0, y: 0, z: 0 });
    }
  }
}, "applyVelocity");
