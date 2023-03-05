import { join } from "path";
import { JsxElement, JsxSelfClosingElement, SyntaxKind } from "ts-morph";
import { describe, it, expect } from "vitest";
import os from "os";
import { cloneAndWrapSourceJsx } from "../transform";
import { findJsxElement } from "../jsx";
import { _createProject } from "../project";

function getUserDataPropString(
  jsxElement: JsxSelfClosingElement | JsxElement | undefined
) {
  return jsxElement
    ?.getParentIfKindOrThrow(SyntaxKind.JsxElement)
    .getOpeningElement()
    .getAttributeOrThrow("userData")
    .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)[0]
    .getText()
    .replace(process.cwd(), "/{cwd}");
}

describe("jsx transform", () => {
  it("should copy result to temp dir", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );

    const result = cloneAndWrapSourceJsx(sourceFile, os.tmpdir());

    expect(result.transformedPath).toEqual(
      join(os.tmpdir(), __dirname, "__mocks__/box.tsx")
    );
  });

  it("should return path for an external custom component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );

    const { transformedSourceFile } = cloneAndWrapSourceJsx(
      sourceFile,
      os.tmpdir()
    );
    const jsxElement = findJsxElement(transformedSourceFile, "Box");

    expect(getUserDataPropString(jsxElement)).toMatchInlineSnapshot(`
      "{ triplexSceneMeta: { name: \\"Box\\", line: 11, column: 6, props: { \\"position\\": [0.9223319881614562, 0, 4.703084245305494], \\"rotation\\": [
                      1.660031347769923, -0.07873115868670048, -0.7211124466452248,
                  ] } } }"
    `);
  });

  it("should return path for local custom component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );

    const { transformedSourceFile } = cloneAndWrapSourceJsx(
      sourceFile,
      os.tmpdir()
    );
    const jsxElement = findJsxElement(transformedSourceFile, "SceneAlt");

    expect(getUserDataPropString(jsxElement)).toMatchInlineSnapshot(
      '"{ triplexSceneMeta: { name: \\"SceneAlt\\", line: 19, column: 6, props: {} } }"'
    );
  });

  it("should transform scene objects into triplex groups", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );

    const { transformedSourceFile } = cloneAndWrapSourceJsx(
      sourceFile,
      os.tmpdir()
    );
    const jsxElement = transformedSourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.JsxElement
    );

    expect(jsxElement.print()).toMatchInlineSnapshot(`
      "<group userData={{ triplexSceneMeta: { name: \\"mesh\\", line: 9, column: 10, props: { \\"position\\": position, \\"rotation\\": rotation, \\"scale\\": scale } } }}><mesh position={position} rotation={rotation} scale={scale}>
            <boxGeometry args={[1, 1, 1]}/>
            <meshStandardMaterial color=\\"pink\\"/>
          </mesh></group>"
    `);
  });

  it("should add triplex meta to the exported functions", async () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/meta.tsx")
    );

    const { transformedPath } = cloneAndWrapSourceJsx(sourceFile, os.tmpdir());
    const module = await import(transformedPath);

    expect(module.default.triplexMeta).toEqual({ lighting: "default" });
    expect(module.MetaNamed.triplexMeta).toEqual({ lighting: "custom" });
  });

  it("should add triplex meta to a arrow function export", async () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const { transformedPath } = cloneAndWrapSourceJsx(sourceFile, os.tmpdir());
    const module = await import(transformedPath);

    expect(module.SceneArrow.triplexMeta).toEqual({ lighting: "default" });
  });

  it("should add triplex meta to hoc export", async () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const { transformedPath } = cloneAndWrapSourceJsx(sourceFile, os.tmpdir());
    const module = await import(transformedPath);

    expect(module.SceneWrapped.triplexMeta).toEqual({ lighting: "default" });
  });

  it("should strip leading trivia in cloned element", async () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/with-comments.tsx")
    );

    const { transformedSourceFile } = cloneAndWrapSourceJsx(
      sourceFile,
      os.tmpdir()
    );

    // Only one instance should exist as it should not be cloned anymore.
    expect(
      transformedSourceFile.getText().match(/\/\/ Hello there/g)
    ).toHaveLength(1);
    expect(transformedSourceFile.getText().match(/\/\/ OK/g)).toHaveLength(1);
  });
});
