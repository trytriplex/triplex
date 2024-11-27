/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  type ReconciledTriplexConfig,
  type TriplexPorts,
} from "@triplex/server";

export interface InitializationConfig {
  config: ReconciledTriplexConfig;
  fgEnvironmentOverride: "production" | "staging" | "development" | "local";
  fileGlobs: string[];
  pkgName: string;
  ports: TriplexPorts;
  userId: string;
}
