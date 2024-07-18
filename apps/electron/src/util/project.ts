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
  ports,
  renderer,
  userId,
}: {
  config: ReconciledTriplexConfig;
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
