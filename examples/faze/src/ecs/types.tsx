import { Object3D } from "three";
import { VectorXyz } from "../math/vectors";
import { BoundingBoxRef } from "../systems/bounding-box";
import { Item } from "./components/item";

export interface OnWorldEventHandler {
  (
    event:
      | "target-reached"
      | "move-start"
      | "move-stop"
      | "player-approach"
      | "player-leave"
  ): void;
}

export interface EntityComponents {
  /**
   * Entity tags
   */
  billboard?: true;
  camera?: true;
  dialog?: true;
  focused?: true;
  followPointer?: true;
  item?: true;
  kinematicBody?: true;
  npc?: true;
  player?: true;
  pointer?: true;
  rigidBody?: true;

  /**
   * Entity components
   */
  activateDistance?: number;
  box?: BoundingBoxRef;
  count?: number;
  description?: string;
  gravityAcceleration?: number;
  inventory?: Partial<Record<Item, number>>;
  name?: string;
  offset?: VectorXyz;
  parent?: EntityComponents;
  playerNear?: boolean;
  rest?: number;
  sceneObject?: Object3D;
  speed?: number;
  state?: "moving" | "idle";
  target?: VectorXyz;
  velocity?: VectorXyz;
  zoom?: number;

  /**
   * Entity callbacks
   */
  onWorldEvent?: OnWorldEventHandler;
}
