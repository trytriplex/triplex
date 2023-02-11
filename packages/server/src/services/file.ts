import {
  getDefaultExportFunctionName,
  TRIPLEXProject,
} from "@triplex/ts-morph";
import { basename, extname, join } from "path";
import { getJsxElementsPositions } from "@triplex/ts-morph";
import { readdir } from "../util/fs";

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

export async function getAllFiles() {
  const files = await readdir(join(process.cwd(), "src"), {
    recursive: true,
  });

  return {
    cwd: process.cwd(),
    scenes: files
      .filter((file) => file.endsWith(".tsx"))
      .map((path) => ({
        path: join(process.cwd(), path),
        name: basename(path).replace(extname(path), ""),
      })),
  };
}
