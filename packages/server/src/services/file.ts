import { getJsxElementPropTypes, TRIPLEXProject } from "@triplex/ts-morph";
import { basename, extname, join } from "path";
import { readdir } from "../util/fs";
import { SyntaxKind } from "ts-morph";

export function getFile({
  path,
  project,
}: {
  path: string;
  project: TRIPLEXProject;
}) {
  const { sourceFile, transformedPath } = project.getSourceFile(path);
  const importCache = new Map();

  const jsxElements = sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxElement)
    .map((x) => {
      const meta = getJsxElementPropTypes(
        sourceFile,
        x.getOpeningElement().getTagNameNode().getText()
      );
      const { column, line } = sourceFile.getLineAndColumnAtPos(x.getPos());

      return {
        column: column - 1,
        line: line - 1,
        name: x.getOpeningElement().getTagNameNode().getText(),
        path: meta.filePath,
      };
    });

  const jsxSelfClosing = sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
    .map((x) => {
      const meta = getJsxElementPropTypes(
        sourceFile,
        x.getTagNameNode().getText()
      );
      const { column, line } = sourceFile.getLineAndColumnAtPos(x.getPos());

      return {
        column: column - 1,
        line: line - 1,
        name: x.getTagNameNode().getText(),
        path: meta.filePath,
      };
    });

  return {
    path: join(process.cwd(), path),
    transformedPath,
    sceneObjects: jsxElements.concat(jsxSelfClosing),
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
