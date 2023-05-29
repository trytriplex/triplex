import { describe, expect, it } from "vitest";
import { createProject } from "../project";
import { join } from "path";

describe("project ast", () => {
  it("should return save state", async () => {
    const project = createProject({
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const { sourceFile } = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );

    expect(sourceFile.isSaved()).toEqual(true);
  });

  it("should return unsaved state", () => {
    const project = createProject({
      tsConfigFilePath: join(__dirname, "__mocks__", "tsconfig.json"),
    });
    const { sourceFile } = project.getSourceFile(
      join(__dirname, "__mocks__", "box.tsx")
    );

    sourceFile.addFunction({});

    expect(sourceFile.isSaved()).toEqual(false);
  });
});
