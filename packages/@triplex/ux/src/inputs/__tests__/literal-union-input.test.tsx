/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiteralUnionInput } from "../literal-union-input";

const TestHarness = (testProps: {
  defaultValue?: string;
  onChange?: (value?: string | number | boolean) => void;
  onConfirm?: (value?: string | number | boolean) => void;
  persistedValue?: string;
  required?: boolean;
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

  it("should callback with undefined when optional", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getByTestId } = render(
      <TestHarness
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue="bar"
      />,
    );
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "" } });

    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it("should not callback when required", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getByTestId } = render(
      <TestHarness
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue="bar"
        required
      />,
    );
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "" } });

    expect(onChange).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("should delete via backspace when optional", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getByTestId } = render(
      <TestHarness
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue="bar"
      />,
    );
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.keyDown(input, { key: "Backspace" });

    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it("should hide clear option when required", () => {
    const { getByTestId } = render(
      <TestHarness persistedValue="bar" required />,
    );

    expect(getByTestId("input").children[0]).toMatchInlineSnapshot(`
      <option
        selected=""
        value="0"
      >
        bar
      </option>
    `);
  });

  it("should show clear option when optional", () => {
    const { getByTestId } = render(<TestHarness persistedValue="bar" />);

    expect(getByTestId("input").children[0]).toMatchInlineSnapshot(`
      <option
        value=""
      >
        Clear prop value.
      </option>
    `);
  });

  it("should show reset option when optional and default value exists", () => {
    const { getByTestId } = render(
      <TestHarness defaultValue="foo" persistedValue="bar" />,
    );

    expect(getByTestId("input").children[0]).toMatchInlineSnapshot(`
      <option
        value=""
      >
        Clear and use default value "foo".
      </option>
    `);
  });
});
