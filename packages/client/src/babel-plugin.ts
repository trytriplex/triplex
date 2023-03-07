import type { NodePath, PluginObj } from "@babel/core";
import type { JSXElement } from "@babel/types";
import * as t from "@babel/types";

function isSceneObject(path: NodePath<JSXElement>): boolean {
  const exclusions = ["Material", "Geometry"];

  if (path.node.openingElement.name.type === "JSXIdentifier") {
    const tagName = path.node.openingElement.name.name;
    if (exclusions.find((n) => tagName.includes(n))) {
      return false;
    }
  }

  return true;
}

function toObjectExpression(
  attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[]
) {
  return t.objectExpression(
    attributes.map((attr) => {
      if (attr.type === "JSXSpreadAttribute") {
        return t.spreadElement(attr.argument);
      }

      let value: t.Expression;

      if (!attr.value) {
        value = t.booleanLiteral(true);
      } else if (attr.value.type === "StringLiteral") {
        value = attr.value;
      } else if (
        attr.value.type === "JSXExpressionContainer" &&
        attr.value.expression.type !== "JSXEmptyExpression"
      ) {
        value = attr.value.expression;
      } else {
        throw new Error("invariant");
      }

      const name =
        attr.name.type === "JSXIdentifier"
          ? attr.name.name
          : attr.name.name.name;

      return t.objectProperty(t.stringLiteral(name), value);
    })
  );
}

export default function triplexBabelPlugin() {
  const cache = new WeakSet();
  const triplexMeta = new Map<string, { lighting: "default" | "custom" }>();

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
          !isSceneObject(path) ||
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

        if (current && elementName.endsWith("Light")) {
          const meta = triplexMeta.get(current);
          if (meta) {
            meta.lighting = "custom";
          }
        }

        const keyAttributeIndex = path.node.openingElement.attributes.findIndex(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name.type === "JSXIdentifier" &&
            attr.name.name === "key"
        );
        const keyAttribute =
          path.node.openingElement.attributes[keyAttributeIndex];

        const newNode = t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier("group"),
            [
              keyAttribute!,
              t.jsxAttribute(
                t.jsxIdentifier("userData"),
                t.jsxExpressionContainer(
                  t.objectExpression([
                    t.objectProperty(
                      t.stringLiteral("triplexSceneMeta"),
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
                          t.numericLiteral(path.node.loc.start.line)
                        ),
                        t.objectProperty(
                          t.stringLiteral("column"),
                          // Align to tsc where column numbers start from 1
                          t.numericLiteral(path.node.loc.start.column + 1)
                        ),
                        t.objectProperty(
                          t.stringLiteral("props"),
                          toObjectExpression(
                            path.node.openingElement.attributes
                          )
                        ),
                      ])
                    ),
                  ])
                )
              ),
            ].filter(Boolean)
          ),
          t.jsxClosingElement(t.jsxIdentifier("group")),
          [path.node]
        );

        if (keyAttribute) {
          path.node.openingElement.attributes.splice(keyAttributeIndex, 1);
        }

        path.replaceWith(newNode);
      },
    },
  };

  return plugin;
}
