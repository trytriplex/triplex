/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { watch } from "chokidar";
import { join } from "upath";
import { describe, expect, it, vi } from "vitest";
import { createProject } from "../project";

function normalLines(source: string): string {
  return source.replaceAll("\r\n", "\n");
}

function waitForChange(path: string) {
  return new Promise<void>((resolve) => {
    watch(path, {
      // We wait the write finish so we can be notified last.
      awaitWriteFinish: true,
      ignoreInitial: true,
    }).once("change", () => {
      resolve();
    });
  });
}

describe("undo/redo edge cases", () => {
  it(
    "should redo to a previous state after saving",
    async () => {
      const project = createProject({
        cwd: process.cwd(),
        templates: { newElements: "" },
        tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
      });
      const sourceFile = project.getSourceFile(
        join(__dirname, "__mocks__", "box.tsx"),
      );

      await sourceFile.edit((s) => {
        s.addClass({ name: "Foo" });
      });
      await sourceFile.edit((s) => {
        s.addClass({ name: "Bar" });
      });
      const expected = normalLines(sourceFile.read().getText());

      await sourceFile.undo();
      await sourceFile.save();
      await sourceFile.redo();

      expect(normalLines(sourceFile.read().getText())).toEqual(expected);
    },
    // Because we're saving to the fs this test can take a while. Especially on Windows.
    { timeout: 10_000 },
  );

  // TODO: This unit test is flakey on Windows. It could be the fix, or it could be the test.
  // See: https://github.com/try-triplex/triplex-monorepo/blob/fa8fa3f5227cfee4ba8055e22a153223ee1a4a47/packages/@triplex/server/src/ast/project.ts#L410
  it.skip(
    "should not trigger a watcher event when saving",
    async () => {
      const project = createProject({
        cwd: process.cwd(),
        templates: { newElements: "" },
        tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
      });
      const stateChangeCallback = vi.fn();
      project.onStateChange(stateChangeCallback);
      const sourceFile = project.getSourceFile(
        join(__dirname, "__mocks__", "box.tsx"),
      );
      const waitPromise = waitForChange(sourceFile.read().getFilePath());

      await sourceFile.edit((s) => {
        s.addClass({ name: "Foo" });
      });
      await sourceFile.save();
      await waitPromise;

      expect(stateChangeCallback).toHaveBeenCalledTimes(2);
    },
    // Because we're saving to the fs this test can take a while. Especially on Windows.
    { timeout: 10_000 },
  );

  it(
    "should redo to a previous state after saving when using explicit ids",
    async () => {
      const project = createProject({
        cwd: process.cwd(),
        templates: { newElements: "" },
        tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
      });
      // Starts at 0
      const sourceFile = project.getSourceFile(
        join(__dirname, "__mocks__", "box.tsx"),
      );

      // Undo pointer now at 1
      await sourceFile.edit((s) => {
        s.addClass({ name: "Foo" });
      });
      // Undo pointer now at 2
      await sourceFile.edit((s) => {
        s.addClass({ name: "Bar" });
      });
      const expected = sourceFile.read().getText();

      await sourceFile.undo(1);
      await sourceFile.save();
      await sourceFile.redo(2);

      expect(sourceFile.read().getText()).toEqual(expected);
    },
    // Because we're saving to the fs this test can take a while. Especially on Windows.
    { timeout: 10_000 },
  );

  it("should not add to the undo stack if nothing changed", async () => {
    const project = createProject({
      cwd: process.cwd(),
      templates: { newElements: "" },
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const sourceFile = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx"),
    );

    await sourceFile.edit(() => {});

    expect(await sourceFile.undo().state).toEqual("unmodified");
  });
});
