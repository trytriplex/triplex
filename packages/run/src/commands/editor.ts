import { createServer as createBackendServer } from "@triplex/server";
import { createServer as createFrontendServer } from "@triplex/client";

export async function editor({ open }: { open?: boolean | string }) {
  const frontendServer = await createFrontendServer({ open });
  const backendServer = await createBackendServer();

  await frontendServer.listen(3333);
  await backendServer.listen(8000);
}
