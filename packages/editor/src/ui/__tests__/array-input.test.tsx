/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { TupleInput } from "../array-input";

describe("array input", () => {
  afterEach(cleanup);

  it("should callback on change", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <TupleInput
        column={0}
        line={0}
        values={[{ kind: "number" }, { kind: "number" }]}
        value={[1, 2]}
        name="array"
        path="/box.tsx"
        onChange={change}
        onConfirm={confirm}
      />
    );
    const result = getByTestId("number-1");

    fireEvent.change(result, { target: { valueAsNumber: 3 } });

    expect(change).toHaveBeenCalledWith([3, 2]);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("should callback on blur from any input", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <TupleInput
        column={0}
        line={0}
        values={[{ kind: "number" }, { kind: "number" }]}
        value={[5, 6]}
        name="array"
        path="/box.tsx"
        onChange={change}
        onConfirm={confirm}
      />
    );
    const result = getByTestId("number-5");

    fireEvent.blur(result, { target: { valueAsNumber: 100 } });

    expect(confirm).toHaveBeenCalledWith([100, 6]);
  });

  it("should not callback when required and values are partially undefined", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <TupleInput
        column={0}
        line={0}
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
        value={[99, 100]}
        name="array"
        path="/box.tsx"
        onChange={change}
        onConfirm={confirm}
      />
    );

    const element = getByTestId("number-99");

    fireEvent.change(element, { target: { value: "" } });
    fireEvent.blur(element, { target: { value: "" } });

    expect(confirm).not.toBeCalled();
    expect(change).not.toHaveBeenCalled();
  });

  it("should callback when required and after being filled with numbers", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <TupleInput
        column={0}
        line={0}
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
        value={[200, 201]}
        name="array"
        path="/box.tsx"
        onChange={change}
        onConfirm={confirm}
      />
    );

    const first = getByTestId("number-200");
    const second = getByTestId("number-201");

    fireEvent.change(first, { target: { value: "" } });
    fireEvent.blur(first, { target: { value: "" } });
    fireEvent.change(second, { target: { value: "" } });
    fireEvent.blur(second, { target: { value: "" } });
    fireEvent.change(first, { target: { value: 1 } });
    fireEvent.blur(first, { target: { value: 1 } });
    fireEvent.change(second, { target: { value: 2 } });
    fireEvent.blur(second, { target: { value: 2 } });

    expect(change).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledWith([1, 2]);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledWith([1, 2]);
  });

  it("should callback when optional", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <TupleInput
        column={0}
        line={0}
        values={[{ kind: "number" }, { kind: "number" }]}
        value={[22, 33]}
        name="array"
        path="/box.tsx"
        onChange={change}
        onConfirm={confirm}
      />
    );
    const first = getByTestId("number-22");

    fireEvent.change(first, { target: { value: "" } });
    fireEvent.blur(first, { target: { value: "" } });

    expect(change).toHaveBeenCalledWith([undefined, 33]);
    expect(confirm).toHaveBeenCalledWith([undefined, 33]);
  });

  it("should remove optional undefined values from right to left until hitting a defined value", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <TupleInput
        column={0}
        line={0}
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
          { kind: "string" },
        ]}
        value={[66, 77, undefined]}
        name="array"
        path="/box.tsx"
        onChange={change}
        onConfirm={confirm}
      />
    );
    const first = getByTestId("number-66");

    fireEvent.change(first, { target: { value: 101 } });
    fireEvent.blur(first, { target: { value: 101 } });

    expect(change).toHaveBeenCalledWith([101, 77]);
    expect(confirm).toHaveBeenCalledWith([101, 77]);
  });

  it("should remove optional undefined values from right to left until hitting a defined value", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <TupleInput
        column={0}
        line={0}
        values={[
          { kind: "number", required: true },
          { kind: "number", required: false },
          { kind: "number", required: true },
          { kind: "string" },
        ]}
        value={[888, undefined, 999, undefined]}
        name="array"
        path="/box.tsx"
        onChange={change}
        onConfirm={confirm}
      />
    );
    const first = getByTestId("number-888");

    fireEvent.change(first, { target: { value: 666 } });
    fireEvent.blur(first, { target: { value: 666 } });

    expect(change).toHaveBeenCalledWith([666, undefined, 999]);
    expect(confirm).toHaveBeenCalledWith([666, undefined, 999]);
  });

  it("should set the first value of the tuple when the value is not an array", () => {
    const { getByTestId } = render(
      <TupleInput
        column={0}
        line={0}
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
        value={1}
        name="array"
        path="/box.tsx"
        onChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    const element = getByTestId("number-1") as HTMLInputElement;

    expect(element.valueAsNumber).toEqual(1);
  });

  it("should not callback when partial values after switching from single value", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <TupleInput
        column={0}
        line={0}
        testId="position"
        values={[
          { kind: "number", required: true },
          { kind: "number", required: true },
          { kind: "number", required: true },
        ]}
        value={1}
        name="array"
        path="/box.tsx"
        onChange={change}
        onConfirm={confirm}
      />
    );
    const element = getByTestId("position[1]") as HTMLInputElement;

    fireEvent.change(element, { target: { value: 10 } });

    expect(change).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });
});
