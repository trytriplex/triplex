/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiteralUnionInput } from "../literal-union-input";

const TestHarness = (testProps: {
  defaultValue?: string;
  onChange?: (value?: string | number | boolean) => void;
  onConfirm?: (value?: string | number | boolean) => void;
  persistedValue?: string;
}) => (
  <LiteralUnionInput
    actionId="assetsdrawer_assets"
    name="string"
    onChange={vi.fn()}
    onConfirm={vi.fn()}
    values={[
      { kind: "string", literal: "bar" },
      { kind: "string", literal: "foo" },
    ]}
    {...testProps}
  >
    {({ options, ...props }) => (
      <select {...props} data-testid="input">
        {options.map((option) => (
          <option key={option[1]} value={option[1]}>
            {option[0]}
          </option>
        ))}
      </select>
    )}
  </LiteralUnionInput>
);

describe("literal union input", () => {
  it("should set persisted value", () => {
    const { getByTestId } = render(<TestHarness persistedValue="foo" />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("1");
  });

  it("should set default value", () => {
    const { getByTestId } = render(<TestHarness defaultValue="bar" />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("0");
  });

  it("should prefer persisted value over default value", () => {
    const { getByTestId } = render(
      <TestHarness defaultValue="bar" persistedValue="foo" />,
    );

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("1");
  });

  it("should update default value", () => {
    const { getByTestId, rerender } = render(
      <TestHarness defaultValue="bar" />,
    );

    rerender(<TestHarness defaultValue="foo" />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("1");
  });

  it("should update persisted value", () => {
    const { getByTestId, rerender } = render(
      <TestHarness persistedValue="bar" />,
    );

    rerender(<TestHarness persistedValue="foo" />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("1");
  });
});
