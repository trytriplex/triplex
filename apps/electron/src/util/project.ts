/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createServer as createFrontend } from "@triplex/client";
import { type FGEnvironment } from "@triplex/lib/types";
import {
  createServer as createBackend,
  type ReconciledRenderer,
  type ReconciledTriplexConfig,
  type TriplexPorts,
} from "@triplex/server";

export async function startProject({
  config,
  fgEnvironmentOverride,
  ports,
  renderer,
  userId,
}: {
  config: ReconciledTriplexConfig;
  fgEnvironmentOverride: FGEnvironment;
  ports: TriplexPorts;
  renderer: ReconciledRenderer;
  userId: string;
}) {
  const backend = await createBackend({
    config,
    renderer,
  });
  const closeBackend = await backend.listen(ports);
  const frontend = await createFrontend({
    config,
    fgEnvironmentOverride,
    ports,
    renderer,
    userId,
  });
  const closeFrontend = await frontend.listen(ports.client);

  return {
    close: async () => {
      await closeFrontend();
      await closeBackend();
    },
  };
}
