import type { PluginObj } from "@babel/core";
import * as t from "@babel/types";

export default function triplexBabelPlugin() {
  const cache = new WeakSet();
  const triplexMeta = new Map<string, { lighting: "default" | "custom" }>();
  const SCENE_OBJECT_COMPONENT_NAME = "SceneObject";

  let current: string | undefined = undefined;

  const plugin: PluginObj = {
    visitor: {
      FunctionDeclaration: {
        enter(path) {
          if (path.node.id && /^[A-Z]/.exec(path.node.id.name)) {
            current = path.node.id.name;
          }
        },
        exit(path) {
          if (path.node.id && path.node.id.name === current) {
            current = undefined;
          }
        },
      },
      VariableDeclarator: {
        enter(path) {
          if (
            path.node.id.type === "Identifier" &&
            /^[A-Z]/.exec(path.node.id.name)
          ) {
            current = path.node.id.name;
          }
        },
        exit(path) {
          if (
            path.node.id.type === "Identifier" &&
            path.node.id.name === current
          ) {
            current = undefined;
          }
        },
      },
      Program: {
        exit(path) {
          for (const [key, value] of triplexMeta) {
            path.pushContainer(
              "body",
              t.expressionStatement(
                t.assignmentExpression(
                  "=",
                  t.memberExpression(
                    t.identifier(key),
                    t.identifier("triplexMeta")
                  ),
                  t.objectExpression([
                    t.objectProperty(
                      t.stringLiteral("lighting"),
                      t.stringLiteral(value.lighting)
                    ),
                  ])
                )
              )
            );
          }

          triplexMeta.clear();
        },
      },
      JSXElement(path, pass) {
        if (
          cache.has(path.node) ||
          path.node.openingElement.name.type !== "JSXIdentifier" ||
          !path.node.loc
        ) {
          return;
        }

        cache.add(path.node);

        if (current && !triplexMeta.has(current)) {
          triplexMeta.set(current, { lighting: "default" });
        }

        const elementName = path.node.openingElement.name.name;
        const isCustomElement = /^[A-Z]/.exec(elementName);

        if (current && elementName.endsWith("Light")) {
          const meta = triplexMeta.get(current);
          if (meta) {
            meta.lighting = "custom";
          }
        }

        const line = path.node.loc.start.line;
        // Align to tsc where column numbers start from 1
        const column = path.node.loc.start.column + 1;
        let keyNode: t.Expression | undefined;
        const attributes = path.node.openingElement.attributes.filter(
          (attr) => {
            if (attr.type === "JSXAttribute" && attr.name.name === "key") {
              if (t.isStringLiteral(attr.value)) {
                keyNode = attr.value;
              } else if (
                t.isJSXExpressionContainer(attr.value) &&
                t.isExpression(attr.value.expression)
              ) {
                keyNode = attr.value.expression;
              }

              return false;
            }

            return true;
          }
        );

        const newNode = t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME), [
            ...attributes,
            t.jsxAttribute(
              t.jsxIdentifier("__component"),
              t.jsxExpressionContainer(
                isCustomElement
                  ? t.identifier(elementName)
                  : t.stringLiteral(elementName)
              )
            ),
            t.jsxAttribute(
              t.jsxIdentifier("__meta"),
              t.jsxExpressionContainer(
                t.objectExpression([
                  t.objectProperty(
                    t.stringLiteral("path"),
                    t.stringLiteral(pass.filename || "")
                  ),
                  t.objectProperty(
                    t.stringLiteral("name"),
                    t.stringLiteral(elementName)
                  ),
                  t.objectProperty(
                    t.stringLiteral("line"),
                    t.numericLiteral(line)
                  ),
                  t.objectProperty(
                    t.stringLiteral("column"),
                    t.numericLiteral(column)
                  ),
                ])
              )
            ),
            t.jsxAttribute(
              t.jsxIdentifier("key"),
              t.jsxExpressionContainer(
                keyNode
                  ? t.binaryExpression(
                      "+",
                      t.stringLiteral(elementName + line + column),
                      keyNode
                    )
                  : t.stringLiteral(elementName + line + column)
              )
            ),
          ]),
          t.jsxClosingElement(t.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME)),
          path.node.children
        );

        path.replaceWith(newNode);
      },
    },
  };

  return plugin;
}
