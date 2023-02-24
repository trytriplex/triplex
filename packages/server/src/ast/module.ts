import { Node, SourceFile } from "ts-morph";
import { getExportDeclaration } from "./jsx";

export function getExportName(
  sourceFile: SourceFile,
  exportName: string
): string {
  const symbols = sourceFile.getExportSymbols();

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    if (symbol.getEscapedName() !== exportName) {
      continue;
    }

    // We found our export!
    const declarations = symbol?.getDeclarations();
    if (declarations.length !== 1) {
      throw new Error("invariant: default export should be a single function");
    }

    const declaration = getExportDeclaration(declarations[0]);
    if (Node.isFunctionDeclaration(declaration)) {
      return declaration.getNameOrThrow();
    }

    if (Node.isVariableDeclaration(declaration)) {
      return declaration.getName();
    }

    if (Node.isIdentifier(declaration)) {
      return declaration.getText();
    }

    throw new Error(
      "invariant: default export should be a function declaration"
    );
  }

  throw new Error(`invariant: no export ${exportName} found`);
}

export function getLocalName(sourceFile: SourceFile, exportName: string) {
  const local = sourceFile.getLocal(exportName);
  const decl = local?.getDeclarations()[0];

  if (Node.isImportClause(decl)) {
    const namedBindings = decl.getNamedBindings();
    if (!namedBindings) {
      return {
        importName: "default",
      };
    }
  }

  if (Node.isImportSpecifier(decl)) {
    return {
      importName: decl.getName(),
    };
  }

  if (Node.isFunctionDeclaration(decl)) {
    return {
      importName: decl.getNameOrThrow(),
    };
  }

  if (Node.isVariableDeclaration(decl)) {
    return {
      importName: decl.getName(),
    };
  }

  throw new Error("invariant: unhandled");
}
