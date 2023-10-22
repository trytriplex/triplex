/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import anymatch from "anymatch";
import parent from "glob-parent";
import readdirp from "readdirp";
import { getJsxElementsPositions, TRIPLEXProject } from "../ast";
import { inferExports } from "../util/module";

export function getSceneExport({
  exportName,
  path,
  project,
}: {
  exportName: string;
  path: string;
  project: TRIPLEXProject;
}) {
  const sourceFile = project.getSourceFile(path);
  const jsxElements = getJsxElementsPositions(sourceFile.read(), exportName);
  const foundExports = inferExports(sourceFile.read().getText());
  const foundExport = foundExports.find((exp) => exp.exportName === exportName);

  if (!foundExport) {
    throw new Error("invariant: unexpected");
  }

  return {
    exports: foundExports,
    name: foundExport.name,
    path,
    sceneObjects: jsxElements,
  };
}

export async function getAllFiles({
  cwd = process.cwd(),
  files,
}: {
  cwd?: string;
  files: string[];
}) {
  const foundFiles: {
    exports: { exportName: string; name: string }[];
    name: string;
    path: string;
  }[] = [];
  // Handle Windows separators being invalid in globs.
  const parsedFiles = files.map((file) => file.replaceAll("\\", "/"));
  const roots = files.map((glob) => parent(glob));

  for (let i = 0; i < parsedFiles.length; i++) {
    const glob = parsedFiles[i];
    const root = roots[i];
    const match = anymatch(glob);

    for await (const entry of readdirp(root)) {
      if (match(entry.fullPath)) {
        const file = await readFile(entry.fullPath, "utf8");
        const foundExports = inferExports(file);

        foundFiles.push({
          exports: foundExports,
          name: entry.basename.replace(extname(entry.path), ""),
          path: entry.fullPath,
        });
      }
    }
  }

  return {
    cwd,
    scenes: foundFiles,
  };
}
