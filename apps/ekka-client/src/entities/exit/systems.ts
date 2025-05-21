import { createSystem } from "@triplex/api/koota";
import { Not, Or } from "koota";
import { distance } from "../../lib/math";
import { Position } from "../shared/traits";
import { IsPlayer, IsXRPlayer } from "../xr-player/traits";
import { HasExited, IsExit } from "./traits";

export const checkPlayerExit = createSystem((world) => {
  const exits = world.query(IsExit, Position);
  const players = world.query(
    Not(HasExited),
    Or(IsXRPlayer, IsPlayer),
    Position,
  );

  for (const exit of exits) {
    const exitPosition = exit.get(Position)!;

    for (const player of players) {
      const position = player.get(Position)!;
      const distanceToExit = distance(exitPosition, position);

      if (distanceToExit < 1) {
        player.add(HasExited);
      }
    }
  }
});
