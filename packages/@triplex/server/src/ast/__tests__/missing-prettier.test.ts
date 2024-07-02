/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join } from "upath";
import { expect, it, vi } from "vitest";
import { createProject } from "../project";

Object.assign(process, { send: () => {} });
vi.mock(process.cwd() + "/node_modules/prettier/index.cjs", () => ({
  default: undefined,
}));

it("should gracefully handle throws when prettier is missing", async () => {
  const consoleSpy = vi.spyOn(console, "error");
  const project = createProject({
    cwd: process.cwd(),
    templates: { newElements: "" },
    tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
  });
  const sourceFile = project.getSourceFile(
    join(__dirname, "__mocks__", "box.tsx"),
  );
  sourceFile.open("default");
  await sourceFile.edit((source) => {
    source.addFunction({ name: "foo" });
  });

  await sourceFile.save();

  expect(consoleSpy).toHaveBeenCalled();
});
