import { Not } from "koota";
import { createSystem } from "../shared/systems";
import { Changed, Position, Scale } from "../shared/traits";
import {
  Damaged,
  Health,
  IsDead,
  IsInvulnerable,
  IsPlayer,
} from "../xr-player/traits";
import {
  DamageModifier,
  IsEkka,
  IsEkkaEye,
  State,
  TimeSinceLastStateChange,
} from "./traits";

export const tryChangeEkkaState = createSystem((world) => {
  const entity = world.queryFirst(IsEkka, TimeSinceLastStateChange, State);
  if (!entity) {
    return;
  }

  const timeSince = entity.get(TimeSinceLastStateChange)!;

  if (timeSince.value > 3) {
    const newState = Math.random() < 0.5 ? "active" : "idle";
    entity.set(State, { value: newState });
    entity.set(TimeSinceLastStateChange, { value: 0 });
  }
}, "tryChangeEkkaState");

export const focusEkkaEyeTowardsPlayer = createSystem((world) => {
  const ekkaEntity = world.queryFirst(IsEkka, State);
  const eyeEntities = world.query(IsEkkaEye);
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
}, "focusEkkaEye");

export const incrementStateChangeTimer = createSystem((world, delta) => {
  const entity = world.queryFirst(TimeSinceLastStateChange);
  const timeSince = entity?.get(TimeSinceLastStateChange);

  if (!entity || !timeSince) {
    return;
  }

  const nextValue = timeSince.value + delta;
  entity.set(TimeSinceLastStateChange, { value: nextValue });
});

export const collectDamageIfPlayersMoved = createSystem((world) => {
  const ekka = world.queryFirst(IsEkka, DamageModifier);
  const modifier = ekka?.get(DamageModifier);
  const state = world.queryFirst(IsEkka, State)?.get(State);

  if (state?.value !== "active" || !modifier || !ekka) {
    return;
  }

  const playersThatHaveMoved = world.query(
    Changed(Position),
    Health,
    IsPlayer,
    Not(Damaged),
    Not(IsInvulnerable),
  );

  const multiplier = modifier.value;

  for (const player of playersThatHaveMoved) {
    player.set(Damaged, { value: 1 * multiplier });
  }

  ekka.set(DamageModifier, {
    value: modifier.value * 1.5,
  });
}, "collectDamage");

export const applyDamageToPlayers = createSystem((world) => {
  const damagedPlayers = world.query(Damaged, Health, IsPlayer, Not(IsDead));

  for (const player of damagedPlayers) {
    const health = player.get(Health);
    const damage = player.get(Damaged);

    if (!health || !damage) {
      continue;
    }

    const newHealth = health.value - damage.value;

    if (newHealth <= 0) {
      player.set(IsDead, { value: true });
      player.set(Health, { value: 0 });
    } else {
      player.set(Health, { value: newHealth });
      player.set(IsInvulnerable, { duration: 1, timePassed: 0 });
    }

    player.remove(Damaged);
  }
}, "applyDamage");

export const tryRemovePlayerInvulnerability = createSystem((world, delta) => {
  const players = world.query(IsInvulnerable, IsPlayer);

  for (const player of players) {
    const invulnerable = player.get(IsInvulnerable);
    if (!invulnerable) {
      continue;
    }

    const timePassed = invulnerable.timePassed + delta;

    if (timePassed >= invulnerable.duration) {
      player.remove(IsInvulnerable);
    } else {
      player.set(IsInvulnerable, {
        duration: invulnerable.duration,
        timePassed,
      });
    }
  }
});
