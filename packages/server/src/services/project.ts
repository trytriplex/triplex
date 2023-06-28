import readdirp from "readdirp";
import { basename, dirname, join, normalize, extname } from "node:path";
import { readFile, readdir } from "node:fs/promises";
import parent from "glob-parent";
import anymatch from "anymatch";
import { inferExports } from "../util/module";
import {
  Folder,
  ProjectAsset,
  ProjectCustomComponent,
  ProjectHostComponent,
} from "../types";

const hElements: ProjectHostComponent[] = [
  { category: "Object3D", type: "host", name: "mesh" },
  { category: "Object3D", type: "host", name: "group" },
  { category: "Light", type: "host", name: "ambientLight" },
  { category: "Light", type: "host", name: "directionalLight" },
  { category: "Light", type: "host", name: "hemisphereLight" },
  { category: "Light", type: "host", name: "pointLight" },
  { category: "Light", type: "host", name: "rectAreaLight" },
  { category: "Light", type: "host", name: "spotLight" },
  { name: "shadowMaterial", type: "host", category: "Material" },
  { name: "spriteMaterial", type: "host", category: "Material" },
  { name: "rawShaderMaterial", type: "host", category: "Material" },
  { name: "shaderMaterial", type: "host", category: "Material" },
  { name: "pointsMaterial", type: "host", category: "Material" },
  { name: "meshPhysicalMaterial", type: "host", category: "Material" },
  { name: "meshStandardMaterial", type: "host", category: "Material" },
  { name: "meshPhongMaterial", type: "host", category: "Material" },
  { name: "meshToonMaterial", type: "host", category: "Material" },
  { name: "meshNormalMaterial", type: "host", category: "Material" },
  { name: "meshLambertMaterial", type: "host", category: "Material" },
  { name: "meshDepthMaterial", type: "host", category: "Material" },
  { name: "meshDistanceMaterial", type: "host", category: "Material" },
  { name: "meshBasicMaterial", type: "host", category: "Material" },
  { name: "meshMatcapMaterial", type: "host", category: "Material" },
  { name: "lineDashedMaterial", type: "host", category: "Material" },
  { name: "lineBasicMaterial", type: "host", category: "Material" },
  { name: "wireframeGeometry", type: "host", category: "Geometry" },
  { name: "tetrahedronGeometry", type: "host", category: "Geometry" },
  { name: "octahedronGeometry", type: "host", category: "Geometry" },
  { name: "icosahedronGeometry", type: "host", category: "Geometry" },
  { name: "dodecahedronGeometry", type: "host", category: "Geometry" },
  { name: "polyhedronGeometry", type: "host", category: "Geometry" },
  { name: "tubeGeometry", type: "host", category: "Geometry" },
  { name: "torusKnotGeometry", type: "host", category: "Geometry" },
  { name: "torusGeometry", type: "host", category: "Geometry" },
  { name: "sphereGeometry", type: "host", category: "Geometry" },
  { name: "ringGeometry", type: "host", category: "Geometry" },
  { name: "planeGeometry", type: "host", category: "Geometry" },
  { name: "latheGeometry", type: "host", category: "Geometry" },
  { name: "shapeGeometry", type: "host", category: "Geometry" },
  { name: "extrudeGeometry", type: "host", category: "Geometry" },
  { name: "edgesGeometry", type: "host", category: "Geometry" },
  { name: "coneGeometry", type: "host", category: "Geometry" },
  { name: "cylinderGeometry", type: "host", category: "Geometry" },
  { name: "circleGeometry", type: "host", category: "Geometry" },
  { name: "boxGeometry", type: "host", category: "Geometry" },
  { name: "capsuleGeometry", type: "host", category: "Geometry" },
];

export function hostElements() {
  const elements: ProjectHostComponent[] = hElements;
  return elements;
}

async function safeReaddir(path: string) {
  try {
    return await readdir(path);
  } catch (e) {
    return [];
  }
}

export async function foundFolders(globs: string[]) {
  const folders: Folder[] = [];
  const match = anymatch(globs.map((glob) => glob.replaceAll("\\", "/")));
  const roots = globs.map((glob) => parent(glob.replaceAll("\\", "/")));
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
      path: root,
      name: basename(root),
      files: await countDirFiles(root),
      children: [],
    };

    foldersCache[root] = rootFolder;
    folders.push(rootFolder);

    for await (const entry of readdirp(root, { type: "directories" })) {
      const path = entry.fullPath;
      const parentFolderName = dirname(entry.fullPath);

      const folder: Folder = {
        path,
        name: basename(path),
        files: await countDirFiles(path),
        children: [],
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
  const match = anymatch(globs.map((glob) => glob.replaceAll("\\", "/")));
  const foundComponents: ProjectCustomComponent[] = [];

  for await (const entry of readdirp(folder, { depth: 1 })) {
    if (match(entry.fullPath)) {
      const file = await readFile(entry.fullPath, "utf-8");
      const foundExports = inferExports(file);

      foundExports.forEach((exp) =>
        foundComponents.push({
          category: "Unknown",
          type: "custom",
          exportName: exp.exportName,
          name: exp.name,
          path: entry.fullPath,
        })
      );
    }
  }

  return foundComponents;
}

export async function folderAssets(globs: string[], folder: string) {
  const match = anymatch(globs.map((glob) => glob.replaceAll("\\", "/")));
  const foundAssets: ProjectAsset[] = [];

  for await (const entry of readdirp(folder, { depth: 0 })) {
    if (match(entry.fullPath)) {
      foundAssets.push({
        name: entry.basename,
        path: entry.fullPath,
        extname: extname(entry.fullPath),
        type: "asset",
      });
    }
  }

  return foundAssets;
}
