/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { normalize } from "@triplex/lib/path";
import {
  Node,
  type JsxElement,
  type JsxFragment,
  type JsxSelfClosingElement,
} from "ts-morph";
import { resolveExportDeclaration } from "./jsx";
import { type SourceFileReadOnly } from "./project";

export function getElementFilePath(
  element: JsxSelfClosingElement | JsxElement | JsxFragment,
): { exportName: string; filePath: string } {
  if (Node.isJsxFragment(element)) {
    return { exportName: "", filePath: "" };
  }

  const tagNode = Node.isJsxSelfClosingElement(element)
    ? element.getTagNameNode()
    : element.getOpeningElement().getTagNameNode();
  const sourceFile = tagNode.getSourceFile();
  const filePath = normalize(sourceFile.getFilePath());
  // Grab the local declaration in the same module. This represents either
  // a variable/function declaration, or an import.
  const declaration = sourceFile
    .getLocal(tagNode.getText())
    ?.getDeclarations()[0];

  if (declaration) {
    if (Node.isImportClause(declaration)) {
      const moduleFilePath = declaration
        .getParent()
        // @ts-expect-error Upgrading TSC breaks this. Fix it!
        .getModuleSpecifierSourceFile()
        ?.getFilePath();

      if (moduleFilePath && !moduleFilePath.includes("node_modules")) {
        return {
          exportName: "default",
          filePath: normalize(moduleFilePath),
        };
      }
    }

    if (Node.isImportSpecifier(declaration)) {
      const moduleFilePath = declaration
        .getParent()
        .getParent()
        .getParent()
        // @ts-expect-error Upgrading TSC breaks this. Fix it!
        .getModuleSpecifierSourceFile()
        ?.getFilePath();

      if (moduleFilePath && !moduleFilePath.includes("node_modules")) {
        return {
          exportName: declaration.getName(),
          filePath: normalize(moduleFilePath),
        };
      }
    }

    if (Node.isVariableDeclaration(declaration)) {
      const parent = declaration.getParent().getParent();

      if (Node.isVariableStatement(parent) && parent.isExported()) {
        return { exportName: declaration.getName(), filePath };
      }
    }

    if (Node.isFunctionDeclaration(declaration)) {
      if (declaration.isDefaultExport()) {
        return { exportName: "default", filePath };
      }

      if (declaration.isNamedExport()) {
        return { exportName: declaration.getNameOrThrow(), filePath };
      }
    }
  }

  // Couldn't find it? Bail out.
  return { exportName: "", filePath: "" };
}

export function getExportName(
  sourceFile: SourceFileReadOnly,
  exportName: string,
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
    if (
      Node.isFunctionDeclaration(declaration) ||
      Node.isFunctionExpression(declaration)
    ) {
      return { declaration, name: declaration.getNameOrThrow() };
    }

    if (Node.isVariableDeclaration(declaration)) {
      return { declaration, name: declaration.getName() };
    }

    if (Node.isIdentifier(declaration)) {
      return { declaration, name: declaration.getText() };
    }

    throw new Error(
      "invariant: default export should be a function declaration",
    );
  }

  throw new Error(`invariant: no export ${exportName} found`);
}
