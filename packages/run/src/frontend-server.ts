import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import { join } from "path";
import { mkdir } from "fs/promises";

const root = join(process.cwd(), "node_modules", "@triplex/run");
const tempDir = join(process.cwd(), "node_modules", ".triplex");

export async function createServer(config: { publicDir?: string }) {
  try {
    await mkdir(tempDir);
  } catch (e) {
    // Already created
  }

  const glsl = (await import("vite-plugin-glsl")).default;

  const frontendServer = await createViteServer({
    configFile: false,
    define: {
      __CWD__: `"${root}"`,
    },
    plugins: [(react as any)(), glsl()],
    publicDir: config.publicDir,
    root,
    resolve: {
      alias: {
        "@@": tempDir,
      },
    },
  });

  return frontendServer;
}
