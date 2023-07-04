/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export interface SceneMeta {
  lighting: "custom" | "default";
}

export interface SceneComponent {
  (props: unknown): JSX.Element;
  triplexMeta?: SceneMeta;
}

export type SceneModule = Record<string, SceneComponent>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentModule = Record<string, (props: any) => any>;
