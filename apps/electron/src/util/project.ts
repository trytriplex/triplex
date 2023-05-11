import { createServer as createFrontend } from "@triplex/client";
import { createServer as createBackend } from "@triplex/server";
import { getConfig } from "./config";

export async function startProject(
  cwd: string,
  { frontendPort = 3333, backendPort = 8000 } = {}
) {
  const config = await getConfig(cwd);
  const frontend = await createFrontend(config);
  const backend = await createBackend(config);
  const closeFrontend = await frontend.listen(frontendPort);
  const closeBackend = await backend.listen(backendPort);

  return {
    config,
    url: `http://localhost:${frontendPort}`,
    close: async () => {
      await closeFrontend({ forceExit: false });
      await closeBackend();
    },
  };
}
