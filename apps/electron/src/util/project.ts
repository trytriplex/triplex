/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createServer as createFrontend } from "@triplex/client";
import {
  createServer as createBackend,
  type TriplexConfig,
} from "@triplex/server";

export async function startProject(
  config: Required<TriplexConfig>,
  ports: { client: number; server: number; ws: number }
) {
  const backend = await createBackend(config);
  const closeBackend = await backend.listen(ports);
  const frontend = await createFrontend({
    ...config,
    ports,
  });
  const closeFrontend = await frontend.listen(ports.client);

  return {
    close: async () => {
      await closeFrontend({ forceExit: false });
      await closeBackend();
    },
  };
}
