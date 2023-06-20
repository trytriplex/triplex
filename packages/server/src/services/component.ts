import {
  JsxElement,
  JsxSelfClosingElement,
  Node,
  SourceFile,
  SyntaxKind,
  ts,
} from "ts-morph";
import { basename, extname, relative } from "path";
import { getExportName } from "../ast/module";
import { getJsxElementAt } from "../ast/jsx";
import { inferExports } from "../util/module";
import { ComponentRawType, ComponentTarget } from "../types";

function guessComponentNameFromPath(path: string) {
  const name = basename(path)
    .replace(extname(path), "")
    .replace(/-[a-z]/g, (match) => match.replace("-", "").toUpperCase());
  return name[0].toUpperCase() + name.slice(1);
}

function extractPath(dirPath: string, targetPath: string) {
  const isSrc =
    targetPath.startsWith(".") ||
    targetPath.startsWith("/") ||
    targetPath.match(/^[A-Z]:\\/);

  if (isSrc) {
    const targetFilename = `${basename(targetPath).replace(
      extname(targetPath),
      ""
    )}`;
    const relativePath = relative(
      dirPath,
      targetPath.replace(basename(targetPath), "")
    );

    if (relativePath === "") {
      return "./" + relativePath + targetFilename;
    }

    if (relativePath[0] === ".") {
      return relativePath + "/" + targetFilename;
    }

    return "./" + (relativePath + "/" + targetFilename);
  }

  return targetPath;
}

function propsToString(props: Record<string, unknown>) {
  const attributes: string[] = [];

  for (const key in props) {
    const prop = props[key];
    let value: string;

    switch (typeof prop) {
      case "string":
        value = `"${prop}"`;
        break;

      default:
        value = `{${prop}}`;
    }

    attributes.push(`${key}=${value}`);
  }

  return attributes.join(" ");
}

function insertJsxElement(
  sourceFile: SourceFile,
  target: Node<ts.Node>,
  componentName: string,
  componentProps: Record<string, unknown>
) {
  const jsxFrag = target.getFirstDescendantByKind(SyntaxKind.JsxFragment);
  const jsxEle = target.getFirstDescendantByKind(SyntaxKind.JsxElement);

  let line: number;
  let column: number;

  const componentText = `<${componentName} ${propsToString(componentProps)}/>`;

  if (jsxFrag) {
    const pos = jsxFrag.getClosingFragment().getStart();
    ({ column, line } = sourceFile.getLineAndColumnAtPos(pos));
    sourceFile.insertText(pos, componentText);
  } else if (jsxEle) {
    const jsxElementName = jsxEle
      .getOpeningElement()
      .getTagNameNode()
      .getText();
    if (!["Fragment", "group"].includes(jsxElementName)) {
      throw new Error("invariant: can only add to a fragment or group");
    }

    const pos = jsxEle.getClosingElement().getStart();
    ({ column, line } = sourceFile.getLineAndColumnAtPos(pos));
    sourceFile.insertText(pos, componentText);
  } else {
    throw new Error("invariant: could not find jsx element to add to");
  }

  return {
    column,
    line,
  };
}

function addToJsxElement(
  sourceFile: SourceFile,
  target: { line: number; column: number; action: "child" },
  componentName: string,
  componentProps: Record<string, unknown>
): { column: number; line: number } {
  const element = getJsxElementAt(sourceFile, target.line, target.column);
  if (!element) {
    throw new Error("invariant: element not found");
  }

  const componentText = `<${componentName} ${propsToString(componentProps)}/>`;

  if (Node.isJsxElement(element)) {
    const children = element.getJsxChildren();
    const openingText = element.getOpeningElement().getText();
    const closingText = element.getClosingElement().getText();
    const childrenText = children.map((child) => child.getText()).join("");
    const pos = sourceFile.getLineAndColumnAtPos(
      element.getClosingElement().getStart()
    );

    element.replaceWithText(
      openingText + childrenText + componentText + closingText
    );

    return {
      line: pos.line,
      column: pos.column,
    };
  }

  const openingText = element.getText().replace(" />", ">");
  const closingText = `</${element.getTagNameNode().getText()}>`;

  element.replaceWithText(openingText + componentText + closingText);

  return {
    line: target.line,
    column: target.column + openingText.length,
  };
}

