/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type Object3D } from "three";
import { type VectorXyz } from "../math/vectors";
import { type BoundingBoxRef } from "../systems/bounding-box";
import { type Item } from "./components/item";

export interface OnWorldEventHandler {
  (
    event:
      | "target-reached"
      | "move-start"
      | "move-stop"
      | "player-approach"
      | "player-leave",
  ): void;
}

export interface EntityComponents {
  /** Entity components */
  activateDistance?: number;
  /** Entity tags */
  billboard?: true;
  box?: BoundingBoxRef;
  camera?: true;
  count?: number;
  description?: string;
  dialog?: true;
  focused?: true;
  followPointer?: true;
  gravityAcceleration?: number;
  inventory?: Partial<Record<Item, number>>;

  item?: true;
  kinematicBody?: true;
  name?: string;
  npc?: true;
  offset?: VectorXyz;
  /** Entity callbacks */
  onWorldEvent?: OnWorldEventHandler;
  parent?: EntityComponents;
  player?: true;
  playerNear?: boolean;
  pointer?: true;
  rest?: number;
  rigidBody?: true;
  sceneObject?: { current: Object3D };
  speed?: number;
  state?: "moving" | "idle";
  target?: VectorXyz;
  velocity?: VectorXyz;

  zoom?: number;
}
