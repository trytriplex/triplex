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
}) => (
  <ColorInput
    actionId="assetsdrawer_assets"
    name="color"
    onChange={vi.fn()}
    onConfirm={vi.fn()}
    {...testProps}
  >
    {(props) => <input {...props} data-testid="input" type="color" />}
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

  it("should confirm on blur after setting default value of black", () => {
    const confirm = vi.fn();
    const change = vi.fn();
    const { getByTestId } = render(
      <TestHarness onChange={change} onConfirm={confirm} />,
    );
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledWith("#000000");
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
});
