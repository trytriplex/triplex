/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NumberInput } from "../number-input";

const TestHarness = (testProps: {
  defaultValue?: number;
  onChange?: (value?: number) => void;
  onConfirm?: (value?: number) => void;
  persistedValue?: number;
  step?: number;
}) => (
  <NumberInput
    actionId="assetsdrawer_assets"
    name="number"
    onChange={vi.fn()}
    onConfirm={vi.fn()}
    {...testProps}
  >
    {(props, { isActive }) => (
      <input
        {...props}
        data-is-active={isActive}
        data-testid="input"
        type="number"
      />
    )}
  </NumberInput>
);

describe("number input", () => {
  it("should return the unmodified value in change and confirm", () => {
    // The context for this test is that the number input should only treat steps
    // as a guide rather than validation. If a value is entered that isn't a multiple of the
    // step that is A-OK.
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getByTestId } = render(
      <TestHarness
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={1}
      />,
    );
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "2.00003" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(2.000_03);
    expect(onConfirm).toHaveBeenCalledWith(2.000_03);
  });

  it("should remove step attribute when inactive", () => {
    const { getByTestId } = render(<TestHarness persistedValue={1} />);
    const input = getByTestId("input") as HTMLInputElement;

    expect(input.getAttribute("step")).toEqual("any");
  });

  it("should add step attribute when active", () => {
    const { getByTestId } = render(<TestHarness persistedValue={1} />);
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.focus(input);

    expect(input.getAttribute("step")).toEqual("0.02");
  });

  it("should add custom step attribute when active", () => {
    const { getByTestId } = render(<TestHarness persistedValue={1} step={5} />);
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.focus(input);

    expect(input.getAttribute("step")).toEqual("5");
  });

  it("should ignore right click", () => {
    const { getByTestId } = render(<TestHarness persistedValue={1} />);
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.pointerDown(input, { button: 1 });

    expect(input.getAttribute("data-is-active")).toEqual("false");
  });

  it("should set persisted value", () => {
    const { getByTestId } = render(<TestHarness persistedValue={1} />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("1");
  });

  it("should update value when persisted value changes", () => {
    const { getByTestId, rerender } = render(
      <TestHarness persistedValue={2} />,
    );

    rerender(<TestHarness persistedValue={3} />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("3");
  });

  it("should set default value", () => {
    const { getByTestId } = render(<TestHarness defaultValue={1} />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("1");
  });

  it("should update default value", () => {
    const { getByTestId, rerender } = render(<TestHarness defaultValue={2} />);

    rerender(<TestHarness defaultValue={2} />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("2");
  });

  it("should prioritize persisted value", () => {
    const { getByTestId } = render(
      <TestHarness defaultValue={3} persistedValue={0} />,
    );

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("0");
  });
});
