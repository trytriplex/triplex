import { dirname, join } from "path";
import { mkdir, symlink } from "fs/promises";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";

const root = process.cwd();
const triplexTmpPath = join(root, "node_modules", ".triplex");
const runPkgPath = join(dirname(fileURLToPath(import.meta.url)), "..");

export async function createServer(config: { publicDir?: string }) {
  try {
    await symlink(runPkgPath, triplexTmpPath);
  } catch (e) {
    // Dir already exists
  }

  const frontendServer = await createViteServer({
    configFile: false,
    define: {
      __CWD__: `"${root}"`,
    },
    plugins: [(react as any)(), glsl()],
    publicDir: config.publicDir,
    resolve: {
      preserveSymlinks: true,
    },
    root,
  });

  return frontendServer;
}
