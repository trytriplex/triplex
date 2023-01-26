import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";

const root = process.cwd();

export async function createServer(config: { publicDir?: string }) {
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