export function includesComponent(sourceFile: SourceFile, exportName: string) {
  const foundExports = inferExports(sourceFile.getText());

  return !!foundExports.find((exp) => exp.exportName === exportName);
}

export function create(sourceFile: SourceFile) {
  let count = 0;
  let exportName = "Untitled";

  while (includesComponent(sourceFile, exportName)) {
    // Find a filename that doesn't exist
    count += 1;
    exportName = `Untitled${count}`;
  }

  sourceFile.addFunction({
    isExported: true,
    name: exportName,
    statements: `return <></>;`,
  });

  return { exportName };
}

export function add(
  sourceFile: SourceFile,
  exportName: string,
  component: ComponentRawType,
  target?: ComponentTarget
): { line: number; column: number } {
  const { declaration } = getExportName(sourceFile, exportName);

  if (Node.isFunctionDeclaration(declaration)) {
    if (component.type === "host") {
      const { column, line } = target
        ? addToJsxElement(sourceFile, target, component.name, component.props)
        : insertJsxElement(
            sourceFile,
            declaration.getBodyOrThrow(),
            component.name,
            component.props
          );

      return {
        column,
        line,
      };
    } else if (component.type === "custom") {
      const moduleSpecifier = extractPath(
        sourceFile.getDirectoryPath(),
        component.path
      );

      let existingImport = sourceFile.getImportDeclaration((decl) => {
        return decl.getModuleSpecifierValue() === moduleSpecifier;
      });

      let importName: string;
      let aliasImportName: string | undefined;

      if (existingImport) {
        if (component.exportName === "default") {
          // Default export - check if it's already exported. If it is reuse the same name.
          const foundDefaultImport = existingImport.getDefaultImport();
          if (foundDefaultImport) {
            importName = foundDefaultImport.getText();
          } else {
            importName = "";
          }
        } else {
          // Named export - check if it's already exported. If it is reuse the same name.
          const foundNamedImport = existingImport
            .getNamedImports()
            .find(
              (imp) => imp.getNameNode().getText() === component.exportName
            );

          if (foundNamedImport) {
            importName = foundNamedImport.getNameNode().getText();
            aliasImportName = foundNamedImport.getAliasNode()?.getText();
          } else {
            importName = component.exportName;
            if (sourceFile.getLocal(importName)) {
              aliasImportName = importName + "1";
            }
          }
        }
      } else {
        importName =
          component.exportName === "default"
            ? guessComponentNameFromPath(component.path)
            : component.exportName;

        if (sourceFile.getLocal(importName)) {
          aliasImportName = importName + "1";
        }
      }

      existingImport = sourceFile.getImportDeclaration((decl) => {
        return decl.getModuleSpecifierValue() === moduleSpecifier;
      });

      if (existingImport) {
        if (component.exportName === "default") {
          existingImport.setDefaultImport(aliasImportName || importName);
        }

        if (component.exportName !== "default") {
          const preExistingImport = existingImport
            .getNamedImports()
            .find(
              (x) =>
                x.getAliasNode()?.getText() === aliasImportName &&
                x.getName() === importName
            );

          if (!preExistingImport) {
            existingImport.insertNamedImport(0, {
              alias: aliasImportName,
              name: importName,
              isTypeOnly: false,
            });
          }
        }
      } else {
        // We insert text to prevent pushing out jsx elements onto new lines.
        const defaultImport =
          component.exportName === "default"
            ? aliasImportName || importName
            : "";

        const namedImports =
          component.exportName !== "default"
            ? `${importName}${aliasImportName ? ` as ${aliasImportName}` : ""}`
            : "";

        const importDeclaration = `import ${defaultImport}${
          namedImports ? `{ ${namedImports} } ` : " "
        }from "${moduleSpecifier}";`;

        sourceFile.insertText(0, importDeclaration);
      }

      // Less than ideal but we need to find the declaration again because of the
      // Mutation we've done above for import statements. Not the end of the world
      // But might be a performance pitfall. This is a note for later to see if there
      // Are improvements to be made.
      const { declaration } = getExportName(sourceFile, exportName);

      if (!Node.isFunctionDeclaration(declaration)) {
        throw new Error("invariant");
      }

      // We add the JSX element after adding/updating imports so line/cols are always correct
      // For the freshly added JSX element.
      const { column, line } = target
        ? addToJsxElement(
            sourceFile,
            target,
            aliasImportName || importName,
            component.props
          )
        : insertJsxElement(
            sourceFile,
            declaration.getBodyOrThrow(),
            aliasImportName || importName,
            component.props
          );

      return {
        column,
        line,
      };
    }
  }

  throw new Error("invariant: unhandled");
}

