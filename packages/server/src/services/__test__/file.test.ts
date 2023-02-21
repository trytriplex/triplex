import { join } from "path";
import { describe, expect, it } from "vitest";
import { getAllFiles } from "../file";

describe("file", () => {
  it("should fetch all files", async () => {
    const cwd = join(__dirname, "__mocks__", "all-files");
    const globs: string[] = [join(cwd, "*.tsx")];

    const files = await getAllFiles({ files: globs, cwd });

    expect(files).toEqual({
      cwd,
      scenes: [
        {
          name: "box",
          path: join(cwd, "box.tsx"),
          exports: ["default"],
        },
        {
          name: "scene",
          path: join(cwd, "scene.tsx"),
          exports: ["SceneDecl", "SceneAlt", "default"],
        },
      ],
    });
  });
});
