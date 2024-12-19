/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import {
  type ProviderComponent,
  type SceneComponent,
  type SceneMeta,
} from "@triplex/bridge/client";

export interface Scene {
  component: SceneComponent;
  meta: SceneMeta;
}

export interface LoadedSceneContext {
  exportName: string;
  meta: SceneMeta;
  path: string;
  provider: ProviderComponent;
  providerPath: string;
  scene: SceneComponent;
}
