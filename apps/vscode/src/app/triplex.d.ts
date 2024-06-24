/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
type ReconciledTriplexConfig =
  import("@triplex/server").ReconciledTriplexConfig;
type TriplexPorts = import("@triplex/server").TriplexPorts;

declare interface Window {
  triplex: {
    env: {
      config: ReconciledTriplexConfig;
      ports: TriplexPorts;
    };
    initialState: {
      exportName: string;
      path: string;
    };
    isTelemetryEnabled: boolean;
    sessionId: string;
    userId: string;
  };
}
