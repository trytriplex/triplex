import { join } from "path";
import { describe, expect, it } from "vitest";
import { getJsxElementAt } from "../jsx";
import { _createProject } from "../project";
import { getJsxElementPropTypes } from "../type-infer";

describe("type infer", () => {
  it("should return types of a imported component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 12, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const types = getJsxElementPropTypes(sceneObject);

    expect(types).toEqual([
      {
        name: "position",
        required: false,
        description: null,
        type: {
          type: "tuple",
          value: [{ type: "number" }, { type: "number" }, { type: "number" }],
        },
      },
      {
        name: "rotation",
        required: false,
        description: null,
        type: {
          type: "tuple",
          value: [{ type: "number" }, { type: "number" }, { type: "number" }],
        },
      },
      {
        name: "scale",
        required: false,
        description: null,
        type: {
          type: "tuple",
          value: [{ type: "number" }, { type: "number" }, { type: "number" }],
        },
      },
    ]);
  });

  it("should return types of a local component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 20, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const types = getJsxElementPropTypes(sceneObject);

    expect(types).toEqual([
      {
        description: null,
        name: "color",
        required: false,
        type: {
          type: "string",
        },
      },
    ]);
  });

  it("should not throw when extracting types from typedef jsx", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 19, 10);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const types = getJsxElementPropTypes(sceneObject);

    expect(types?.length).toBeTruthy();
  });

  it("should get the jsx tag of a jsx element with children", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/variables.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 38, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const propTypes = getJsxElementPropTypes(sceneObject);

    expect(propTypes).toEqual([
      {
        name: "value",
        required: true,
        description: null,
        type: { type: "boolean" },
      },
      {
        name: "children",
        required: false,
        description: null,
        type: { type: "any" },
      },
    ]);
  });

  it("should extract same file types", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 28, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const propTypes = getJsxElementPropTypes(sceneObject);

    expect(propTypes).toEqual([]);
  });
});
