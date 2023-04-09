import readdirp from "readdirp";
import { basename, dirname } from "path";
import parent from "glob-parent";
import anymatch from "anymatch";
import { inferExports } from "../util/module";
import { readFile } from "fs/promises";

const hElements = [
  {
    category: "Object3D",
    name: "mesh",
    type: "host",
  },
  {
    category: "Object3D",
    name: "group",
    type: "host",
  },
  {
    category: "Light",
    name: "ambientLight",
    type: "host",
  },
  {
    category: "Light",
    name: "directionalLight",
    type: "host",
  },
  {
    category: "Light",
    name: "hemisphereLight",
    type: "host",
  },
  {
    category: "Light",
    name: "pointLight",
    type: "host",
  },
  {
    category: "Light",
    name: "rectAreaLight",
    type: "host",
  },
  {
    category: "Light",
    name: "spotLight",
    type: "host",
  },
];

export function hostElements() {
  return hElements;
}

export async function foundFolders(globs: string[]) {
  const foundFolders: Record<string, { path: string; name: string }> = {};
  const roots = globs.map((glob) => parent(glob));

  for (let i = 0; i < globs.length; i++) {
    const root = roots[i];

    for await (const entry of readdirp(root, { type: "files" })) {
      const path = entry.fullPath.replace("/" + entry.basename, "");

      foundFolders[dirname(entry.fullPath)] = {
        path,
        name: basename(path),
      };
    }
  }

  return Object.values(foundFolders);
}

export async function folderComponents(globs: string[], folder: string) {
  const match = anymatch(globs);
  const foundComponents: { name: string; exportName: string; path: string }[] =
    [];

  for await (const entry of readdirp(folder, { depth: 1 })) {
    if (match(entry.fullPath)) {
      const file = await readFile(entry.fullPath, "utf-8");
      const foundExports = inferExports(file);

      foundExports.forEach((exp) =>
        foundComponents.push({
          exportName: exp.exportName,
          name: exp.name,
          path: entry.fullPath,
        })
      );
    }
  }

  return foundComponents;
}
