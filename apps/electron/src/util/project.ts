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
    url: `http://localhost:${frontendPort}`,
    close: async () => {
      await closeFrontend({ forceExit: false });
      await closeBackend();
    },
  };
}
