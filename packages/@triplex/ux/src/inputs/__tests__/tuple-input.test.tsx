/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { type Type } from "@triplex/server";
import { describe, expect, it, vi } from "vitest";
import { NumberInput } from "../number-input";
import { TupleInput } from "../tuple-input";

const TestHarness = (testProps: {
  defaultValue?: unknown[];
  onChange?: (value?: unknown[]) => void;
  onConfirm?: (value?: unknown[]) => void;
  persistedValue?: unknown[] | unknown;
  required?: boolean;
  values?: Type[];
}) => (
  <TupleInput
    onChange={vi.fn()}
    onConfirm={vi.fn()}
    path="<foo>"
    persistedValue={undefined}
    values={[{ kind: "number" }, { kind: "number" }]}
    {...testProps}
  >
    {({ prop, ...props }) => (
      <NumberInput
        actionId="assetsdrawer_assets"
        name="number"
        persistedValue={
          "value" in prop.prop ? (prop.prop.value as number) : undefined
        }
        {...props}
      >
        {(props) => (
          <input
            {...props}
            data-testid="input"
            required={prop.prop.required}
            type="number"
          />
        )}
      </NumberInput>
    )}
  </TupleInput>
);

describe("tuple input", () => {
  it("should callback on change for optional items", () => {
    const onChange = vi.fn();
    const { getAllByTestId } = render(<TestHarness onChange={onChange} />);
    const inputs = getAllByTestId("input") as HTMLInputElement[];

    fireEvent.change(inputs[0], { target: { value: "1" } });

    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("should change callback if no required items are missing", () => {
    const onChange = vi.fn();
    const { getAllByTestId } = render(
      <TestHarness
        onChange={onChange}
        values={[
          { kind: "number", required: false },
          { kind: "number", required: true },
        ]}
      />,
    );
    const inputs = getAllByTestId("input") as HTMLInputElement[];

    fireEvent.change(inputs[1], { target: { value: "1" } });

    expect(onChange).toHaveBeenCalledWith([undefined, 1]);
  });

  it("should confirm callback if no required items are missing", () => {
    const onConfirm = vi.fn();
    const { getAllByTestId } = render(
      <TestHarness
        onConfirm={onConfirm}
        values={[
          { kind: "number", required: false },
          { kind: "number", required: true },
        ]}
      />,
    );
    const inputs = getAllByTestId("input") as HTMLInputElement[];

    fireEvent.change(inputs[1], { target: { value: "1" } });
    fireEvent.blur(inputs[1]);

    expect(onConfirm).toHaveBeenCalledWith([undefined, 1]);
  });

  it("should not callback if some required items are missing", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getAllByTestId } = render(
      <TestHarness
        onChange={onChange}
        onConfirm={onConfirm}
        values={[
          { kind: "number", required: false },
          { kind: "number", required: true },
        ]}
      />,
    );
    const inputs = getAllByTestId("input") as HTMLInputElement[];

    fireEvent.change(inputs[0], { target: { value: "1" } });
    fireEvent.blur(inputs[0]);

    expect(onChange).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("should callback if the input is optional and all values are undefined even if items are required", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getAllByTestId } = render(
      <TestHarness
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={[1, 2]}
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
      />,
    );
    const inputs = getAllByTestId("input") as HTMLInputElement[];

    fireEvent.change(inputs[0], { target: { value: "" } });
    fireEvent.change(inputs[1], { target: { value: "" } });
    fireEvent.blur(inputs[1]);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it("should force items to be optional if parent is optional and no values are defined", () => {
    const { getAllByTestId } = render(
      <TestHarness
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
      />,
    );
    const inputs = getAllByTestId("input") as HTMLInputElement[];

    inputs.forEach((input) => expect(input.required).toBeFalsy());
  });

  it("should set items to respect their required flag if parent is optional and some values are defined", () => {
    const { getAllByTestId } = render(
      <TestHarness
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
      />,
    );
    const inputs = getAllByTestId("input") as HTMLInputElement[];

    fireEvent.change(inputs[0], { target: { value: "1" } });

    inputs.forEach((input) => expect(input.required).toBeTruthy());
  });

  it("should respect the required flag if the parent is required", () => {
    const { getAllByTestId } = render(
      <TestHarness
        required
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
      />,
    );
    const inputs = getAllByTestId("input") as HTMLInputElement[];

    inputs.forEach((input) => expect(input.required).toBeTruthy());
  });

  it("should respect the required flag if the parent switches to be required", () => {
    const { getAllByTestId, rerender } = render(
      <TestHarness
        required={false}
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
      />,
    );

    rerender(
      <TestHarness
        required
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
      />,
    );
    const inputs = getAllByTestId("input") as HTMLInputElement[];

    inputs.forEach((input) => expect(input.required).toBeTruthy());
  });

  it("should set initial values from default prop", () => {
    const { getAllByTestId } = render(
      <TestHarness
        defaultValue={[1, 2]}
        required={false}
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
      />,
    );
    const inputs = getAllByTestId("input") as HTMLInputElement[];

    expect(inputs[0].value).toBe("1");
    expect(inputs[1].value).toBe("2");
  });

  it("should modify initial values set by default value", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { getAllByTestId } = render(
      <TestHarness
        defaultValue={[1, 2]}
        onChange={onChange}
        onConfirm={onConfirm}
        required={false}
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
      />,
    );
    const inputs = getAllByTestId("input") as HTMLInputElement[];

    fireEvent.change(inputs[0], { target: { value: "3" } });
    fireEvent.blur(inputs[0]);

    expect(onChange).toHaveBeenCalledWith([3, 2]);
    expect(onConfirm).toHaveBeenCalledWith([3, 2]);
  });
});
