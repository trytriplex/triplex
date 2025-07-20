/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { join } from "@triplex/lib/path";
import { describe, expect, it } from "vitest";
import { createProject } from "../../ast/project";
import { getAllFiles, getSceneExport } from "../file";

describe("file", () => {
  it("should return component line and column", () => {
    const cwd = join(__dirname, "__mocks__");
    const project = createProject({
      cwd,
      templates: { newElements: "" },
    });

    const actual = getSceneExport({
      exportName: "Box",
      files: [],
      path: join(cwd, "add-prop.tsx"),
      project,
    })!;

    expect(actual.column).toEqual(14);
    expect(actual.line).toEqual(38);
  });

  it("should fetch all files", async () => {
    const cwd = join(__dirname, "__mocks__", "all-files");
    const globs: string[] = [join(cwd, "*.tsx")];

    const files = await getAllFiles({ cwd, files: globs });

    expect(files).toEqual({
      cwd,
      scenes: [
        {
          exports: [
            {
              exportName: "default",
              name: "Box",
            },
          ],
          name: "box",
          path: join(cwd, "box.tsx"),
        },
        {
          exports: [
            {
              exportName: "SceneDecl",
              name: "SceneDecl",
            },
            {
              exportName: "SceneAlt",
              name: "SceneAlt",
            },
            {
              exportName: "default",
              name: "Scene",
            },
          ],
          name: "scene",
          path: join(cwd, "scene.tsx"),
        },
      ],
    });
  });
});
