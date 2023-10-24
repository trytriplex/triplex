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
  { backendPort = 8000, frontendPort = 3333 } = {}
) {
  const config = await getConfig(cwd);
  const backend = await createBackend(config);
  const closeBackend = await backend.listen(backendPort);
  const frontend = await createFrontend({ ...config, target: "electron" });
  const closeFrontend = await frontend.listen(frontendPort);

  return {
    close: async () => {
      await closeFrontend({ forceExit: false });
      await closeBackend();
    },
    config,
    sceneUrl: `http://localhost:${frontendPort}`,
    serverUrl: `http://localhost:${backendPort}`,
    wsUrl: `ws://localhost:${backendPort}`,
  };
}
