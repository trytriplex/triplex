/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useBillboard } from "./systems/billboard";
import { useCamera } from "./systems/camera";
import { useDeactivateItem } from "./systems/deactivate-item";
import { useDeactivateNpcs } from "./systems/deactivate-npcs";
import { useDialogController } from "./systems/dialog-controller";
import { useGravity } from "./systems/gravity";
import { useKinematicBody } from "./systems/kinematic-body";
import { useLookAtTarget } from "./systems/look-at-target";
import { usePlayerApproach } from "./systems/player-approach";
import { useRest } from "./systems/rest";
import { useRigidBody } from "./systems/rigid-body";
import { useTargetController } from "./systems/target-controller";
import { useTerrainPointer } from "./systems/terrain-pointer";

export function Systems() {
  useTargetController();
  useTerrainPointer();
  useRest();
  useGravity();
  useRigidBody();
  useKinematicBody();
  usePlayerApproach();
  useLookAtTarget();
  useDeactivateItem();
  useDeactivateNpcs();
  useDialogController();
  useCamera();
  useBillboard();

  return null;
}
