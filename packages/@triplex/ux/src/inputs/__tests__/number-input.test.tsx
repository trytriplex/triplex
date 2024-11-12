/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NumberInput } from "../number-input";

const TestHarness = (testProps: {
  defaultValue?: number;
  onChange?: (value?: number) => void;
  onConfirm?: (value?: number) => void;
  persistedValue?: number;
}) => (
  <NumberInput
    actionId="assetsdrawer_assets"
    name="number"
    onChange={vi.fn()}
    onConfirm={vi.fn()}
    {...testProps}
  >
    {(props) => <input {...props} data-testid="input" type="number" />}
  </NumberInput>
);

describe("number input", () => {
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
