/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ArrayInput } from "../array-input";

describe("array input", () => {
  it("should callback on change", () => {
    const change = vi.fn();
    const confirm = vi.fn();
    const { getByTestId } = render(
      <ArrayInput
        column={0}
        line={0}
        values={[
          { type: "number", value: 1 },
          { type: "number", value: 2 },
        ]}
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
      <ArrayInput
        column={0}
        line={0}
        values={[
          { type: "number", value: 5 },
          { type: "number", value: 6 },
        ]}
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
      <ArrayInput
        column={0}
        line={0}
        values={[
          { type: "number", value: 99, required: true },
          { type: "number", value: 100, required: true },
        ]}
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
      <ArrayInput
        column={0}
        line={0}
        values={[
          { type: "number", value: 200, required: true },
          { type: "number", value: 201, required: true },
        ]}
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
      <ArrayInput
        column={0}
        line={0}
        values={[
          { type: "number", value: 22 },
          { type: "number", value: 33 },
        ]}
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
      <ArrayInput
        column={0}
        line={0}
        values={[
          { type: "number", value: 66, required: true },
          { type: "number", value: 77, required: true },
          { type: "string", value: undefined },
        ]}
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
      <ArrayInput
        column={0}
        line={0}
        values={[
          { type: "number", value: 888, required: true },
          { type: "number", value: undefined },
          { type: "number", value: 999, required: true },
          { type: "string", value: undefined },
        ]}
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
});
