/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

export type SceneSelected =
  | {
      column: number;
      line: number;
      parentPath: string;
      path: string;
    }
  | {
      column: number;
      exportName: string;
      line: number;
      parentPath: string;
      path: string;
    };

export type PlayStateAction =
  | "camera-default"
  | "camera-editor"
  | "state-play"
  | "state-pause"
  | "state-edit";

export interface PlayState {
  camera: "default" | "editor";
  state: "play" | "pause" | "edit";
}

export interface SceneContext {
  exportName: string;
  path: string;
}

export interface SceneEvents {
  blurElement(): void;
  focusElement(selected: SceneSelected): void;
  setPlayState(action: PlayStateAction): void;
  syncContext(ctx: SceneContext): void;
  syncSelected(selected: SceneSelected | undefined): void;
}
