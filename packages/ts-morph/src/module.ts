import { Node, SourceFile } from "ts-morph";

export function getDefaultExportFunctionName(sourceFile: SourceFile): string {
  const symbol = sourceFile.getDefaultExportSymbol();
  if (!symbol) {
    throw new Error("invariant: no default export found");
  }

  const declarations = symbol?.getDeclarations();
  if (declarations.length !== 1) {
    throw new Error("invariant: default export should be a single function");
  }

  const declaration = declarations[0];
  if (!Node.isFunctionDeclaration(declaration)) {
    throw new Error(
      "invariant: default export should be a function declaration"
    );
  }

  return declaration.getNameOrThrow();
}
