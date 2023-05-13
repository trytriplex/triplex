import { extname } from "path";
import readdirp from "readdirp";
import parent from "glob-parent";
import anymatch from "anymatch";
import { readFile } from "fs/promises";
import { TRIPLEXProject, getJsxElementsPositions } from "../ast";
import { inferExports } from "../util/module";

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
  const foundExports = inferExports(sourceFile.getText());
  const foundExport = foundExports.find((exp) => exp.exportName === exportName);

  if (!foundExport) {
    throw new Error("invariant: unexpected");
  }

  return {
    name: foundExport.name,
    path,
    sceneObjects: jsxElements,
    exports: foundExports,
  };
}

export async function getAllFiles({
  files,
  cwd = process.cwd(),
}: {
  files: string[];
  cwd?: string;
}) {
  const foundFiles: {
    path: string;
    name: string;
    exports: { exportName: string; name: string }[];
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
        const file = await readFile(entry.fullPath, "utf-8");
        const foundExports = inferExports(file);

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
