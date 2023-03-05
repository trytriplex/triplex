import { JsxElement, JsxSelfClosingElement, Node, SourceFile } from "ts-morph";
import { getExportDeclaration } from "./jsx";

export function getElementFilePath(
  element: JsxSelfClosingElement | JsxElement
): { filePath: string; exportName: string } {
  const tagNode = Node.isJsxSelfClosingElement(element)
    ? element.getTagNameNode()
    : element.getOpeningElement().getTagNameNode();

  const jsxType = tagNode.getType();
  const declaration = jsxType.getSymbolOrThrow().getDeclarations()[0];
  const filePath = declaration.getSourceFile().getFilePath();

  if (filePath.includes("node_modules")) {
    return { filePath: "", exportName: "" };
  }

  const localSymbolDecl = tagNode.getSymbol()?.getDeclarations()[0];

  if (Node.isImportClause(localSymbolDecl)) {
    // Default import!
    return { filePath, exportName: "default" };
  }

  if (Node.isImportSpecifier(localSymbolDecl)) {
    // Named import!
    const exportName = localSymbolDecl.getName();
    return { filePath, exportName };
  }

  if (Node.isFunctionDeclaration(localSymbolDecl)) {
    if (localSymbolDecl.isDefaultExport()) {
      return { filePath, exportName: "default" };
    }

    if (localSymbolDecl.isNamedExport()) {
      return { filePath, exportName: localSymbolDecl.getNameOrThrow() };
    }
  }

  if (Node.isVariableDeclaration(localSymbolDecl)) {
    const parent = localSymbolDecl.getParent().getParent();

    if (Node.isVariableStatement(parent) && parent.isExported()) {
      return { filePath, exportName: localSymbolDecl.getName() };
    }
  }

  return { filePath: "", exportName: "" };
}

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
