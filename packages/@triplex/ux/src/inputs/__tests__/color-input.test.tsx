/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorInput } from "../color-input";

const TestHarness = (testProps: {
  defaultValue?: string;
  onChange?: (value?: string) => void;
  onConfirm?: (value?: string) => void;
  persistedValue?: string;
  type?: "color" | "string";
}) => (
  <ColorInput
    actionId="assetsdrawer_assets"
    name="color"
    onChange={vi.fn()}
    onConfirm={vi.fn()}
    {...testProps}
  >
    {(props, { hasChanged }) => (
      <input
        {...props}
        data-has-changed={hasChanged}
        data-testid="input"
        type={testProps.type || "color"}
      />
    )}
  </ColorInput>
);

describe("color input", () => {
  it("should update value when persisted value changes", () => {
    const { getByTestId, rerender } = render(
      <TestHarness persistedValue="#fff" />,
    );

    rerender(<TestHarness persistedValue="#000" />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("#000000");
  });

  it("should transform non-hex color to hex color", () => {
    const { getByTestId } = render(<TestHarness persistedValue="blue" />);

    const input = getByTestId("input") as HTMLInputElement;

    expect(input.value).toEqual("#0000ff");
  });

  it("should transform non-hex default color to hex color", () => {
    const { getByTestId } = render(<TestHarness defaultValue="blue" />);

    const input = getByTestId("input") as HTMLInputElement;

    expect(input.value).toEqual("#0000ff");
  });

  it("should prioritize persisted vaclue over default value", () => {
    const { getByTestId } = render(
      <TestHarness defaultValue="green" persistedValue="blue" />,
    );

    const input = getByTestId("input") as HTMLInputElement;

    expect(input.value).toEqual("#0000ff");
  });

  it("should not be in changed state when no value has been set", () => {
    const { getByTestId } = render(<TestHarness />);
    const input = getByTestId("input") as HTMLInputElement;

    expect(input.getAttribute("data-has-changed")).toEqual("false");
  });

  it("should be in changed state when a value has been set", () => {
    const { getByTestId } = render(<TestHarness persistedValue="black" />);
    const input = getByTestId("input") as HTMLInputElement;

    expect(input.getAttribute("data-has-changed")).toEqual("true");
  });

  it("should be in changed state when a default value has been set", () => {
    const { getByTestId } = render(<TestHarness defaultValue="black" />);
    const input = getByTestId("input") as HTMLInputElement;

    expect(input.getAttribute("data-has-changed")).toEqual("true");
  });

  it("should not be in changed state when the value has been cleared from an event", () => {
    const { getByTestId } = render(
      <TestHarness persistedValue="black" type="string" />,
    );
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "" } });

    expect(input.getAttribute("data-has-changed")).toEqual("false");
  });

  it("should not be in changed state when the value has been cleared via updated props", () => {
    const { getByTestId, rerender } = render(
      <TestHarness persistedValue="black" />,
    );
    const input = getByTestId("input") as HTMLInputElement;

    rerender(<TestHarness persistedValue={undefined} />);

    expect(input.getAttribute("data-has-changed")).toEqual("false");
  });

  it("shouldnt confirm when blurring if the value hasnt changed", () => {
    const onConfirm = vi.fn();
    const { getByTestId } = render(<TestHarness onConfirm={onConfirm} />);
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.blur(input);

    expect(input.getAttribute("data-has-changed")).toEqual("false");
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
