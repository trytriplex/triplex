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
  Folder,
  ProjectAsset,
  ProjectCustomComponent,
  ProjectHostComponent,
} from "../types";
import { inferExports } from "../util/module";

const hElements: ProjectHostComponent[] = [
  { category: "Object3D", name: "mesh", type: "host" },
  { category: "Object3D", name: "group", type: "host" },
  { category: "Light", name: "ambientLight", type: "host" },
  { category: "Light", name: "directionalLight", type: "host" },
  { category: "Light", name: "hemisphereLight", type: "host" },
  { category: "Light", name: "pointLight", type: "host" },
  { category: "Light", name: "rectAreaLight", type: "host" },
  { category: "Light", name: "spotLight", type: "host" },
  { category: "Material", name: "shadowMaterial", type: "host" },
  { category: "Material", name: "spriteMaterial", type: "host" },
  { category: "Material", name: "rawShaderMaterial", type: "host" },
  { category: "Material", name: "shaderMaterial", type: "host" },
  { category: "Material", name: "pointsMaterial", type: "host" },
  { category: "Material", name: "meshPhysicalMaterial", type: "host" },
  { category: "Material", name: "meshStandardMaterial", type: "host" },
  { category: "Material", name: "meshPhongMaterial", type: "host" },
  { category: "Material", name: "meshToonMaterial", type: "host" },
  { category: "Material", name: "meshNormalMaterial", type: "host" },
  { category: "Material", name: "meshLambertMaterial", type: "host" },
  { category: "Material", name: "meshDepthMaterial", type: "host" },
  { category: "Material", name: "meshDistanceMaterial", type: "host" },
  { category: "Material", name: "meshBasicMaterial", type: "host" },
  { category: "Material", name: "meshMatcapMaterial", type: "host" },
  { category: "Material", name: "lineDashedMaterial", type: "host" },
  { category: "Material", name: "lineBasicMaterial", type: "host" },
  { category: "Geometry", name: "wireframeGeometry", type: "host" },
  { category: "Geometry", name: "tetrahedronGeometry", type: "host" },
  { category: "Geometry", name: "octahedronGeometry", type: "host" },
  { category: "Geometry", name: "icosahedronGeometry", type: "host" },
  { category: "Geometry", name: "dodecahedronGeometry", type: "host" },
  { category: "Geometry", name: "polyhedronGeometry", type: "host" },
  { category: "Geometry", name: "tubeGeometry", type: "host" },
  { category: "Geometry", name: "torusKnotGeometry", type: "host" },
  { category: "Geometry", name: "torusGeometry", type: "host" },
  { category: "Geometry", name: "sphereGeometry", type: "host" },
  { category: "Geometry", name: "ringGeometry", type: "host" },
  { category: "Geometry", name: "planeGeometry", type: "host" },
  { category: "Geometry", name: "latheGeometry", type: "host" },
  { category: "Geometry", name: "shapeGeometry", type: "host" },
  { category: "Geometry", name: "extrudeGeometry", type: "host" },
  { category: "Geometry", name: "edgesGeometry", type: "host" },
  { category: "Geometry", name: "coneGeometry", type: "host" },
  { category: "Geometry", name: "cylinderGeometry", type: "host" },
  { category: "Geometry", name: "circleGeometry", type: "host" },
  { category: "Geometry", name: "boxGeometry", type: "host" },
  { category: "Geometry", name: "capsuleGeometry", type: "host" },
];

export function hostElements() {
  const elements: ProjectHostComponent[] = hElements;
  return elements;
}

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
