/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "upath";
import { describe, expect, it, vi } from "vitest";
import { init } from "../init";

type FS = typeof import("fs/promises");
const templateDir = join(__dirname, "../../templates");

describe("init command", () => {
  describe("fresh init", () => {
    it("should return open path", async () => {
      const stubFs: FS = {
        copyFile: vi.fn(),
        cp: vi.fn(),
        mkdir: vi.fn(),
        readFile,
        readdir,
        writeFile: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-new");

      const { open } = await init({
        __exec: stubExec,
        __fs: stubFs,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        template: "halloween",
      });

      expect(open).toEqual({
        exportName: "default",
        filepath: join(cwd, "fresh-local", "src/scene.tsx"),
      });
    });

    it("should copy over static files from template dir", async () => {
      const stubFs: FS = {
        copyFile: vi.fn(),
        cp: vi.fn(),
        mkdir: vi.fn(),
        readFile,
        readdir,
        writeFile: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-new");

      await init({
        __exec: stubExec,
        __fs: stubFs,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        template: "halloween",
      });

      expect(stubFs.copyFile).toHaveBeenCalledWith(
        join(templateDir, "gitignore"),
        join(cwd, "fresh-local", ".gitignore"),
      );
      expect(stubFs.copyFile).toHaveBeenCalledWith(
        join(templateDir, "tsconfig.json"),
        join(cwd, "fresh-local", "tsconfig.json"),
      );
      expect(stubFs.cp).toHaveBeenCalledWith(
        join(templateDir, "halloween"),
        join(cwd, "fresh-local"),
        { recursive: true },
      );
    });

    it("should create new package.json", async () => {
      const stubFs: FS = {
        copyFile: vi.fn(),
        cp: vi.fn(),
        mkdir: vi.fn(),
        readFile,
        readdir,
        writeFile: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-new");

      await init({
        __exec: stubExec,
        __fs: stubFs,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        template: "halloween",
      });

      expect(stubFs.writeFile).toHaveBeenCalledWith(
        join(cwd, "fresh-local", "package.json"),
        expect.stringContaining(`"name": "fresh-local"`),
      );
    });
  });
});
