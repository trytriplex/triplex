import { join } from "path";
import { getDefaultExportFunctionName } from "../module";
import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";

describe("module", () => {
  it("should return the name of the direct default export function", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const actual = getDefaultExportFunctionName(sourceFile);

    expect(actual).toEqual("Scene");
  });
});
