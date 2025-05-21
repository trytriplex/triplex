import { createXRControllerLocomotionUpdate } from "@pmndrs/xr";
import { createSystem } from "../shared/systems";
import { Rotation, Velocity } from "../shared/traits";
import { IsXRPlayer } from "./traits";

const update = createXRControllerLocomotionUpdate();

export const locomotionXR = createSystem((world, delta, state, store) => {
  const entity = world.queryFirst(IsXRPlayer, Velocity, Rotation);
  if (!entity || !store) {
    return;
  }

  update(
    (velocity, rotationYChange) => {
      entity.set(Velocity, {
        x: velocity.x,
        y: velocity.y,
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

    entity.set(Velocity, {
      z: -0.1,
    });
  },
  { dev: true, name: "devOnlyLocomotion" },
);
