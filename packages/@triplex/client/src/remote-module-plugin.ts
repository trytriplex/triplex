/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { on } from "@triplex/ws";
import anymatch from "anymatch";
import {
  ViteDevServer,
  // @ts-expect-error
} from "vite";
import { getCode } from "./api";

function match(target: string, files: string[]): boolean {
  const normalizedFiles = files.map((file) => file.replaceAll("\\", "/"));

  for (let i = 0; i < normalizedFiles.length; i++) {
    const glob = normalizedFiles[i];
    const match = anymatch(glob);

    if (match(target)) {
      return true;
    }
  }

  return false;
}

interface API {
  getCode: (id: string) => Promise<string>;
}

/**
 * This plugin acts as an intermediate between the file system and the in-memory
 * file held in the server. We use this to be able to load files from the
 * in-memory representation enabling us to change it without having to modify
 * the file on the fs enabling undo/redo/load-from-dirty without much complexity
 * ...its just a HMR instead of trying to build it up as client state!!
 */
export function remoteModulePlugin({
  __api: api = { getCode },
  cwd,
  files,
}: {
  __api?: API;
  cwd: string;
  files: string[];
}) {
  return {
    configureServer(server: ViteDevServer) {
      on("fs-change", async (e) => {
        const mod = await server.moduleGraph.getModuleById(e.path);
        if (mod) {
          server.reloadModule(mod);
        }
      });
    },
    enforce: "pre",
    async load(id: string) {
      if (!match(id, files)) {
        return;
      }

      const code = await api.getCode(id);
      return code;
    },
    name: "triplex:remote-module-plugin",
    resolveId(id: string) {
      if (id.startsWith("triplex:/src/untitled")) {
        return id.replace("triplex:", cwd);
      }
    },
  } as const;
}
