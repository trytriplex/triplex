import { describe, expect, it, vi } from "vitest";
import { readFile, readdir } from "fs/promises";
import { init } from "../init";
import { join } from "path";

type FS = typeof import("fs/promises");
const templateDir = join(__dirname, "../../../templates");

describe("init command", () => {
  describe("fresh init", () => {
    it("should return open path", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-new");

      const { openPath } = await init({
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(openPath).toEqual(join(cwd, "fresh-local", "src/scene.tsx"));
    });

    it("should copy over static files from template dir", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-new");

      await init({
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.copyFile).toHaveBeenCalledWith(
        join(templateDir, "gitignore"),
        join(cwd, "fresh-local", ".gitignore")
      );
      expect(stubFs.copyFile).toHaveBeenCalledWith(
        join(templateDir, "tsconfig.json"),
        join(cwd, "fresh-local", "tsconfig.json")
      );
      expect(stubFs.cp).toHaveBeenCalledWith(
        join(templateDir, "src"),
        join(cwd, "fresh-local", "src"),
        { recursive: true }
      );
      expect(stubFs.cp).toHaveBeenCalledWith(
        join(templateDir, ".triplex"),
        join(cwd, "fresh-local", ".triplex"),
        { recursive: true }
      );
    });

    it("should create new package.json", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-new");

      await init({
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.writeFile).toHaveBeenCalledWith(
        join(cwd, "fresh-local", "package.json"),
        `{
  "name": "fresh-local",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "editor": "triplex editor"
  },
  "dependencies": {
    "@react-three/drei": "^9.0.0",
    "@react-three/fiber": "^8.0.0",
    "@triplex/run": "^0.0.0-local",
    "@types/react": "^18.0.0",
    "@types/three": "^0.148.0",
    "react-dom": "^18.0.0",
    "react": "^18.0.0",
    "three": "^0.148.0"
  }
}
`
      );
    });
  });

  describe("existing init", () => {
    it("should copy example files over", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing");

      await init({
        cwd,
        name: "",
        pkgManager: "npm",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.cp).toHaveBeenCalledWith(
        join(templateDir, "src"),
        join(cwd, "src/triplex-examples"),
        { recursive: true }
      );
    });

    it("should update tsconfig once", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing");

      await init({
        cwd,
        name: "",
        pkgManager: "npm",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.writeFile).toHaveBeenCalledWith(
        join(cwd, "tsconfig.json"),
        `{
  "compilerOptions": {
    "jsx": "preserve",
    "types": [
      "@react-three/fiber"
    ]
  },
  "include": [
    "."
  ],
  "exclude": [
    "node_modules"
  ]
}
`
      );
    });

    it("should update git ignore", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing");

      await init({
        cwd,
        name: "",
        pkgManager: "npm",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.writeFile).toHaveBeenCalledWith(
        join(cwd, ".gitignore"),
        `node_modules
.triplex/tmp
`
      );
    });

    it("should update pkg json", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing");

      await init({
        cwd,
        name: "",
        pkgManager: "npm",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.writeFile).toHaveBeenCalledWith(
        join(cwd, "package.json"),
        `{
  "name": "app",
  "dependencies": {
    "already-exists": "^1.1.1",
    "@react-three/drei": "^9.0.0",
    "@react-three/fiber": "^8.0.0",
    "@triplex/run": "^0.0.0-local",
    "@types/react": "^18.0.0",
    "@types/three": "^0.148.0",
    "react-dom": "^18.0.0",
    "react": "^18.0.0",
    "three": "^0.148.0"
  },
  "scripts": {
    "editor": "triplex editor"
  }
}
`
      );
    });

    it("should return open path", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing");

      const { openPath } = await init({
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(openPath).toEqual(join(cwd, "src/triplex-examples/scene.tsx"));
    });
  });

  describe("existing init workspace", () => {
    it("should return open path", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing-workspace");

      const { openPath } = await init({
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(openPath).toEqual(
        join(cwd, "packages/triplex-examples/scene.tsx")
      );
    });
  });
});
