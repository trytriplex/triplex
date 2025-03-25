/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { join } from "@triplex/lib/path";
import { describe, expect, it } from "vitest";
import { getJsxElementAtOrThrow, getJsxElementProps } from "../jsx";
import { _createProject } from "../project";

describe("no tsconfig project", () => {
  it("should resolve all props of a host element", () => {
    const project = _createProject({
      tsConfigFilePath: "",
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/meta.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 11, 9);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props.map((prop) => prop.name)).toMatchInlineSnapshot(`
      [
        "angle",
        "args",
        "attach",
        "castShadow",
        "children",
        "color",
        "decay",
        "distance",
        "frustumCulled",
        "intensity",
        "isLight",
        "isSpotLight",
        "layers",
        "name",
        "penumbra",
        "position",
        "power",
        "quaternion",
        "receiveShadow",
        "renderOrder",
        "rotation",
        "scale",
        "visible",
      ]
    `);
  });
});
