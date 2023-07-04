/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
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
          exports: [
            {
              exportName: "default",
              name: "Box",
            },
          ],
        },
        {
          name: "scene",
          path: join(cwd, "scene.tsx"),
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
        },
      ],
    });
  });
});
