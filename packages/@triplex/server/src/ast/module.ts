/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { JsxElement, JsxSelfClosingElement, Node } from "ts-morph";
import { normalize } from "upath";
import { resolveExportDeclaration } from "./jsx";
import { SourceFileReadOnly } from "./project";

export function getElementFilePath(
  element: JsxSelfClosingElement | JsxElement
): { exportName: string; filePath: string } {
  const tagNode = Node.isJsxSelfClosingElement(element)
    ? element.getTagNameNode()
    : element.getOpeningElement().getTagNameNode();

  const jsxType = tagNode.getType();
  if (jsxType.isAny()) {
    throw new Error(
      `invariant: ${tagNode.getText()} resolved to any, check node_modules.`
    );
  }

  const symbol = jsxType.getSymbol() || jsxType.getAliasSymbol();

  if (!symbol) {
    throw new Error(
      `invariant: could not find symbol for ${tagNode.getText()}`
    );
  }

  const declaration = symbol.getDeclarations()[0];
  const filePath = normalize(declaration.getSourceFile().getFilePath());

  if (filePath.includes("node_modules")) {
    return { exportName: "", filePath: "" };
  }

  const localSymbolDecl = tagNode.getSymbol()?.getDeclarations()[0];

  if (Node.isImportClause(localSymbolDecl)) {
    // Default import!
    return { exportName: "default", filePath };
  }

  if (Node.isImportSpecifier(localSymbolDecl)) {
    // Named import!
    const exportName = localSymbolDecl.getName();
    return { exportName, filePath };
  }

  if (Node.isFunctionDeclaration(localSymbolDecl)) {
    if (localSymbolDecl.isDefaultExport()) {
      return { exportName: "default", filePath };
    }

    if (localSymbolDecl.isNamedExport()) {
      return { exportName: localSymbolDecl.getNameOrThrow(), filePath };
    }
  }

  if (Node.isVariableDeclaration(localSymbolDecl)) {
    const parent = localSymbolDecl.getParent().getParent();

    if (Node.isVariableStatement(parent) && parent.isExported()) {
      return { exportName: localSymbolDecl.getName(), filePath };
    }
  }

  return { exportName: "", filePath: "" };
}

export function getExportName(
  sourceFile: SourceFileReadOnly,
  exportName: string
) {
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

    const declaration = resolveExportDeclaration(declarations[0]);
    if (Node.isFunctionDeclaration(declaration)) {
      return { declaration, name: declaration.getNameOrThrow() };
    }

    if (Node.isVariableDeclaration(declaration)) {
      return { declaration, name: declaration.getName() };
    }

    if (Node.isIdentifier(declaration)) {
      return { declaration, name: declaration.getText() };
    }

    throw new Error(
      "invariant: default export should be a function declaration"
    );
  }

  throw new Error(`invariant: no export ${exportName} found`);
}
