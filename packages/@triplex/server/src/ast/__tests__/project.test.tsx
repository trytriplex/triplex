/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join } from "upath";
import { describe, expect, it, vitest } from "vitest";
import { createProject } from "../project";

describe("project ast", () => {
  it("should return save state", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );

    await sourceFile.edit(() => {});

    expect(sourceFile.read().isSaved()).toEqual(true);
  });

  it("should return unsaved state", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );

    await sourceFile.edit((source) => {
      source.addFunction({});
    });

    expect(sourceFile.read().isSaved()).toEqual(false);
  });

  it("should return default project state", () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });

    expect(project.getState()).toEqual([]);
  });

  it("should return edited project state", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );

    sourceFile.open("default");
    await sourceFile.edit((source) => source.addClass({ name: "foo" }));
    await sourceFile.edit((source) => source.addClass({ name: "foo" }));
    await sourceFile.edit((source) => source.addClass({ name: "foo" }));

    expect(project.getState()).toEqual([
      {
        exportName: "default",
        fileName: "box.tsx",
        filePath: join(
          process.cwd(),
          "packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx"
        ),
        isDirty: true,
        isNew: false,
      },
    ]);
  });

  it("should reset project state when saving", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );
    sourceFile.open("default");
    await sourceFile.edit(() => {});

    await project.saveAll();

    expect(project.getState()).toEqual([
      {
        exportName: "default",
        fileName: "box.tsx",
        filePath: join(
          process.cwd(),
          "packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx"
        ),
        isDirty: false,
        isNew: false,
      },
    ]);
  });

  it("should open a file into a specific index", () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    project.createSourceFile("Untitled").open("Untitled");
    project.createSourceFile("Untitled").open("Untitled");
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );

    sourceFile.open("default", 0);

    expect(project.getState()).toEqual([
      {
        exportName: "default",
        fileName: "box.tsx",
        filePath: join(
          process.cwd(),
          "packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx"
        ),
        isDirty: false,
        isNew: false,
      },
      {
        exportName: "Untitled",
        fileName: "untitled.tsx",
        filePath: join(process.cwd(), "/src/untitled.tsx"),
        isDirty: false,
        isNew: true,
      },
      {
        exportName: "Untitled",
        fileName: "untitled1.tsx",
        filePath: join(process.cwd(), "/src/untitled1.tsx"),
        isDirty: false,
        isNew: true,
      },
    ]);
  });

  it("should not go out of bounds when opening at a specific index", () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );

    sourceFile.open("default", 10);

    expect(project.getState()).toEqual([
      {
        exportName: "default",
        fileName: "box.tsx",
        filePath: join(
          process.cwd(),
          "packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx"
        ),
        isDirty: false,
        isNew: false,
      },
    ]);
  });

  it("should ignore saving new files when saving all", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );
    project.createSourceFile("Untitled").open("Untitled");
    sourceFile.open("default");
    sourceFile.open("default");
    await sourceFile.edit(() => {});

    await project.saveAll();

    expect(project.getState()).toEqual([
      {
        exportName: "Untitled",
        fileName: "untitled.tsx",
        filePath: join(process.cwd(), "/src/untitled.tsx"),
        isDirty: false,
        isNew: true,
      },
      {
        exportName: "default",
        fileName: "box.tsx",
        filePath: join(
          process.cwd(),
          "packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx"
        ),
        isDirty: false,
        isNew: false,
      },
    ]);
  });

  it("should callback when state changes", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );
    const cb = vitest.fn();
    project.onStateChange(cb);

    await sourceFile.edit((source) => {
      source.addFunction({ name: "foo" });
    });

    expect(cb).toHaveBeenCalled();
  });

  it("should cleanup state change callback", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );
    const cb = vitest.fn();
    const cleanup = project.onStateChange(cb);

    cleanup();
    await sourceFile.edit(() => {});

    expect(cb).not.toHaveBeenCalled();
  });

  it("should undo to a specific revision", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "<></>" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.createSourceFile("Untitled");

    await sourceFile.edit((source) => {
      source.addFunction({
        name: "aaa",
      });
    });
    const [ids] = await sourceFile.edit((source) => {
      source.addFunction({
        name: "bbb",
      });
    });
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "ccc",
      });
    });

    // Will undo to the revsion prior to this one
    sourceFile.undo(ids.undoID);

    expect(sourceFile.read().getText()).toMatchInlineSnapshot(`
      "export function Untitled() {
        return <></>;
      }

      function aaa() {
      }
      "
    `);
  });

  it("should redo to a specific revision", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "<></>" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.createSourceFile("Untitled");

    const [ids] = await sourceFile.edit((source) => {
      source.addFunction({
        name: "foo",
      });
    });
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "bar",
      });
    });
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "baz",
      });
    });

    sourceFile.undo();
    sourceFile.undo();
    sourceFile.undo();
    sourceFile.undo();
    sourceFile.redo(ids.redoID);

    expect(sourceFile.read().getText()).toMatchInlineSnapshot(`
      "export function Untitled() {
        return <></>;
      }

      function foo() {
      }
      "
    `);
  });

  it("should undo to a past state and not go out of bounds", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "<></>" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.createSourceFile("Untitled");
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "foo",
      });
    });

    sourceFile.undo();
    sourceFile.undo();
    sourceFile.undo();
    sourceFile.undo();

    expect(sourceFile.read().getText()).toMatchInlineSnapshot(`
      "export function Untitled() {
        return <></>;
      }
      "
    `);
  });

  it("should undo and then redo and not go out of bounds", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "<></>" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.createSourceFile("Untitled");
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "foo",
      });
    });

    sourceFile.undo();
    sourceFile.redo();
    sourceFile.redo();
    sourceFile.redo();
    sourceFile.redo();

    expect(sourceFile.read().getText()).toMatchInlineSnapshot(`
      "export function Untitled() {
        return <></>;
      }

      function foo() {
      }
      "
    `);
  });

  it("should clear out future state after an undo if another edit takes place", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "<></>" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.createSourceFile("Untitled");
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "foo",
      });
    });
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "bar",
      });
    });
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "baz",
      });
    });
    sourceFile.undo();
    sourceFile.undo();
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "bat",
      });
    });

    sourceFile.redo();

    expect(sourceFile.read().getText()).toMatchInlineSnapshot(`
      "export function Untitled() {
        return <></>;
      }

      function foo() {
      }

      function bat() {
      }
      "
    `);
  });

  it("should clear dirty state when editing new file to be the same as current state", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.createSourceFile("Untitled");
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "foo",
      });
    });

    sourceFile.undo();

    expect(sourceFile.isDirty()).toEqual(false);
  });

  it("should set dirty state when editing new file to be the different to current state", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.createSourceFile("Untitled");
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "foo",
      });
    });

    sourceFile.undo();
    sourceFile.redo();

    expect(sourceFile.isDirty()).toEqual(true);
  });

  it("should set dirty state when editing existing file to be the different to current state", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "foo",
      });
    });

    sourceFile.undo();

    expect(sourceFile.isDirty()).toEqual(false);
  });

  it("should set dirty state when editing existing file to be the same to current state", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );
    await sourceFile.edit((source) => {
      source.addFunction({
        name: "foo",
      });
    });

    sourceFile.undo();
    sourceFile.redo();

    expect(sourceFile.isDirty()).toEqual(true);
  });
});
