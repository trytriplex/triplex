/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createServer as createFrontend } from "@triplex/client";
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
  fgEnvironmentOverride: "production" | "staging" | "development" | "local";
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
