import readdirp from "readdirp";
import { basename, dirname, sep } from "path";
import parent from "glob-parent";
import anymatch from "anymatch";
import { inferExports } from "../util/module";
import { readFile } from "fs/promises";

const hElements = [
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
  return hElements;
}

export async function foundFolders(globs: string[]) {
  const foundFolders: Record<string, { path: string; name: string }> = {};
  const roots = globs.map((glob) => parent(glob.replaceAll("\\", "/")));

  for (let i = 0; i < globs.length; i++) {
    const root = roots[i];

    for await (const entry of readdirp(root, { type: "files" })) {
      const path = entry.fullPath.replace(sep + entry.basename, "");

      foundFolders[dirname(entry.fullPath)] = {
        path,
        name: basename(path),
      };
    }
  }

  return Object.values(foundFolders);
}

export async function folderComponents(globs: string[], folder: string) {
  const match = anymatch(globs.map((glob) => glob.replaceAll("\\", "/")));
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
