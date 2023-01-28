import { createServer as createViteServer, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { join } from "path";
import { mkdir } from "fs/promises";
import { watch } from "chokidar";

const tempFolderName = join("node_modules", ".triplex");
const root = join(process.cwd(), "node_modules", "@triplex/run");
const tempDir = join(process.cwd(), tempFolderName);

function forceGlobsHmr(): Plugin[] {
  const triplexGlobModule = "triplex-scene-glob";

  return [
    {
      name: "triplex/watch-globs",
      configureServer(server) {
        function reloadGlobModule() {
          server.moduleGraph.fileToModulesMap.forEach((mods) => {
            mods.forEach((mod) => {
              if (mod.id?.includes(triplexGlobModule)) {
                server.reloadModule(mod);
              }
            });
          });
        }

        const watcher = watch(tempDir);
        watcher.on("add", reloadGlobModule);
      },
    },
  ];
}

export async function createServer(config: { publicDir?: string }) {
  try {
    await mkdir(tempDir);
  } catch (e) {
    // Already created
  }

  const glsl = (await import("vite-plugin-glsl")).default;

  const frontendServer = await createViteServer({
    configFile: false,
    plugins: [(react as any)(), glsl(), forceGlobsHmr()],
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
