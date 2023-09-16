/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { describe, expect, it } from "vitest";
import { inferExports } from "../module";

describe("module", () => {
  it("should return names in a module", () => {
    const actual = inferExports(`
        export const HelloWorlds = () => {};

        const HealthPickup = () => {};

        export default HealthPickup;
    `);

    expect(actual).toEqual([
      { exportName: "HelloWorlds", name: "HelloWorlds" },
      { exportName: "default", name: "HealthPickup" },
    ]);
  });

  it("should infer name of default export func", () => {
    const actual = inferExports(`
        export default function UhhOkay() {};
    `);

    expect(actual).toEqual([{ exportName: "default", name: "UhhOkay" }]);
  });
});
