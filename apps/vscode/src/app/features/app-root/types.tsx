/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
