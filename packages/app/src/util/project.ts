import { createServer as createFrontend } from "@triplex/client";
import { createServer as createBackend } from "@triplex/server";
import { getConfig } from "../config";

export async function startProject(cwd: string) {
  const port = 3333;
  const config = await getConfig(cwd);
  const frontend = await createFrontend(config);
  const backend = await createBackend(config);
  const closeFrontend = await frontend.listen(port);
  const closeBackend = await backend.listen(8000);

  return {
    url: `http://localhost:${port}`,
    close: async () => {
      await closeFrontend({ forceExit: false });
      await closeBackend();
    },
  };
}
