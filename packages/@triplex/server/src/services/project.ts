/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readdir, readFile } from "node:fs/promises";
import anymatch from "anymatch";
import parent from "glob-parent";
import readdirp from "readdirp";
import { basename, dirname, extname, join, normalize } from "upath";
import {
  type Folder,
  type ProjectAsset,
  type ProjectCustomComponent,
} from "../types";
import { inferExports } from "../util/module";

async function safeReaddir(path: string) {
  try {
    return await (await readdir(path)).map((file) => normalize(file));
  } catch {
    return [];
  }
}

export async function foundFolders(globs: string[]) {
  const folders: Folder[] = [];
  const match = anymatch(globs);
  const roots = globs.map((glob) => parent(glob));
  const foldersCache: Record<string, Folder> = {};

  async function countDirFiles(path: string) {
    const dir = await safeReaddir(path);
    let count = 0;

    for (let i = 0; i < dir.length; i++) {
      const file = dir[i];

      if (match(join(path, file))) {
        count += 1;
      }
    }

    return count;
  }

  for (let i = 0; i < globs.length; i++) {
    const root = normalize(roots[i]);
    const rootFolder: Folder = {
      children: [],
      files: await countDirFiles(root),
      name: basename(root),
      path: root,
    };

    foldersCache[root] = rootFolder;
    folders.push(rootFolder);

    for await (const entry of readdirp(root, { type: "directories" })) {
      const path = normalize(entry.fullPath);
      const parentFolderName = dirname(entry.fullPath);

      const folder: Folder = {
        children: [],
        files: await countDirFiles(path),
        name: basename(path),
        path,
      };

      foldersCache[path] = folder;

      if (foldersCache[parentFolderName]) {
        // We've found a child of the current folder
        foldersCache[parentFolderName].children.push(folder);
      } else {
        folders.push(folder);
      }
    }
  }

  return folders;
}

export async function folderComponents(globs: string[], folder: string) {
  const match = anymatch(globs);
  const foundComponents: ProjectCustomComponent[] = [];

  for await (const entry of readdirp(folder, { depth: 1 })) {
    if (match(entry.fullPath)) {
      const file = await readFile(entry.fullPath, "utf8");
      const foundExports = inferExports(file);

      foundExports.forEach((exp) =>
        foundComponents.push({
          category: "Unknown",
          exportName: exp.exportName,
          name: exp.name,
          path: normalize(entry.fullPath),
          type: "custom",
        })
      );
    }
  }

  return foundComponents;
}

export async function folderAssets(globs: string[], folder: string) {
  const match = anymatch(globs);
  const foundAssets: ProjectAsset[] = [];

  for await (const entry of readdirp(folder, { depth: 0 })) {
    if (match(entry.fullPath)) {
      foundAssets.push({
        extname: extname(entry.fullPath),
        name: entry.basename,
        path: normalize(entry.fullPath),
        type: "asset",
      });
    }
  }

  return foundAssets;
}
