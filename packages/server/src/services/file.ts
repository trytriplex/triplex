import {
  getDefaultExportFunctionName,
  TRIPLEXProject,
} from "@triplex/ts-morph";
import { extname } from "path";
import { getJsxElementsPositions } from "@triplex/ts-morph";
import readdirp from "readdirp";
import parent from "glob-parent";
import anymatch from "anymatch";

export function getFile({
  path,
  project,
}: {
  /**
   * The absolute path to the file.
   */
  path: string;
  project: TRIPLEXProject;
}) {
  const { sourceFile, transformedPath } = project.getSourceFile(path);
  const jsxElements = getJsxElementsPositions(sourceFile);
  const name = getDefaultExportFunctionName(sourceFile);

  return {
    path,
    name,
    transformedPath,
    sceneObjects: jsxElements,
  };
}

export async function getAllFiles({ files }: { files: string[] }) {
  const foundFiles: { path: string; name: string }[] = [];
  const roots = files.map((glob) => parent(glob));

  for (let i = 0; i < files.length; i++) {
    const glob = files[i];
    const root = roots[i];
    const match = anymatch(glob);

    for await (const entry of readdirp(root)) {
      if (match(entry.fullPath)) {
        foundFiles.push({
          path: entry.fullPath,
          name: entry.basename.replace(extname(entry.path), ""),
        });
      }
    }
  }

  return {
    cwd: process.cwd(),
    scenes: foundFiles,
  };
}
