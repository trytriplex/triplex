import { createXRControllerLocomotionUpdate } from "@pmndrs/xr";
import { createSystem } from "@triplex/api/koota";
import { Rotation, Velocity } from "../shared/traits";
import { IsDead, IsXRPlayer } from "./traits";

const update = createXRControllerLocomotionUpdate();

export const locomotionXR = createSystem((world, delta, state, store) => {
  const entity = world.queryFirst(IsXRPlayer, Velocity, Rotation);
  if (!entity || !store) {
    return;
  }

  const isDead = entity.get(IsDead);
  if (isDead) {
    // Locomotion is disabled when dead.
    return;
  }

  update(
    (velocity, rotationYChange) => {
      entity.set(Velocity, {
        x: velocity.x,
        y: 0,
        z: velocity.z,
      });

      const currentRotation = entity.get(Rotation);
      const nextRotationY = (currentRotation?.y ?? 0) + rotationYChange;
      entity.set(Rotation, { y: nextRotationY });
    },
    store,
    state.camera,
    delta,
  );
});

export const locomotionXRDevOnly = createSystem(
  (world) => {
    const entity = world.queryFirst(IsXRPlayer, Velocity);
    if (!entity) {
      return;
    }

    const isDead = entity.get(IsDead);
    if (isDead) {
      // Locomotion is disabled when dead.
      return;
    }

    entity.set(Velocity, {
      z: -1,
    });
  },
  { dev: true, name: "devOnlyLocomotion" },
);
