/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type FGEnvironment } from "@triplex/lib/types";
import {
  type ReconciledTriplexConfig,
  type TriplexPorts,
} from "@triplex/server";

export interface InitializationConfig {
  config: ReconciledTriplexConfig;
  fgEnvironmentOverride: FGEnvironment;
  fileGlobs: string[];
  pkgName: string;
  ports: TriplexPorts;
  preload: {
    reactThreeFiber: boolean;
  };
  userId: string;
}
