/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import readdirp from "readdirp";
import parent from "glob-parent";
import anymatch from "anymatch";
import { readFile } from "node:fs/promises";

export function inferExports(file: string) {
  const namedExports = file.matchAll(/export (function|const|let) ([A-Z]\w+)/g);
  const defaultExport = /export default.+([A-Z]\w+)/.exec(file);
  const foundExports: { name: string; exportName: string }[] = [];

  for (const match of namedExports) {
    const [, , exportName] = match;
    foundExports.push({ name: exportName, exportName });
  }

  if (defaultExport) {
    const name = defaultExport[1];
    foundExports.push({ exportName: "default", name });
  }

  return foundExports;
}

export async function getFirstFoundFile({ files }: { files: string[] }) {
  const roots = files.map((glob) => parent(glob));

  for (let i = 0; i < files.length; i++) {
    const glob = files[i];
    const root = roots[i];
    const match = anymatch(glob);

    for await (const entry of readdirp(root)) {
      if (match(entry.fullPath)) {
        const file = await readFile(entry.fullPath, "utf-8");
        const foundExports = inferExports(file);

        return {
          path: entry.fullPath,
          exports: foundExports,
        };
      }
    }
  }

  return undefined;
}
