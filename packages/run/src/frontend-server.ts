import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import { join } from "path";
import { mkdir } from "fs/promises";

const tempFolderName = join("node_modules", ".triplex");
const root = join(process.cwd(), "node_modules", "@triplex/run");
const tempDir = join(process.cwd(), tempFolderName);

export async function createServer(config: { publicDir?: string }) {
  try {
    await mkdir(tempDir);
  } catch (e) {
    // Already created
  }

  const glsl = (await import("vite-plugin-glsl")).default;

  const frontendServer = await createViteServer({
    configFile: false,
    plugins: [(react as any)(), glsl()],
    publicDir: config.publicDir,
    root,
    server: {
      watch: {
        ignored: [join("!**", tempFolderName, "**")],
      },
    },
    resolve: {
      alias: {
        "@@": tempDir,
      },
    },
  });

  return frontendServer;
}
