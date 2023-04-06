import {
  JsxElement,
  JsxSelfClosingElement,
  Node,
  SourceFile,
  SyntaxKind,
} from "ts-morph";
import { basename, extname, relative } from "path";
import { getExportName } from "../ast/module";

function guessComponentNameFromPath(path: string) {
  const name = basename(path)
    .replace(extname(path), "")
    .replace(/-[a-z]/g, (match) => match.replace("-", "").toUpperCase());
  return name[0].toUpperCase() + name.slice(1);
}

function extractPath(dirPath: string, targetPath: string) {
  const isSrc = targetPath.startsWith(".") || targetPath.startsWith("/");

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
      return "./" + targetFilename;
    }

    return relativePath + "/" + targetFilename;
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

export type ComponentType =
  | {
      type: "custom";
      path: string;
      exportName: string;
      props: Record<string, unknown>;
    }
  | {
      type: "host";
      name: string;
      props: Record<string, unknown>;
    };

export function add(
  sourceFile: SourceFile,
  exportName: string,
  component: ComponentType
): { line: number; column: number } {
  const { declaration } = getExportName(sourceFile, exportName);

  let componentImportName: string;
  let mappedComponentImportName: string | undefined;
  let componentName: string;
  let column: number;
  let line: number;

  if (component.type === "custom") {
    componentImportName =
      component.exportName === "default"
        ? guessComponentNameFromPath(component.path)
        : component.exportName;
    mappedComponentImportName = sourceFile.getLocal(componentImportName)
      ? componentImportName + "1"
      : undefined;
    componentName = mappedComponentImportName || componentImportName;
  } else {
    componentName = component.name;
    mappedComponentImportName = undefined;
    componentImportName = "";
  }

  if (Node.isFunctionDeclaration(declaration)) {
    const body = declaration.getBodyOrThrow();
    const jsxFrag = body.getFirstDescendantByKind(SyntaxKind.JsxFragment);
    const jsxEle = body.getFirstDescendantByKind(SyntaxKind.JsxElement);

    const componentText = `<${componentName} ${propsToString(
      component.props
    )}/>`;

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
  } else {
    throw new Error("invariant: unsupported declaration to add to");
  }

  if (component.type === "custom") {
    const moduleSpecifier = extractPath(
      sourceFile.getDirectoryPath(),
      component.path
    );
    const existingImport = sourceFile.getImportDeclaration((decl) => {
      return decl.getModuleSpecifierValue() === moduleSpecifier;
    });

    if (existingImport) {
      existingImport.set({
        defaultImport:
          component.exportName === "default"
            ? mappedComponentImportName || componentImportName
            : undefined,
        namedImports:
          component.exportName !== "default"
            ? [
                ...existingImport
                  .getNamedImports()
                  .map((named) => named.getText()),
                { name: componentImportName, alias: mappedComponentImportName },
              ]
            : undefined,
      });
    } else {
      // We insert text to prevent pushing out jsx elements onto new lines.
      const defaultImport =
        component.exportName === "default"
          ? mappedComponentImportName || componentImportName
          : "";

      const namedImports =
        component.exportName !== "default"
          ? `${componentImportName}${
              mappedComponentImportName ? `as ${mappedComponentImportName}` : ""
            }`
          : "";

      const importDeclaration = `import ${defaultImport}${
        namedImports ? `{ ${namedImports} } ` : " "
      }from "${moduleSpecifier}";`;

      sourceFile.insertText(0, importDeclaration);
    }
  }

  return {
    column,
    line,
  };
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
