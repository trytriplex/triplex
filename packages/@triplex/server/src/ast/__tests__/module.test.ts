/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { join } from "@triplex/lib/path";
import { describe, expect, it } from "vitest";
import { getJsxElementAt, getJsxElementAtOrThrow } from "../jsx";
import { getElementFilePath, getExportName } from "../module";
import { _createProject } from "../project";

describe("module", () => {
  it("should bail out for node modules", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/n_modules.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 19, 5);

    const path = getElementFilePath(sceneObject);

    expect(path).toEqual({
      exportName: "",
      filePath: "",
    });
  });

  it("should return fc component path", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/fc.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 9, 10);

    const path = getElementFilePath(sceneObject);

    expect(path).toEqual({
      exportName: "Home",
      filePath: join(__dirname, "__mocks__", "fc.tsx"),
    });
  });

  it("should return the file path and export", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const path = getElementFilePath(sceneObject);

    expect(path).toEqual({
      exportName: "default",
      filePath: join(__dirname, "__mocks__", "box.tsx"),
    });
  });

  it("should return component path even when any", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/meta.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 50, 10);

    const path = getElementFilePath(sceneObject);

    expect(path).toEqual({
      exportName: "AnyProps",
      filePath: join(__dirname, "__mocks__", "meta.tsx"),
    });
  });

  it("should return the name of a disconnected default export", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/cylinder.tsx"),
    );

    const { name } = getExportName(sourceFile, "default");

    expect(name).toEqual("Cylinder");
  });

  it("should ignore shadowed type", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/shadowed-type.tsx"),
    );

    const { name } = getExportName(sourceFile, "default");

    expect(name).toEqual("Plane");
  });

  it("should ignore shadowed interface", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/shadowed-interface.tsx"),
    );

    const { name } = getExportName(sourceFile, "default");

    expect(name).toEqual("Plane");
  });

  it("should ignore shadowed type import specifier", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/shadowed-type-import-specifier.tsx"),
    );

    const { name } = getExportName(sourceFile, "default");

    expect(name).toEqual("Plane");
  });

  it("should ignore shadowed type import", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/shadowed-type-import.tsx"),
    );

    const { name } = getExportName(sourceFile, "default");

    expect(name).toEqual("Plane");
  });

  it("should return the name of the direct default export function", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );

    const actual = getExportName(sourceFile, "default");

    expect(actual.name).toEqual("Scene");
  });

  it("should return the name of the named function declaration", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );

    const actual = getExportName(sourceFile, "SceneAlt");

    expect(actual.name).toEqual("SceneAlt");
  });

  it("should return the name of the named arrow function", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );

    const actual = getExportName(sourceFile, "SceneArrow");

    expect(actual.name).toEqual("SceneArrow");
  });

  it("should return default as the import", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 17, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      exportName: "default",
      filePath: join(__dirname, "__mocks__/box.tsx"),
    });
  });

  it("should return named import as the import", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 24, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      exportName: "Named",
      filePath: join(__dirname, "__mocks__/named.tsx"),
    });
  });

  it("should return mapped named import as the import", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      exportName: "Named",
      filePath: join(__dirname, "__mocks__/named.tsx"),
    });
  });

  it("should return in module name", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 26, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      exportName: "SceneAlt",
      filePath: join(__dirname, "__mocks__/import-named.tsx"),
    });
  });

  it("should return arrow func path", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 36, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      exportName: "SceneArrow",
      filePath: join(__dirname, "__mocks__/scene.tsx"),
    });
  });

  it("should return wrapped arrow func path", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 35, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const actual = getElementFilePath(sceneObject);

    expect(actual).toEqual({
      exportName: "SceneWrapped",
      filePath: join(__dirname, "__mocks__/scene.tsx"),
    });
  });
});