export function upsertProp(
  jsxElement: JsxElement | JsxSelfClosingElement,
  propName: string,
  propValue: string
) {
  const attribute = jsxElement
    .getDescendantsOfKind(SyntaxKind.JsxAttribute)
    .find((prop) => prop.getName() === propName);

  if (attribute) {
    attribute.setInitializer(`{${propValue}}`);
    return "updated";
  }
  const newAttribute = {
    name: propName,
    initializer: `{${propValue}}`,
  };

  if (Node.isJsxElement(jsxElement)) {
    jsxElement.getOpeningElement().addAttribute(newAttribute);
  } else {
    jsxElement.addAttribute(newAttribute);
  }

  return "added";
}

const DELETED_PRAGMA = "@triplex_deleted";
const DELETE_PRE = `{/** ${DELETED_PRAGMA} `;
const DELETE_PRE_SAFE = `_/@@ ${DELETED_PRAGMA} `;
const DELETE_POST = "*/}";
const DELETE_POST_SAFE = "@/_";

export function commentComponent(
  sourceFile: SourceFile,
  line: number,
  column: number
) {
  const jsxElement = getJsxElementAt(sourceFile, line, column);
  if (!jsxElement) {
    throw new Error("invariant: jsx element not found");
  }

  let safeText = jsxElement.getText();

  if (safeText.includes(DELETED_PRAGMA)) {
    // There is a child that has been deleted. Replace all comments with other values.
    safeText = safeText
      .replaceAll(DELETE_PRE, DELETE_PRE_SAFE)
      .replaceAll(DELETE_POST, DELETE_POST_SAFE);
  }

  sourceFile.replaceText(
    [jsxElement.getStart(), jsxElement.getEnd()],
    DELETE_PRE + safeText + DELETE_POST
  );
}

export function uncommentComponent(
  sourceFile: SourceFile,
  line: number,
  column: number
) {
  const node = sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxExpression)
    .find((node) => {
      const pos = sourceFile.getLineAndColumnAtPos(node.getStart());
      if (
        pos.line === line &&
        pos.column === column &&
        node.getText().includes(DELETED_PRAGMA)
      ) {
        return true;
      }

      return false;
    });

  if (!node) {
    throw new Error("invariant: jsx element not found");
  }

  let text = node.getText().replace(DELETE_PRE, "").replace(DELETE_POST, "");

  const firstPreIndex = text.indexOf(DELETE_PRE_SAFE);
  const lastPostIndex = text.lastIndexOf(DELETE_POST_SAFE);
  if (firstPreIndex >= 0 && lastPostIndex >= 0) {
    text = text.replace(DELETE_PRE_SAFE, DELETE_PRE);
    text =
      text.substring(0, lastPostIndex) +
      DELETE_POST +
      text.substring(lastPostIndex + DELETE_POST_SAFE.length);
  }

  sourceFile.replaceText([node.getStart(), node.getEnd()], text);
}

export function deleteCommentComponents(sourceFile: SourceFile) {
  const nodes = sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxExpression)
    .filter((node) => {
      if (node.getText().includes(DELETED_PRAGMA)) {
        return true;
      }

      return false;
    });

  nodes.forEach((node) => {
    node.replaceWithText("");
  });
}

export function rename(
  sourceFile: SourceFile,
  exportName: string,
  newName: string
) {
  const { declaration } = getExportName(sourceFile, exportName);

  declaration.rename(newName);
}
