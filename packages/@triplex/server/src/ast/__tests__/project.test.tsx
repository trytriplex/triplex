/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join } from "node:path";
import { describe, expect, it, vitest } from "vitest";
import { createProject } from "../project";

describe("project ast", () => {
  it("should return save state", async () => {
    const project = createProject({
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );

    sourceFile.edit(() => {});

    expect(sourceFile.read().isSaved()).toEqual(true);
  });

  it("should return unsaved state", () => {
    const project = createProject({
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );

    sourceFile.edit((source) => {
      source.addFunction({});
    });

    expect(sourceFile.read().isSaved()).toEqual(false);
  });

  it("should return default project state", () => {
    const project = createProject({
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });

    expect(project.getState()).toEqual([]);
  });

  it("should return edited project state", () => {
    const project = createProject({
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );

    sourceFile.open("default");
    sourceFile.edit(() => {});
    sourceFile.edit(() => {});
    sourceFile.edit(() => {});

    expect(project.getState()).toEqual([
      {
        exportName: "default",
        fileName: "box.tsx",
        filePath: join(
          process.cwd(),
          "packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx"
        ).replaceAll("\\", "/"),
        isDirty: true,
        isNew: false,
      },
    ]);
  });

  it("should reset project state when saving", async () => {
    const project = createProject({
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );
    sourceFile.open("default");
    sourceFile.edit(() => {});

    await project.saveAll();

    expect(project.getState()).toEqual([
      {
        exportName: "default",
        fileName: "box.tsx",
        filePath: join(
          process.cwd(),
          "packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx"
        ).replaceAll("\\", "/"),
        isDirty: false,
        isNew: false,
      },
    ]);
  });

  it("should ignore saving new files when saving all", async () => {
    const project = createProject({
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );
    project.createSourceFile("Untitled").open("Untitled");
    sourceFile.open("default");
    sourceFile.open("default");
    sourceFile.edit(() => {});

    await project.saveAll();

    expect(project.getState()).toEqual([
      {
        exportName: "Untitled",
        fileName: "untitled.tsx",
        filePath: join(process.cwd(), "/src/untitled.tsx").replaceAll(
          "\\",
          "/"
        ),
        isDirty: true,
        isNew: true,
      },
      {
        exportName: "default",
        fileName: "box.tsx",
        filePath: join(
          process.cwd(),
          "packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx"
        ).replaceAll("\\", "/"),
        isDirty: false,
        isNew: false,
      },
    ]);
  });

  it("should callback when state changes", () => {
    const project = createProject({
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );
    const cb = vitest.fn();
    project.onStateChange(cb);

    sourceFile.edit(() => {});

    expect(cb).toHaveBeenCalled();
  });

  it("should cleanup state change callback", () => {
    const project = createProject({
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );
    const cb = vitest.fn();
    const cleanup = project.onStateChange(cb);

    cleanup();
    sourceFile.edit(() => {});

    expect(cb).not.toHaveBeenCalled();
  });
});
