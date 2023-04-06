import { extname } from "path";
import readdirp from "readdirp";
import parent from "glob-parent";
import anymatch from "anymatch";
import { readFile } from "fs/promises";
import { getExportName, TRIPLEXProject, getJsxElementsPositions } from "../ast";

export function getSceneExport({
  path,
  project,
  exportName,
}: {
  path: string;
  exportName: string;
  project: TRIPLEXProject;
}) {
  const { sourceFile } = project.getSourceFile(path);
  const jsxElements = getJsxElementsPositions(sourceFile, exportName);
  const { name } = getExportName(sourceFile, exportName);

  return {
    path,
    name,
    sceneObjects: jsxElements,
  };
}

export async function getAllFiles({
  files,
  cwd = process.cwd(),
}: {
  files: string[];
  cwd?: string;
}) {
  const foundFiles: { path: string; name: string; exports: string[] }[] = [];
  const roots = files.map((glob) => parent(glob));

  for (let i = 0; i < files.length; i++) {
    const glob = files[i];
    const root = roots[i];
    const match = anymatch(glob);

    for await (const entry of readdirp(root)) {
      if (match(entry.fullPath)) {
        const file = await readFile(entry.fullPath, "utf-8");
        const namedExports = file.matchAll(
          /export (function|const) ([A-Z]\w+)/g
        );
        const hasDefaultExport = !!/export default/.exec(file);
        const foundExports: string[] = [];

        for (const match of namedExports) {
          const [, , exportName] = match;
          foundExports.push(exportName);
        }

        if (hasDefaultExport) {
          foundExports.push("default");
        }

        foundFiles.push({
          path: entry.fullPath,
          name: entry.basename.replace(extname(entry.path), ""),
          exports: foundExports,
        });
      }
    }
  }

  return {
    cwd,
    scenes: foundFiles,
  };
}
