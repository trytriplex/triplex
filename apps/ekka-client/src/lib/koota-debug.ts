import { type Entity, type World } from "koota";
import {
  DamageModifier,
  IsEkka,
  IsEkkaEye,
  State,
  TimeSinceLastStateChange,
} from "../entities/ekka/traits";
import { Position, Rotation, Scale, Velocity } from "../entities/shared/traits";
import { Health, IsPlayer } from "../entities/xr-player/traits";

function positionalTraits(entity: Entity) {
  return {
    position: entity.get(Position),
    rotation: entity.get(Rotation),
    scale: entity.get(Scale),
    velocity: entity.get(Velocity),
  };
}

export function serialize(world: World) {
  const players = world.query(IsPlayer).map((entity) => ({
    ...positionalTraits(entity),
    health: entity.get(Health),
  }));

  const ekkas = world.query(IsEkka).map((entity) => ({
    ...positionalTraits(entity),
    damageModifier: entity.get(DamageModifier),
    health: entity.get(Health),
    state: entity.get(State),
    timeSince: entity.get(TimeSinceLastStateChange),
  }));

  const ekkaEyes = world.query(IsEkkaEye).map((entity) => ({
    ...positionalTraits(entity),
  }));

  return { ekkaEyes, ekkas, players };
}
