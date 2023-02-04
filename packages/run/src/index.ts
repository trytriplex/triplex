import { createServer as createBackendServer } from "@triplex/server";
import { createServer as createFrontendServer } from "@triplex/client";

async function init() {
  const frontendServer = await createFrontendServer({});
  const backendServer = await createBackendServer({});

  await frontendServer.listen(3333);
  await backendServer.listen(8000);
}

init();
