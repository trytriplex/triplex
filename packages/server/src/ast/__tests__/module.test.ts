import { join } from "path";
import { describe, expect, it } from "vitest";
import { getJsxElementAt } from "../jsx";
import { getExportName, getElementFilePath } from "../module";
import { _createProject } from "../project";

describe("module", () => {
  it("should return the file path and export", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 19, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const path = getElementFilePath(sceneObject);

    expect(path).toEqual({
      filePath: join(__dirname, "__mocks__/box.tsx"),
      exportName: "default",
    });
  });

  it("should return the name of a disconnected default export", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/cylinder.tsx")
    );

    const { name } = getExportName(sourceFile, "default");

    expect(name).toEqual("Cylinder");
  });

  it("should ignore shadowed type", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/shadowed-type.tsx")
    );

    const { name } = getExportName(sourceFile, "default");

    expect(name).toEqual("Plane");
  });

  it("should ignore shadowed interface", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/shadowed-interface.tsx")
    );

    const { name } = getExportName(sourceFile, "default");

    expect(name).toEqual("Plane");
  });

  it("should ignore shadowed type import specifier", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/shadowed-type-import-specifier.tsx")
    );

    const { name } = getExportName(sourceFile, "default");

    expect(name).toEqual("Plane");
  });

  it("should ignore shadowed type import", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/shadowed-type-import.tsx")
    );

    const { name } = getExportName(sourceFile, "default");

    expect(name).toEqual("Plane");
  });

  it("should return the name of the direct default export function", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const actual = getExportName(sourceFile, "default");

    expect(actual.name).toEqual("Scene");
  });

  it("should return the name of the named function declaration", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const actual = getExportName(sourceFile, "SceneAlt");

    expect(actual.name).toEqual("SceneAlt");
  });

  it("should return the name of the named arrow function", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const actual = getExportName(sourceFile, "SceneArrow");

    expect(actual.name).toEqual("SceneArrow");
  });

  it("should return default as the import", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 12, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      filePath: join(__dirname, "__mocks__/box.tsx"),
      exportName: "default",
    });
  });

  it("should return named import as the import", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 18, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      filePath: join(__dirname, "__mocks__/named.tsx"),
      exportName: "Named",
    });
  });

  it("should return mapped named import as the import", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 19, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      filePath: join(__dirname, "__mocks__/named.tsx"),
      exportName: "Named",
    });
  });

  it("should return in module name", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 20, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      filePath: join(__dirname, "__mocks__/import-named.tsx"),
      exportName: "SceneAlt",
    });
  });

  it("should return arrow func path", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 30, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      filePath: join(__dirname, "__mocks__/scene.tsx"),
      exportName: "SceneArrow",
    });
  });

  it("should return wrapped arrow func path", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 29, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      filePath: join(__dirname, "__mocks__/scene.tsx"),
      exportName: "SceneWrapped",
    });
  });
});
