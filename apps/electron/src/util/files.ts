/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readFile } from "node:fs/promises";
import { inferExports } from "@triplex/server";
import anymatch from "anymatch";
import parent from "glob-parent";
import readdirp from "readdirp";
import { join, normalize } from "upath";

export async function getFirstFoundFile({ files }: { files: string[] }) {
  const roots = files.map((glob) => parent(glob));

  for (let i = 0; i < files.length; i++) {
    const glob = files[i];
    const root = roots[i];
    const match = anymatch(glob);

    for await (const entry of readdirp(root)) {
      if (match(entry.fullPath)) {
        const file = await readFile(entry.fullPath, "utf8");
        const foundExports = inferExports(file);

        return {
          exports: foundExports,
          path: normalize(entry.fullPath),
        };
      }
    }
  }

  return undefined;
}

export async function getInitialComponent({ files }: { files: string[] }) {
  if (
    process.env.FORCE_EDITOR_TEST_FIXTURE &&
    process.env.FORCE_PATH &&
    process.env.FORCE_EXPORT_NAME
  ) {
    return {
      exportName: process.env.FORCE_EXPORT_NAME,
      path: join(
        process.cwd(),
        "..",
        "..",
        process.env.FORCE_EDITOR_TEST_FIXTURE,
        process.env.FORCE_PATH
      ),
    };
  }

  const file = await getFirstFoundFile({ files });
  let exportName = "";
  let path = "";

  if (file) {
    if (file.exports.length) {
      exportName = file.exports[0].exportName;
      path = file.path;
    }
  }

  return { exportName, path };
}
