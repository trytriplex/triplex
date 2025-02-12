/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { describe, expect, it } from "vitest";
import { inferExports } from "../module";

describe("module", () => {
  it("should return names in a module", () => {
    const actual = inferExports(`
        export const HelloWorlds = memo(() => {});

        const HealthPickup = memo(() => {});

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

  it("should infer export default memo", () => {
    const actual = inferExports(`
        export default memo(HelloWorld);
    `);

    expect(actual).toEqual([{ exportName: "default", name: "HelloWorld" }]);
  });
});
