/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { describe, expect, it } from "vitest";
import { normalize } from "../path";

describe("path", () => {
  it("should remove leading slashes on Windows", () => {
    const actual = normalize("/c:/foo/bar");

    expect(actual).toEqual("C:/foo/bar");
  });
});
