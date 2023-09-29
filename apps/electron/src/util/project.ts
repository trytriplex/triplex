/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createServer as createFrontend } from "@triplex/client";
import { createServer as createBackend, getConfig } from "@triplex/server";

export async function startProject(
  cwd: string,
  { frontendPort = 3333, backendPort = 8000 } = {}
) {
  const config = await getConfig(cwd);
  const frontend = await createFrontend({ ...config, target: "electron" });
  const backend = await createBackend(config);
  const closeFrontend = await frontend.listen(frontendPort);
  const closeBackend = await backend.listen(backendPort);

  return {
    config,
    sceneUrl: `http://localhost:${frontendPort}`,
    serverUrl: `http://localhost:${backendPort}`,
    wsUrl: `ws://localhost:${backendPort}`,
    close: async () => {
      await closeFrontend({ forceExit: false });
      await closeBackend();
    },
  };
}
