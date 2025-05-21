import { createSystem } from "@triplex/api/koota";
import { Not, Or } from "koota";
import { PositionChanged, Scale } from "../shared/traits";
import {
  Damage,
  Health,
  IsDead,
  IsInvulnerable,
  IsPlayer,
  IsXRPlayer,
} from "../xr-player/traits";
import {
  DamageModifier,
  IsEkka,
  IsEkkaEye,
  State,
  TimeSinceLastStateChange,
} from "./traits";

export const ekkaStateChange = createSystem((world) => {
  const entity = world.queryFirst(
    IsEkka,
    DamageModifier,
    TimeSinceLastStateChange,
    State,
  );

  if (!entity) {
    return;
  }

  const timeSince = entity.get(TimeSinceLastStateChange)!;

  if (timeSince.value > 3) {
    const newState = Math.random() < 0.5 ? "active" : "idle";
    entity.set(State, { value: newState });
    entity.set(TimeSinceLastStateChange, { value: 0 });
  }
}, "stepEkkaState");

export const directEyeToPlayer = createSystem((world) => {
  const ekkaEntity = world.queryFirst(IsEkka, State);
  const eyeEntities = world.query(IsEkkaEye);
  const state = ekkaEntity?.get(State);

  if (!state) {
    return;
  }

  for (const eye of eyeEntities) {
    if (state.value === "active") {
      eye.set(Scale, { x: 1, y: 1, z: 2 });
    } else {
      eye.set(Scale, { x: 1, y: 1, z: 1 });
    }
  }
}, "directEyeToPlayer");

export const stepStateChangeTimer = createSystem((world, delta) => {
  const entity = world.queryFirst(TimeSinceLastStateChange);
  const timeSince = entity?.get(TimeSinceLastStateChange);

  if (!entity || !timeSince) {
    return;
  }

  const nextValue = timeSince.value + delta;
  entity.set(TimeSinceLastStateChange, { value: nextValue });
});

export const damageWhenMoved = createSystem((world) => {
  const ekka = world.queryFirst(IsEkka, DamageModifier);
  const modifier = ekka?.get(DamageModifier);
  const state = world.queryFirst(IsEkka, State)?.get(State);

  if (state?.value !== "active" || !modifier || !ekka) {
    return;
  }

  const players = world.query(
    PositionChanged,
    Or(IsPlayer, IsXRPlayer),
    Not(Damage),
    Not(IsDead),
    Not(IsInvulnerable),
  );

  if (players.length === 0) {
    return;
  }

  const multiplier = modifier.value;

  for (const player of players) {
    player.remove(PositionChanged);
    player.add(Damage({ value: 1 * multiplier }));
  }
}, "damageWhenMoved");

export const applyDamage = createSystem((world) => {
  const ekka = world.queryFirst(IsEkka, DamageModifier);
  const damagedPlayers = world.query(
    Damage,
    Health,
    Not(IsDead),
    Not(IsInvulnerable),
    Or(IsPlayer, IsXRPlayer),
  );

  if (damagedPlayers.length === 0 || !ekka) {
    return;
  }

  for (const player of damagedPlayers) {
    const health = player.get(Health);
    const damage = player.get(Damage);

    if (!health || !damage) {
      continue;
    }

    const newHealth = health.value - damage.value;

    if (newHealth <= 0) {
      player.add(IsDead);
      player.set(Health, { value: 0 });
      player.remove(Damage);
    } else {
      player.add(IsInvulnerable({ duration: 1, timePassed: 0 }));
      player.set(Health, { value: newHealth });
      player.remove(Damage);
    }
  }

  ekka.set(DamageModifier, (prev) => ({
    value: prev.value * 1.5,
  }));
}, "applyDamage");

export const stepPlayerInvulnerability = createSystem((world, delta) => {
  const players = world.query(IsInvulnerable, Or(IsPlayer, IsXRPlayer));

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
