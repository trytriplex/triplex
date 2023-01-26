import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import { join } from "path";

const root = join(process.cwd(), "node_modules", "@triplex/run");

export async function createServer(config: { publicDir?: string }) {
  const glsl = (await import("vite-plugin-glsl")).default;

  const frontendServer = await createViteServer({
    configFile: false,
    define: {
      __CWD__: `"${root}"`,
    },
    plugins: [(react as any)(), glsl()],
    publicDir: config.publicDir,
    root,
  });

  return frontendServer;
}
