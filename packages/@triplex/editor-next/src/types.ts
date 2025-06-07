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

export interface TriplexObject {
  env: {
    config: ReconciledTriplexConfig;
    externalIP: string;
    fgEnvironmentOverride: FGEnvironment;
    ports: TriplexPorts;
  };
  initialState: {
    exportName: string;
    path: string;
  };
  isTelemetryEnabled: boolean;
  sessionId: string;
  userId: string;
  version: string;
}
