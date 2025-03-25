/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { join } from "@triplex/lib/path";
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
