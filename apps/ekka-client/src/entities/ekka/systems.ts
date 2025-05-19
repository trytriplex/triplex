import { createSystem } from "../shared/systems";
import { Scale } from "../shared/traits";
import { Ekka, EkkaEye, State, TimeSinceLastStateChange } from "./traits";

export const redLightGreenLight = createSystem((world) => {
  const entity = world.queryFirst(Ekka, TimeSinceLastStateChange, State);
  if (!entity) {
    return;
  }

  const timeSince = entity.get(TimeSinceLastStateChange)!;

  if (timeSince.value > 3) {
    const newState = Math.random() < 0.5 ? "active" : "idle";
    entity.set(State, { value: newState });
    entity.set(TimeSinceLastStateChange, { value: 0 });
  }
}, "redLightGreenLight");

export const ekkaEyeFocus = createSystem((world) => {
  const ekkaEntity = world.queryFirst(Ekka, State);
  const eyeEntities = world.query(EkkaEye);
  const state = ekkaEntity?.get(State);

  if (!state) {
    return;
  }

  eyeEntities.forEach((eye) => {
    if (state.value === "active") {
      eye.set(Scale, { x: 1, y: 1, z: 2 });
    } else {
      eye.set(Scale, { x: 1, y: 1, z: 1 });
    }
  });
}, "ekkaEyeFocus");

export const incrementTimer = createSystem((world, delta) => {
  const entity = world.queryFirst(TimeSinceLastStateChange);
  const timeSince = entity?.get(TimeSinceLastStateChange);

  if (!entity || !timeSince) {
    return;
  }

  const nextValue = timeSince.value + delta;
  entity.set(TimeSinceLastStateChange, { value: nextValue });
});
