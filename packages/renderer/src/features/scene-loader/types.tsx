/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import {
  type ProviderModule,
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
  providerPath: string;
  providers: ProviderModule;
  scene: SceneComponent;
}
