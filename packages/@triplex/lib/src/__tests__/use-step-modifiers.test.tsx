/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// @vitest-environment jsdom
import { fireEvent, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { applyStepModifiers, useStepModifiers } from "../use-step-modifiers";

describe("step modifiers", () => {
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

  it("should set ctrl modifier", () => {
    const { result } = renderHook(() => {
      return useStepModifiers({ isDisabled: false });
    });

    fireEvent.keyDown(window, { ctrlKey: true });

    expect(result.current).toEqual({ ctrl: true, shift: false });
  });

  it("should set shift modifier", () => {
    const { result } = renderHook(() => {
      return useStepModifiers({ isDisabled: false });
    });

    fireEvent.keyDown(window, { shiftKey: true });

    expect(result.current).toEqual({ ctrl: false, shift: true });
  });

  it("should set both modifiers", () => {
    const { result } = renderHook(() => {
      return useStepModifiers({ isDisabled: false });
    });

    fireEvent.keyDown(window, { ctrlKey: true, shiftKey: true });

    expect(result.current).toEqual({ ctrl: true, shift: true });
  });

  it("should keep a modifier when releasing one", () => {
    const { result } = renderHook(() => {
      return useStepModifiers({ isDisabled: false });
    });

    fireEvent.keyDown(window, { ctrlKey: true, shiftKey: true });
    fireEvent.keyUp(window, { ctrlKey: false, shiftKey: true });

    expect(result.current).toEqual({ ctrl: false, shift: true });
  });

  it("should reset state when disabled", () => {
    const { rerender, result } = renderHook(
      ({ isDisabled = false }: { isDisabled?: boolean } = {}) => {
        return useStepModifiers({ isDisabled });
      },
    );

    fireEvent.keyDown(window, { ctrlKey: true, shiftKey: true });
    // This is emulating that the key up event has been lost.
    rerender({ isDisabled: true });

    expect(result.current).toEqual({ ctrl: false, shift: false });
  });
});
