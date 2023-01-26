import { createServer as createFrontendServer } from "./frontend-server";
import { createServer as createBackendServer } from "./backend-server";

async function init() {
  const frontendServer = await createFrontendServer({});
  const backendServer = await createBackendServer({});

  await frontendServer.listen(5173);
  await backendServer.listen(8000);
}

init();
