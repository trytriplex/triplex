/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { describe, expect, it } from "vitest";
import { applyStepModifiers, resolveValue } from "../use-step-modifiers";

describe("step modifiers", () => {
  it("should round to the nearest step value", () => {
    expect(resolveValue(0.6, 1)).toBe(1);
    expect(resolveValue(2.213, 1)).toBe(2);
    expect(resolveValue(undefined, 1)).toBe(undefined);
  });

  it("should return ctrl step", () => {
    const actual = applyStepModifiers(
      { ctrl: 10, default: 1 },
      { ctrl: true, shift: false },
    );

    expect(actual).toBe(10);
  });

  it("should return default step", () => {
    const actual = applyStepModifiers(
      { ctrl: 10, default: 1 },
      { ctrl: false, shift: false },
    );

    expect(actual).toBe(1);
  });

  it("should return number step [default]", () => {
    const actual = applyStepModifiers(1, { ctrl: false, shift: false });

    expect(actual).toBe(1);
  });

  it("should return ctrl modified step", () => {
    const actual = applyStepModifiers(1, { ctrl: true, shift: false });

    expect(actual).toBe(25);
  });

  it("should return shift + ctrl modified step", () => {
    const actual = applyStepModifiers(1, { ctrl: true, shift: true });

    expect(actual).toBe(2.5);
  });

  it("should apply divide by 10 when shift modifier is applied [default]", () => {
    const actual = applyStepModifiers(
      { ctrl: 10, default: 1 },
      { ctrl: false, shift: true },
    );

    expect(actual).toBe(0.1);
  });

  it("should apply divide by 10 when shift modifier is applied [ctrl]", () => {
    const actual = applyStepModifiers(
      { ctrl: 10, default: 1 },
      { ctrl: true, shift: true },
    );

    expect(actual).toBe(1);
  });
});
