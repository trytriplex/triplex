/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
type ReconciledTriplexConfig =
  import("@triplex/server").ReconciledTriplexConfig;
type TriplexPorts = import("@triplex/server").TriplexPorts;

declare interface Window {
  triplex: {
    env: {
      config: ReconciledTriplexConfig;
      fgEnvironmentOverride: "production" | "staging" | "development" | "local";
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
